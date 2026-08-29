"""E2E coverage for the PIN-gated registrations export (issue #11).

Never assert against a specific row count or attendee name here — this suite runs against the
real, shared production database, so row-level content at test time isn't predictable. Assert
against the CSV header (which columns exist) instead, not the data.
"""

import re
from pathlib import Path

from _common import browser_page, run_tests

ENV_LOCAL = Path(__file__).parent.parent / ".env.local"


def _read_organiser_pin() -> str:
    text = ENV_LOCAL.read_text()
    match = re.search(r'^ORGANISER_PIN="?([^"\n]+)"?$', text, re.MULTILINE)
    assert match, "ORGANISER_PIN not found in .env.local — run `vercel env pull .env.local`"
    return match.group(1)


def test_wrong_pin_rejected():
    with browser_page() as page:
        page.goto("/export")
        page.get_by_test_id("export-pin-input").fill("000000")
        page.get_by_test_id("export-download").click()
        error = page.get_by_test_id("export-pin-error")
        error.wait_for(state="visible")
        assert "wrong" in error.inner_text().lower()


def test_correct_pin_downloads_full_dataset_csv():
    pin = _read_organiser_pin()
    with browser_page() as page:
        page.goto("/export")
        page.get_by_test_id("export-pin-input").fill(pin)
        with page.expect_download() as download_info:
            page.get_by_test_id("export-download").click()
        download = download_info.value
        header = Path(download.path()).read_text().splitlines()[0]
        assert "next_of_kin_contact" in header
        assert "email" in header


TESTS = [test_wrong_pin_rejected, test_correct_pin_downloads_full_dataset_csv]

if __name__ == "__main__":
    run_tests(TESTS)
