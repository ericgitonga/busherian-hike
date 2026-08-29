"""Shared helpers for the Playwright E2E smoke suite.

Written against the Python `playwright` package (the `ds` conda env already has it installed
with browsers pre-cached), not `@playwright/test` — deliberate, so Python tooling doesn't need
a parallel npm toolchain. Specs are plain scripts (`TESTS = [...]` list of functions,
`assert`-based), run via:

    npm run build && npm start   # in one terminal
    conda run -n ds python e2e/run.py   # in another

BASE_URL overrides the default local server; CI points it at a locally built-and-started server
(see .github/workflows/e2e.yml) rather than a live Vercel Preview URL, to avoid depending on
Vercel's own deployment-webhook timing.

Never assert against `page.text_content("body")` (or any unscoped page-level text locator) on
this app. Next.js App Router embeds the full RSC hydration payload — the unfiltered underlying
data, serialized — inside a <script> tag in the page, and `textContent` includes script-tag
contents. An assertion like `"X" not in page.text_content("body")` can pass or fail for the
wrong reason regardless of what's actually rendered/filtered on screen. Scope every locator to a
`data-testid` on the actual container you care about instead.
"""

import os
import subprocess
import uuid
from contextlib import contextmanager
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000").rstrip("/")


def synthetic_client_id() -> str:
    """A fresh identifier for src/lib/rate-limit.ts's IP-keyed buckets (sent as
    X-Forwarded-For). Keeps each e2e session's rate-limit usage isolated from every other
    session's — including a concurrent/rerun CI job against the same shared database (see
    issue #28) — so no two test sessions can ever collide on the same bucket by accident.
    """
    return f"e2e-{uuid.uuid4()}"


@contextmanager
def browser_page():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            page = browser.new_page(base_url=BASE_URL)
            page.set_extra_http_headers({"x-forwarded-for": synthetic_client_id()})
            yield page
        finally:
            browser.close()


def cleanup_test_data() -> None:
    """Deletes every is_test_row=1 registration (scripts/cleanup-test-registrations.mjs).
    Shared by run.py's aggregate run and each spec's own standalone runner below, so running a
    single `python e2e/test_x.py` can't leave a stray test row behind the way only running it
    inside run.py's finally could (issue #65's fix didn't cover a lone-spec run — see #71).
    """
    cleanup = subprocess.run(
        ["npm", "run", "db:cleanup-test-data"],
        cwd=Path(__file__).parent.parent,
    )
    if cleanup.returncode != 0:
        print("WARNING: db:cleanup-test-data failed — test rows may remain in the database.")


def run_tests(tests) -> None:
    """Standalone runner for a single spec's TESTS list: `if __name__ == "__main__": run_tests(TESTS)`.
    Always cleans up afterward, pass, fail, or error.
    """
    try:
        for t in tests:
            t()
            print(f"PASS {t.__name__}")
    finally:
        cleanup_test_data()
