"""E2E coverage for direct M-Pesa payment proof submission (issue #70, superseding the
IntaSend Payment Link/webhook — #6/#7/#35).

MPESA_RECIPIENT_PHONE/NAME (src/lib/payment.ts) are fixed UI copy, not data-driven — like the
partner/sponsor strips, safe to assert the literal values here.
"""

from _common import browser_page, run_tests

REGISTRATION_FIXTURE = {
    "field-name": "Wanjiru Kamau",
    "field-yearLeft": "2010",
    "field-guestCount": "1",
    "field-nextOfKinName": "Kamau Njoroge",
    "field-nextOfKinContact": "0712345678",
}


def _register(page) -> None:
    page.goto("/")
    for test_id, value in REGISTRATION_FIXTURE.items():
        page.get_by_test_id(test_id).fill(value)
    page.get_by_test_id("field-ageGroup").select_option("30–39")
    page.get_by_test_id("field-school").select_option("AGHS")
    page.get_by_test_id("field-termsAccepted").check()
    page.get_by_test_id("media-consent-yes").check()
    page.get_by_test_id("field-isTestRow").check()
    page.get_by_test_id("submit-registration").click()
    page.get_by_test_id("registration-success").wait_for(state="visible")


def test_mpesa_payment_instructions_show_recipient():
    with browser_page() as page:
        _register(page)
        success = page.get_by_test_id("registration-success")
        text = success.inner_text()
        assert "0723893192" in text
        assert "Jessica Rutto" in text


def test_mpesa_payment_golden_path():
    with browser_page() as page:
        _register(page)
        page.get_by_test_id("field-payerPhone").fill("0712345678")
        page.get_by_test_id("field-mpesaCode").fill("SFH3XXXXXX")
        page.get_by_test_id("submit-mpesa-payment").click()

        recorded = page.get_by_test_id("mpesa-payment-recorded")
        recorded.wait_for(state="visible")
        assert "recorded" in recorded.inner_text().lower()


def test_mpesa_payment_rejects_invalid_phone():
    with browser_page() as page:
        _register(page)
        page.get_by_test_id("field-payerPhone").fill("12345")
        page.get_by_test_id("field-mpesaCode").fill("SFH3XXXXXX")
        page.get_by_test_id("submit-mpesa-payment").click()

        field = page.get_by_test_id("field-payerPhone")
        error = field.locator("xpath=following-sibling::span[@role='alert']")
        error.wait_for(state="visible")
        assert page.get_by_test_id("mpesa-payment-recorded").count() == 0


def test_mpesa_payment_requires_a_code():
    with browser_page() as page:
        _register(page)
        page.get_by_test_id("field-payerPhone").fill("0712345678")
        page.get_by_test_id("submit-mpesa-payment").click()

        field = page.get_by_test_id("field-mpesaCode")
        error = field.locator("xpath=following-sibling::span[@role='alert']")
        error.wait_for(state="visible")
        assert page.get_by_test_id("mpesa-payment-recorded").count() == 0


TESTS = [
    test_mpesa_payment_instructions_show_recipient,
    test_mpesa_payment_golden_path,
    test_mpesa_payment_rejects_invalid_phone,
    test_mpesa_payment_requires_a_code,
]

if __name__ == "__main__":
    run_tests(TESTS)
