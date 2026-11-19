import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import bounded_runner as runner

class RunnerTests(unittest.TestCase):
    def execute(self, code, **kwargs):
        with tempfile.TemporaryDirectory() as folder:
            result = Path(folder)/'result.json'
            data = runner.run([sys.executable, '-c', code], kwargs.pop('timeout', 5), result, Path(folder)/'log', **kwargs)
            self.assertEqual(json.loads(result.read_text()), data)
            return data

    def test_completed_child_after_suspend_jump_is_invalid(self):
        # Real OS child has already exited 0 before controller sees the jump.
        real_popen = subprocess.Popen
        def completed(*args, **kwargs):
            child = real_popen(*args, **kwargs)
            # Only the runner's owned test child must have completed before polling.
            # Waiting for diagnostic PIPE children before communicate() can deadlock.
            if kwargs.get('start_new_session'):
                child.wait()
            return child
        with patch.object(runner.subprocess, 'Popen', completed), patch.object(runner.os, 'getpgid', side_effect=lambda pid: pid):
            ticks = iter([0, 61, 61])
            data = self.execute('pass', timeout=60, clock=lambda: next(ticks), clock_name='injected-suspend')
        self.assertEqual(data['raw_exit'], 0)
        self.assertEqual(data['reported_exit'], 125)
        self.assertEqual(data['validity'], 'SLEEP-INVALID')
        self.assertTrue(data['timeout'])

    def test_sleep_delta_invalidates_completed_success_below_deadline(self):
        real_popen = subprocess.Popen
        def completed(*args, **kwargs):
            child = real_popen(*args, **kwargs)
            # Only the runner's owned test child must have completed before polling.
            # Waiting for diagnostic PIPE children before communicate() can deadlock.
            if kwargs.get('start_new_session'):
                child.wait()
            return child
        ticks = iter([0, 6, 6])
        with patch.object(runner.subprocess, 'Popen', completed), patch.object(runner.os, 'getpgid', side_effect=lambda pid: pid), patch.object(runner, 'absolute_clock', return_value=('synthetic_absolute', lambda: 0), create=True), patch.object(runner, 'sleep_events', return_value={'events': [], 'sleep_events': []}, create=True):
            data = self.execute('pass', timeout=60, clock=lambda: next(ticks), clock_name='synthetic_continuous')
        self.assertEqual(data['raw_exit'], 0)
        self.assertEqual(data['reported_exit'], 125)
        self.assertEqual(data['validity'], 'SLEEP-INVALID')
        self.assertEqual(data['sleep_delta'], 6)

    def test_healthy_and_nonzero(self):
        self.assertEqual(self.execute('pass')['reported_exit'], 0)
        self.assertEqual(self.execute('raise SystemExit(7)')['reported_exit'], 7)

    def test_active_deadline_only_signals_owned_group(self):
        real_kill = runner.os.killpg
        with patch.object(runner.os, 'killpg', wraps=real_kill) as kill:
            data = self.execute('import time; time.sleep(20)', timeout=0.2)
        self.assertTrue(data['timeout'])
        self.assertEqual(data['reported_exit'], 124)
        self.assertLess(data['raw_exit'], 0)
        self.assertTrue(kill.called)
        self.assertTrue(all(call.args[0] == data['pgid'] for call in kill.call_args_list))
        self.assertNotEqual(data['pgid'], runner.os.getpgrp())

if __name__ == '__main__':
    unittest.main(verbosity=2)
