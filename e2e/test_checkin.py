"""E2E coverage for the organiser check-in PIN gate (issue #10).

Camera-based QR scanning itself isn't covered here — simulating a fake video feed with an
encoded QR frame is a meaningfully bigger lift than this suite's other golden-path specs;
verified manually instead (see the PR's test plan).
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
        page.goto("/checkin")
        page.get_by_test_id("checkin-pin-input").fill("000000")
        page.get_by_test_id("checkin-pin-submit").click()
        error = page.get_by_test_id("checkin-pin-error")
        error.wait_for(state="visible")
        assert "wrong" in error.inner_text().lower()


def test_correct_pin_unlocks_checkin():
    pin = _read_organiser_pin()
    with browser_page() as page:
        page.goto("/checkin")
        page.get_by_test_id("checkin-pin-input").fill(pin)
        page.get_by_test_id("checkin-pin-submit").click()
        summary = page.get_by_test_id("checkin-summary")
        summary.wait_for(state="visible")
        assert "checked in" in summary.inner_text()


def test_breadcrumb_links_back_to_home():
    """Regression coverage for issue #102: /checkin had no way back to the homepage short of
    editing the URL."""
    with browser_page() as page:
        page.goto("/checkin")
        page.get_by_test_id("checkin-breadcrumb-item").click()
        page.get_by_test_id("registration-form").wait_for(state="visible")


TESTS = [test_wrong_pin_rejected, test_correct_pin_unlocks_checkin, test_breadcrumb_links_back_to_home]

if __name__ == "__main__":
    run_tests(TESTS)
