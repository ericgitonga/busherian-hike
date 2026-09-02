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


def test_breadcrumb_links_back_to_home():
    """Regression coverage for issue #102: /payments had no way back to the homepage short of
    editing the URL."""
    with browser_page() as page:
        page.goto("/payments")
        page.get_by_test_id("payments-breadcrumb-item").click()
        page.get_by_test_id("registration-form").wait_for(state="visible")


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


def test_resend_sms_button_works_once_mpesa_proof_is_submitted():
    """Regression coverage for issue #96: the organiser can resend the confirmation SMS on
    request once a hiker has submitted M-Pesa proof — the button only appears once there's a
    payer phone to send to."""
    pin = _read_organiser_pin()
    unique_name = f"E2E Resend {uuid.uuid4().hex[:8]}"
    with browser_page() as page:
        _register_test_hiker(page, unique_name, guest_count="0")
        page.get_by_test_id("field-payerPhone").fill("0712345678")
        page.get_by_test_id("field-mpesaCode").fill("SFH3XXXXXX")
        page.get_by_test_id("submit-mpesa-payment").click()
        page.wait_for_url("**/confirmation")

        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")
        page.get_by_test_id("payments-search").fill(unique_name)

        row = page.get_by_test_id("payment-row").filter(has_text=unique_name)
        row.wait_for(state="visible")
        resend_button = row.get_by_test_id("payment-row-resend-sms")
        resend_button.wait_for(state="visible")
        resend_button.click()

        # A test row's resend is a no-op skip (issue #97), not a real send — the button just
        # needs to round-trip back to its clickable label rather than get stuck "Resending…".
        resend_button.get_by_text("Resend SMS").wait_for(state="visible")


def test_resend_sms_button_absent_before_mpesa_proof_is_submitted():
    pin = _read_organiser_pin()
    unique_name = f"E2E NoProof {uuid.uuid4().hex[:8]}"
    with browser_page() as page:
        _register_test_hiker(page, unique_name, guest_count="0")

        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")
        page.get_by_test_id("payments-search").fill(unique_name)

        row = page.get_by_test_id("payment-row").filter(has_text=unique_name)
        row.wait_for(state="visible")
        assert row.get_by_test_id("payment-row-resend-sms").count() == 0


def test_delete_requires_confirmation_and_removes_the_row():
    """Regression coverage for issue #98: deleting a registration is a two-step action (Delete
    then Confirm delete), and the row is gone from the list afterward."""
    pin = _read_organiser_pin()
    unique_name = f"E2E Delete {uuid.uuid4().hex[:8]}"
    with browser_page() as page:
        _register_test_hiker(page, unique_name, guest_count="0")

        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")
        page.get_by_test_id("payments-search").fill(unique_name)

        row = page.get_by_test_id("payment-row").filter(has_text=unique_name)
        row.wait_for(state="visible")
        row.get_by_test_id("payment-row-delete").click()

        confirm_button = row.get_by_test_id("payment-row-delete-confirm")
        confirm_button.wait_for(state="visible")
        # Clicking Delete alone must not have removed anything yet — only Confirm delete does.
        assert page.get_by_test_id("payment-row").filter(has_text=unique_name).count() == 1
        confirm_button.click()

        page.get_by_test_id("payment-row").filter(has_text=unique_name).wait_for(state="detached")


def test_delete_cancel_leaves_the_row_in_place():
    pin = _read_organiser_pin()
    unique_name = f"E2E DeleteCancel {uuid.uuid4().hex[:8]}"
    with browser_page() as page:
        _register_test_hiker(page, unique_name, guest_count="0")

        page.goto("/payments")
        page.get_by_test_id("payments-pin-input").fill(pin)
        page.get_by_test_id("payments-pin-submit").click()
        page.get_by_test_id("payments-search").wait_for(state="visible")
        page.get_by_test_id("payments-search").fill(unique_name)

        row = page.get_by_test_id("payment-row").filter(has_text=unique_name)
        row.wait_for(state="visible")
        row.get_by_test_id("payment-row-delete").click()
        row.get_by_test_id("payment-row-delete-cancel").click()

        row.get_by_test_id("payment-row-delete").wait_for(state="visible")


def test_deleting_a_paid_registration_frees_its_capacity():
    """Regression coverage for issue #98's capacity requirement: deleting a paid registration
    must free up the slots it was consuming, not leave the public counter permanently short."""
    pin = _read_organiser_pin()
    unique_name = f"E2E DeleteCapacity {uuid.uuid4().hex[:8]}"
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

        after_paid = page.request.get("/api/capacity").json()["remaining"]
        assert before - after_paid == 2  # the registrant plus their 1 guest

        row.get_by_test_id("payment-row-delete").click()
        row.get_by_test_id("payment-row-delete-confirm").click()
        page.get_by_test_id("payment-row").filter(has_text=unique_name).wait_for(state="detached")

        after_delete = page.request.get("/api/capacity").json()["remaining"]
        assert after_delete == before  # the 2 slots are freed back up


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
    test_breadcrumb_links_back_to_home,
    test_correct_pin_unlocks_payments,
    test_marking_paid_covers_registrant_and_guests,
    test_marking_paid_is_idempotent_and_shown_on_refresh,
    test_resend_sms_button_works_once_mpesa_proof_is_submitted,
    test_resend_sms_button_absent_before_mpesa_proof_is_submitted,
    test_delete_requires_confirmation_and_removes_the_row,
    test_delete_cancel_leaves_the_row_in_place,
    test_deleting_a_paid_registration_frees_its_capacity,
    test_inline_export_downloads_full_dataset_csv,
    test_inline_export_wrong_pin_rejected,
]

if __name__ == "__main__":
    run_tests(TESTS)
