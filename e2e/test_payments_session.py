"""E2E coverage for the payments-page session cookie and explicit "Lock" control (issue #82),
mirroring test_checkin_session.py's coverage of the same mechanism on /checkin.
"""

import re
from pathlib import Path

from _common import BASE_URL, browser_page, run_tests

ENV_LOCAL = Path(__file__).parent.parent / ".env.local"


def _read_organiser_pin() -> str:
    text = ENV_LOCAL.read_text()
    match = re.search(r'^ORGANISER_PIN="?([^"\n]+)"?$', text, re.MULTILINE)
    assert match, "ORGANISER_PIN not found in .env.local — run `vercel env pull .env.local`"
    return match.group(1)


def test_mark_rejected_without_a_session():
    with browser_page() as page:
        response = page.request.post(
            f"{BASE_URL}/api/payments/mark",
            data={"registrationId": "does-not-matter"},
        )
        assert response.status == 401


def test_mark_authorized_by_session_cookie_after_unlock():
    pin = _read_organiser_pin()
    with browser_page() as page:
        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")

        # No PIN in the body at all — the session cookie set by verify-pin above is what
        # authorizes this call now. A nonexistent registrationId still returns 200 (mark is a
        # no-op UPDATE on an unmatched id) — matched: false is what distinguishes that from a
        # real mark-paid, same reasoning as checkin/mark (issue #38).
        response = page.request.post(
            f"{BASE_URL}/api/payments/mark",
            data={"registrationId": "does-not-exist"},
        )
        assert response.status == 200
        assert response.json()["matched"] is False


def test_lock_clears_the_session():
    pin = _read_organiser_pin()
    with browser_page() as page:
        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")

        page.get_by_test_id("payments-lock").click()
        page.get_by_test_id("payments-pin-input").wait_for(state="visible")

        response = page.request.post(
            f"{BASE_URL}/api/payments/mark",
            data={"registrationId": "does-not-matter"},
        )
        assert response.status == 401


TESTS = [
    test_mark_rejected_without_a_session,
    test_mark_authorized_by_session_cookie_after_unlock,
    test_lock_clears_the_session,
]

if __name__ == "__main__":
    run_tests(TESTS)
