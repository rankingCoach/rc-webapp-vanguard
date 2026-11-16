# S0 mapped validation — 2026-11-03

**S0 is not accepted.** Fresh root reviewer and overseer follow this handoff. No dependency bump.

Ran once, serially, on `release/mui-upgrade` in the requested worktree:

```sh
bash agentic-plans/mui-upgrade-gates/gates.sh s0-mapped
bash agentic-plans/mui-upgrade-gates/coverage.sh s0-mapped
```

This fresh run is justified by the corrected source-map configuration and Mobile dialog visibility wait. Previous red runs remain red; their invalid coverage locations are not current shortfalls. No full retry, isolated test retry, package rebuild or smoke run was performed. No source/test/gate edits, thresholds/skips/timeouts changes, commits, pushes, subagents or external messages. Only this report and validation artifacts were written.

## Execution and static result

- `gates.sh`: exit **0**, elapsed **34.23s**, task-owned PID/PGID **36321**, watchdog fired **False**.
- `coverage.sh`: exit **1**, elapsed **417.85s**, task-owned PID/PGID **36462**, watchdog fired **False**.

Each runner used a new process group with a 1740-second limit and at most 10 seconds TERM grace before KILL (under 30 minutes). Neither limit fired; no process was killed. Watchdog script retained at `/tmp/mui-s0-mapped-watchdog.py`.

```text
tsc app: 1001 errors, 0 new vs master baseline
tsc lib: 4 errors, 0 new vs master baseline
tsc contract tests: 0 errors (must be 0)
lint: 1319 errors, 0 file|rule pairs worse than master baseline
```

## Full combined tests and coverage

**267 files passed; 2983 tests passed. No failed assertions.** Vitest duration 412.72s. Coverage gate exit 1 is due solely to the two per-file threshold failures below.

All **35/35 expected files** are present in both JSON summary and coverage-final, with no extras or missing files. Thresholds remain 95% lines / 85% branches per file.

Aggregate: lines 1372/1387 (98.91%), branches 1259/1316 (95.66%).

| File | Lines covered/total (%) | Branches covered/total (%) | Additional lines / branches to threshold |
|---|---:|---:|---:|
| `src/core/AIAssistant/AIAssistentPanel/AIAssistantPanel.tsx` | 84/84 (100%) | 52/55 (94.54%) | 0 / 0 |
| `src/core/Accordion/Accordion.tsx` | 14/14 (100%) | 21/21 (100%) | 0 / 0 |
| `src/core/AppBar/AppBar.tsx` | 4/4 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/Autocomplete/Autocomplete.tsx` | 140/145 (96.55%) | 132/140 (94.28%) | 0 / 0 |
| `src/core/AutocompleteWithAnchor/AutocompleteWithAnchor.tsx` | 27/27 (100%) | 11/12 (91.66%) | 0 / 0 |
| `src/core/Button/Button.tsx` | 142/142 (100%) | 216/222 (97.29%) | 0 / 0 |
| `src/core/Collapse/Collapse/Collapse.tsx` | 4/4 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/DatePicker/DatePicker.tsx` | 44/44 (100%) | 22/22 (100%) | 0 / 0 |
| `src/core/DateRangeInput/DateRangeInput.tsx` | 47/47 (100%) | 26/26 (100%) | 0 / 0 |
| `src/core/DateRangePicker/DateRangePicker.tsx` | 197/199 (98.99%) | 169/181 (93.37%) | 0 / 0 |
| `src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment.tsx` | 5/5 (100%) | 2/2 (100%) | 0 / 0 |
| `src/core/Documents/DocumentDisplay/DocumentDisplay.tsx` | 18/18 (100%) | 10/10 (100%) | 0 / 0 |
| `src/core/Documents/DocumentUpload/DocumentUpload.tsx` | 34/34 (100%) | 18/21 (85.71%) | 0 / 0 |
| `src/core/Drawer/Drawer.tsx` | 12/12 (100%) | 26/26 (100%) | 0 / 0 |
| `src/core/DropdownMenu/DropdownMenu.tsx` | 32/32 (100%) | 21/21 (100%) | 0 / 0 |
| `src/core/FlagAdornment/FlagAdornment.tsx` | 5/5 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/FormControl/FormControl.tsx` | 4/4 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/Input/Input.tsx` | 6/6 (100%) | 3/3 (100%) | 0 / 0 |
| `src/core/List/ListShowMore/ListShowMore.tsx` | 15/15 (100%) | 6/6 (100%) | 0 / 0 |
| `src/core/Menu/Menu.tsx` | 14/14 (100%) | 14/14 (100%) | 0 / 0 |
| `src/core/MenuItem/MenuItem.tsx` | 8/8 (100%) | 21/21 (100%) | 0 / 0 |
| `src/core/Popover/Popover.tsx` | 33/33 (100%) | 24/25 (96%) | 0 / 0 |
| `src/core/Popover/PopoverPopper/PopoverPopper.tsx` | 4/4 (100%) | 2/2 (100%) | 0 / 0 |
| `src/core/PopoverModal/PopoverModal.tsx` | 51/57 (89.47%) | 37/51 (72.54%) | 4 / 7 |
| `src/core/ProgressBar/ProgressBar.tsx` | 9/9 (100%) | 15/15 (100%) | 0 / 0 |
| `src/core/SearchableSelect/SearchableSelect.tsx` | 44/44 (100%) | 41/41 (100%) | 0 / 0 |
| `src/core/Select/Select.tsx` | 45/45 (100%) | 51/55 (92.72%) | 0 / 0 |
| `src/core/Slider/Slider.tsx` | 26/26 (100%) | 19/19 (100%) | 0 / 0 |
| `src/core/Snackbar/Snackbar.tsx` | 4/4 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/SnackbarRoot/SnackbarRoot.tsx` | 20/20 (100%) | 2/2 (100%) | 0 / 0 |
| `src/core/ToggleButton/ToggleButton.tsx` | 4/4 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/ToggleButtonGroup/ToggleButtonGroup.tsx` | 4/4 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/Toolbar/Toolbar.tsx` | 4/4 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/_internal/InputBase/InputBase.tsx` | 264/266 (99.24%) | 298/303 (98.34%) | 0 / 0 |
| `src/helpers/hex-to-rgba.ts` | 4/4 (100%) | 0/0 (100%) | 0 / 0 |

## Actual shortfall and exact branch maps

Only `src/core/PopoverModal/PopoverModal.tsx` fails: **51/57 lines (89.47%)**, needs 4 additional covered lines; **37/51 branches (72.54%)**, needs 7 additional covered branches. Uncovered executable lines: **78–79, 84–85, 90–91**. These are bodies of the uncalled `handleMouseEnter`, `handleMouseLeave`, and `handleClick` functions (functions 7/10), not erased TypeScript interfaces. The callbacks are declared in production source but are not attached in the returned JSX; root should review reachability and intended behavior. No remediation was attempted.

Exact uncovered branch entries copied from `coverage-final.json` below. All 14 uncovered branch slots are in these seven entries; null end columns and empty implicit-else locations are preserved verbatim.

```json
{
  "9": {
    "counts": [
      0,
      0
    ],
    "map": {
      "loc": {
        "start": {
          "line": 78,
          "column": 4
        },
        "end": {
          "line": 80,
          "column": null
        }
      },
      "type": "if",
      "locations": [
        {
          "start": {
            "line": 78,
            "column": 4
          },
          "end": {
            "line": 80,
            "column": null
          }
        },
        {
          "start": {},
          "end": {}
        }
      ],
      "line": 78
    }
  },
  "10": {
    "counts": [
      0,
      0
    ],
    "map": {
      "loc": {
        "start": {
          "line": 78,
          "column": 8
        },
        "end": {
          "line": 78,
          "column": 32
        }
      },
      "type": "binary-expr",
      "locations": [
        {
          "start": {
            "line": 78,
            "column": 8
          },
          "end": {
            "line": 78,
            "column": 23
          }
        },
        {
          "start": {
            "line": 78,
            "column": 23
          },
          "end": {
            "line": 78,
            "column": 32
          }
        }
      ],
      "line": 78
    }
  },
  "11": {
    "counts": [
      0,
      0
    ],
    "map": {
      "loc": {
        "start": {
          "line": 84,
          "column": 4
        },
        "end": {
          "line": 86,
          "column": null
        }
      },
      "type": "if",
      "locations": [
        {
          "start": {
            "line": 84,
            "column": 4
          },
          "end": {
            "line": 86,
            "column": null
          }
        },
        {
          "start": {},
          "end": {}
        }
      ],
      "line": 84
    }
  },
  "12": {
    "counts": [
      0,
      0
    ],
    "map": {
      "loc": {
        "start": {
          "line": 84,
          "column": 8
        },
        "end": {
          "line": 84,
          "column": 32
        }
      },
      "type": "binary-expr",
      "locations": [
        {
          "start": {
            "line": 84,
            "column": 8
          },
          "end": {
            "line": 84,
            "column": 23
          }
        },
        {
          "start": {
            "line": 84,
            "column": 23
          },
          "end": {
            "line": 84,
            "column": 32
          }
        }
      ],
      "line": 84
    }
  },
  "13": {
    "counts": [
      0,
      0
    ],
    "map": {
      "loc": {
        "start": {
          "line": 90,
          "column": 4
        },
        "end": {
          "line": 92,
          "column": null
        }
      },
      "type": "if",
      "locations": [
        {
          "start": {
            "line": 90,
            "column": 4
          },
          "end": {
            "line": 92,
            "column": null
          }
        },
        {
          "start": {},
          "end": {}
        }
      ],
      "line": 90
    }
  },
  "14": {
    "counts": [
      0,
      0
    ],
    "map": {
      "loc": {
        "start": {
          "line": 90,
          "column": 8
        },
        "end": {
          "line": 90,
          "column": 33
        }
      },
      "type": "binary-expr",
      "locations": [
        {
          "start": {
            "line": 90,
            "column": 8
          },
          "end": {
            "line": 90,
            "column": 24
          }
        },
        {
          "start": {
            "line": 90,
            "column": 24
          },
          "end": {
            "line": 90,
            "column": 33
          }
        }
      ],
      "line": 90
    }
  },
  "15": {
    "counts": [
      0,
      0
    ],
    "map": {
      "loc": {
        "start": {
          "line": 91,
          "column": 18
        },
        "end": {
          "line": 91,
          "column": 55
        }
      },
      "type": "cond-expr",
      "locations": [
        {
          "start": {
            "line": 91,
            "column": 29
          },
          "end": {
            "line": 91,
            "column": 36
          }
        },
        {
          "start": {
            "line": 91,
            "column": 36
          },
          "end": {
            "line": 91,
            "column": 55
          }
        }
      ],
      "line": 91
    }
  }
}
```

## Mapping audit

Inspected all 35 final coverage entries and 2886 statement/branch locations against source and TypeScript AST. No defined source line is out of file bounds and no location starts inside an interface/type alias. Empty implicit-else locations have no source coordinate. 26 synthetic statement entries end on import lines (null end columns); all are covered and do not create shortfalls. The first diagnostic audit attempted to pass synthetic coordinates to the TypeScript position API and failed; the corrected read-only audit handles those coordinates and is retained in `out/s0-mapped/mapping-audit.json`. This was artifact analysis, not a test rerun.

Slider is 100% lines and branches with corrected executable locations; DatePicker tests pass in the full combined run. PopoverModal shortfall locations directly match executable handler conditions and assignments. These checks support sensible mapping for the measured shortfall; they are not a claim of byte-by-byte source-map proof.

## Resources and retained artifacts

- gates before: 20:08  up 1 day,  8:27, 1 user, load averages: 4.86 4.96 8.06; System-wide memory free percentage: 58%
- gates after: 20:08  up 1 day,  8:28, 1 user, load averages: 5.41 5.08 7.97; System-wide memory free percentage: 59%
- coverage before: 20:08  up 1 day,  8:28, 1 user, load averages: 5.41 5.08 7.97; System-wide memory free percentage: 59%
- coverage after: 20:15  up 1 day,  8:35, 1 user, load averages: 9.38 7.87 8.14; System-wide memory free percentage: 47%

Full date/load/memory/process snapshots are retained; before/after samples do not measure continuous resource peaks. Raw coverage warnings (including asset paths) remain in the log.

Artifacts under `out/s0-mapped/`: `gates-run.log`, `coverage-run.log`, each runner’s `*-exit.txt`, `*-result.json`, `*-process.json`, `*-resources-before.txt` and `*-resources-after.txt`; static compiler/lint artifacts; `coverage/coverage-summary.json`, `coverage/coverage-final.json`; `mapping-audit.json`.

Remaining: root reviews the actual PopoverModal executable coverage gap and arranges fresh reviewer/overseer. No S0 acceptance or completion CR draft: S0 is incomplete and the plan has no ticket/PR.
