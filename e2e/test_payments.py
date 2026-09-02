"""E2E coverage for the PIN-gated "mark paid" page (issue #82).

Camera/session-cookie mechanics mirror test_checkin.py/test_checkin_session.py's coverage —
see test_payments_session.py for the session-cookie half.
"""

import re
import uuid
from pathlib import Path

from _common import browser_page, run_tests

ENV_LOCAL = Path(__file__).parent.parent / ".env.local"


def _read_organiser_pin() -> str:
    text = ENV_LOCAL.read_text()
    match = re.search(r'^ORGANISER_PIN="?([^"\n]+)"?$', text, re.MULTILINE)
    assert match, "ORGANISER_PIN not found in .env.local — run `vercel env pull .env.local`"
    return match.group(1)


def _register_test_hiker(page, name: str, guest_count: str) -> None:
    page.goto("/")
    page.get_by_test_id("field-name").fill(name)
    page.get_by_test_id("field-ageGroup").select_option("30–39")
    page.get_by_test_id("field-school").select_option("AGHS")
    page.get_by_test_id("field-yearLeft").fill("2010")
    page.get_by_test_id("field-guestCount").fill(guest_count)
    page.get_by_test_id("field-nextOfKinName").fill("Kamau Njoroge")
    page.get_by_test_id("field-nextOfKinContact").fill("0712345678")
    page.get_by_test_id("field-termsAccepted").check()
    page.get_by_test_id("media-consent-yes").check()
    page.get_by_test_id("field-isTestRow").check()
    page.get_by_test_id("submit-registration").click()
    page.get_by_test_id("registration-success").wait_for(state="visible")


def test_wrong_pin_rejected():
    with browser_page() as page:
        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill("000000")
        page.get_by_test_id("payments-pin-submit").click()
        error = page.get_by_test_id("payments-pin-error")
        error.wait_for(state="visible")
        assert "wrong" in error.inner_text().lower()


def test_correct_pin_unlocks_payments():
    pin = _read_organiser_pin()
    with browser_page() as page:
        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")


def test_marking_paid_covers_registrant_and_guests():
    """Regression coverage for issue #82: marking one registration paid must decrement the
    public capacity counter by (1 + guest count), not just 1."""
    pin = _read_organiser_pin()
    unique_name = f"E2E Payments {uuid.uuid4().hex[:8]}"
    with browser_page() as page:
        _register_test_hiker(page, unique_name, guest_count="1")

        before = page.request.get("/api/capacity").json()["remaining"]

        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")
        page.get_by_test_id("payments-search").fill(unique_name)

        row = page.get_by_test_id("payment-row").filter(has_text=unique_name)
        row.wait_for(state="visible")
        row.get_by_test_id("payment-row-mark-paid").click()
        row.get_by_test_id("payment-row-paid-badge").wait_for(state="visible")

        after = page.request.get("/api/capacity").json()["remaining"]
        assert before - after == 2  # the registrant plus their 1 guest


def test_marking_paid_is_idempotent_and_shown_on_refresh():
    pin = _read_organiser_pin()
    unique_name = f"E2E Payments {uuid.uuid4().hex[:8]}"
    with browser_page() as page:
        _register_test_hiker(page, unique_name, guest_count="0")

        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")
        page.get_by_test_id("payments-search").fill(unique_name)

        row = page.get_by_test_id("payment-row").filter(has_text=unique_name)
        row.wait_for(state="visible")
        row.get_by_test_id("payment-row-mark-paid").click()
        row.get_by_test_id("payment-row-paid-badge").wait_for(state="visible")

        page.get_by_test_id("payments-refresh").click()
        row = page.get_by_test_id("payment-row").filter(has_text=unique_name)
        row.get_by_test_id("payment-row-paid-badge").wait_for(state="visible")
        assert row.get_by_test_id("payment-row-mark-paid").count() == 0


def test_inline_export_downloads_full_dataset_csv():
    """Regression coverage for issue #90: exporting shouldn't require leaving /payments."""
    pin = _read_organiser_pin()
    with browser_page() as page:
        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")

        page.get_by_test_id("payments-export-toggle").click()
        page.get_by_test_id("payments-export-pin-input").fill(pin)
        with page.expect_download() as download_info:
            page.get_by_test_id("payments-export-submit").click()
        download = download_info.value
        header = Path(download.path()).read_text().splitlines()[0]
        assert "next_of_kin_contact" in header
        assert "email" in header


def test_inline_export_wrong_pin_rejected():
    pin = _read_organiser_pin()
    with browser_page() as page:
        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")

        page.get_by_test_id("payments-export-toggle").click()
        page.get_by_test_id("payments-export-pin-input").fill("000000")
        page.get_by_test_id("payments-export-submit").click()
        error = page.get_by_test_id("payments-export-pin-error")
        error.wait_for(state="visible")
        assert "wrong" in error.inner_text().lower()


TESTS = [
    test_wrong_pin_rejected,
    test_correct_pin_unlocks_payments,
    test_marking_paid_covers_registrant_and_guests,
    test_marking_paid_is_idempotent_and_shown_on_refresh,
    test_inline_export_downloads_full_dataset_csv,
    test_inline_export_wrong_pin_rejected,
]

if __name__ == "__main__":
    run_tests(TESTS)
