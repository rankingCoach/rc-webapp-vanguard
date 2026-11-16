"""Owned process-group runner. CLI command follows --; never invokes a shell."""
import argparse
import ctypes
from datetime import datetime
import re
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time


def continuous_clock():
    if sys.platform == 'darwin':
        lib = ctypes.CDLL('/usr/lib/libSystem.B.dylib')
        class Timebase(ctypes.Structure):
            _fields_ = [('numer', ctypes.c_uint32), ('denom', ctypes.c_uint32)]
        base = Timebase()
        if lib.mach_timebase_info(ctypes.byref(base)) != 0 or not base.denom:
            raise RuntimeError('mach_timebase_info failed')
        lib.mach_continuous_time.restype = ctypes.c_uint64
        return 'mach_continuous_time', lambda: lib.mach_continuous_time() * base.numer / base.denom / 1e9
    if hasattr(time, 'CLOCK_BOOTTIME'):
        return 'CLOCK_BOOTTIME', lambda: time.clock_gettime(time.CLOCK_BOOTTIME)
    raise RuntimeError('No verified suspend-inclusive clock available')


def absolute_clock():
    """Active system time: deliberately excludes suspend, unlike the deadline clock."""
    if sys.platform == 'darwin':
        lib = ctypes.CDLL('/usr/lib/libSystem.B.dylib')
        class Timebase(ctypes.Structure):
            _fields_ = [('numer', ctypes.c_uint32), ('denom', ctypes.c_uint32)]
        base = Timebase()
        if lib.mach_timebase_info(ctypes.byref(base)) != 0 or not base.denom:
            raise RuntimeError('mach_timebase_info failed')
        lib.mach_absolute_time.restype = ctypes.c_uint64
        return 'mach_absolute_time', lambda: lib.mach_absolute_time() * base.numer / base.denom / 1e9
    return 'CLOCK_MONOTONIC', lambda: time.clock_gettime(time.CLOCK_MONOTONIC)


def sleep_events(start, end):
    if sys.platform != 'darwin':
        return {'events': [], 'sleep_events': [], 'available': False, 'reason': 'pmset is Darwin-only'}
    try:
        result = subprocess.run(['/usr/bin/pmset', '-g', 'log'], capture_output=True, text=True, timeout=5)
        events = []
        for line in result.stdout.splitlines():
            try:
                stamp = datetime.fromisoformat(line[:25]).timestamp()
            except ValueError:
                continue
            if int(start) <= stamp <= end and re.search(r'\b(?:Sleep|Wake|DarkWake)\b', line[25:]):
                events.append(line)
        return {'events': events, 'sleep_events': [line for line in events if re.search(r'\bSleep\s', line[25:])],
                'available': result.returncode == 0, 'exit': result.returncode}
    except (OSError, subprocess.TimeoutExpired) as error:
        return {'events': [], 'sleep_events': [], 'available': False, 'reason': str(error)}


def atomic_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode='w', dir=path.parent, delete=False) as f:
        json.dump(data, f, indent=2)
        f.flush()
        os.fsync(f.fileno())
        temporary = f.name
    os.replace(temporary, path)


def run(command, timeout, result, log, *, clock=None, clock_name=None, inhibit=False):
    if not 0 < timeout <= 1800:
        raise ValueError('timeout must be in (0, 1800]')
    if clock is None:
        clock_name, clock = continuous_clock()
    active_name, active_clock = absolute_clock()
    active_start = active_clock()
    start = clock()
    wall = time.time()
    inhibitor = None
    Path(log).parent.mkdir(parents=True, exist_ok=True)
    with open(log, 'w') as output:
        child = subprocess.Popen(command, stdout=output, stderr=subprocess.STDOUT, start_new_session=True)
        pgid = os.getpgid(child.pid)
        assert pgid == child.pid and pgid != os.getpgrp()
        if inhibit:
            inhibitor = subprocess.Popen(['/usr/bin/caffeinate', '-i', '-w', str(child.pid)])
        expired = False
        samples = []
        next_sample = start
        try:
            while child.poll() is None:
                now = clock()
                if now - start >= timeout:
                    expired = True
                    break
                if now >= next_sample:
                    samples.append({'elapsed': now-start, 'processes': subprocess.check_output(['ps', '-axo', 'pid,ppid,pgid,pcpu,rss,command'], text=True)})
                    atomic_json(str(result)+'.resources.json', samples)
                    next_sample = now + 15
                time.sleep(0.1)
            # Completion is not proof of timeliness: the controller may have slept.
            elapsed = clock() - start
            expired = expired or elapsed >= timeout
            if expired and child.poll() is None:
                os.killpg(pgid, signal.SIGTERM)
                grace = clock()
                while child.poll() is None and clock()-grace < 5:
                    time.sleep(0.1)
                # Kill remaining owned descendants even if the leader exited on TERM.
                try:
                    os.killpg(pgid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
            raw = child.wait()
            elapsed = clock() - start
            expired = expired or elapsed >= timeout
        finally:
            if inhibitor is not None:
                inhibitor.terminate()
                inhibitor.wait(timeout=5)
        active_elapsed = active_clock() - active_start
        wall_end = time.time()
        events = sleep_events(wall, wall_end)
        sleep_delta = elapsed - active_elapsed
        invalid_sleep = sleep_delta > 5 or bool(events['sleep_events'])
        reported = 125 if invalid_sleep else (124 if expired else raw)
        data = dict(command=command, clock=clock_name, elapsed=elapsed, wall_elapsed=wall_end-wall,
                    absolute_clock=active_name, absolute_elapsed=active_elapsed, sleep_delta=sleep_delta,
                    sleep_log=events, validity='SLEEP-INVALID' if invalid_sleep else 'VALID',
                    outcome='SLEEP-INVALID' if invalid_sleep else ('PASS' if reported == 0 else 'RED'),
                    raw_exit=raw, reported_exit=reported, timeout=expired,
                    pid=child.pid, pgid=pgid, inhibitor_pid=inhibitor.pid if inhibitor else None,
                    inhibitor_reaped=inhibitor.poll() is not None if inhibitor else None)
        atomic_json(result, data)
        return data


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('--timeout', type=float, required=True)
    parser.add_argument('--result', required=True)
    parser.add_argument('--log', required=True)
    parser.add_argument('--inhibit-idle', action='store_true')
    parser.add_argument('command', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    command = args.command[1:] if args.command[:1] == ['--'] else args.command
    if not command:
        parser.error('command required')
    data = run(command, args.timeout, args.result, args.log, inhibit=args.inhibit_idle)
    print(json.dumps(data), flush=True)
    return data['reported_exit']

if __name__ == '__main__':
    sys.exit(main())
