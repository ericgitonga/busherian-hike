"""Runs every e2e/test_*.py spec's TESTS list and reports pass/fail.

    conda run -n ds python e2e/run.py

Requires a server already running at BASE_URL (see each spec's default). Exits non-zero if any
test fails or errors, for use as a CI gate.

test_registration.py's golden path and test_rate_limit.py's throttle spec submit real rows
against whatever database TURSO_DATABASE_URL (.env.local) points to — CI's own dedicated database
(issue #28), or, for a local run, the real shared Development/Preview/Production database
(SKILL.md). Always cleaning up here, regardless of who runs the suite or from where, means it
can't be forgotten the way a separate manual/CI-only step could (issue #65).
"""

import importlib
import os
import pkgutil
import subprocess
import sys
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

SKIP_MODULES = {m for m in os.environ.get("E2E_SKIP_MODULES", "").split(",") if m}


def discover_tests():
    tests = []
    for mod_info in pkgutil.iter_modules([str(Path(__file__).parent)]):
        if not mod_info.name.startswith("test_"):
            continue
        if mod_info.name in SKIP_MODULES:
            print(f"SKIP module {mod_info.name} (E2E_SKIP_MODULES)")
            continue
        module = importlib.import_module(mod_info.name)
        tests.extend(module.TESTS)
    return tests


def main() -> int:
    tests = discover_tests()
    if not tests:
        print("No e2e tests discovered.")
        return 1

    failures = []
    try:
        for t in tests:
            label = f"{t.__module__}.{t.__name__}"
            try:
                t()
            except Exception:
                print(f"FAIL {label}")
                traceback.print_exc()
                failures.append(label)
            else:
                print(f"PASS {label}")
    finally:
        cleanup = subprocess.run(
            ["npm", "run", "db:cleanup-test-data"],
            cwd=Path(__file__).parent.parent,
        )
        if cleanup.returncode != 0:
            print("WARNING: db:cleanup-test-data failed — test rows may remain in the database.")

    print(f"\n{len(tests) - len(failures)}/{len(tests)} passed.")
    if failures:
        print("Failed:", ", ".join(failures))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
