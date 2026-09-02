"""E2E coverage for the registration form (issue #2)."""

from _common import browser_page, run_tests


def test_registration_golden_path():
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("field-name").fill("Wanjiru Kamau")
        page.get_by_test_id("field-ageGroup").select_option("30–39")
        page.get_by_test_id("field-school").select_option("AGHS")
        page.get_by_test_id("field-yearLeft").fill("2010")
        page.get_by_test_id("field-guestCount").fill("1")
        page.get_by_test_id("field-nextOfKinName").fill("Kamau Njoroge")
        page.get_by_test_id("field-nextOfKinContact").fill("0712345678")
        page.get_by_test_id("field-termsAccepted").check()
        page.get_by_test_id("media-consent-yes").check()
        page.get_by_test_id("field-isTestRow").check()
        page.get_by_test_id("submit-registration").click()

        success = page.get_by_test_id("registration-success")
        success.wait_for(state="visible")
        assert "registered" in success.inner_text().lower()

        assert "KES" in success.inner_text()
        assert "M-Pesa" in success.inner_text()

        inclusions = page.get_by_test_id("fee-inclusions")
        inclusions.wait_for(state="visible")
        text = inclusions.inner_text()
        assert "Transport" in text
        assert "park" in text
        assert "shower" in text
        assert "medal" in text
        assert "Water" in text or "hydration" in text
        assert "Impala Club" in text


def test_registration_total_fee_covers_guests():
    """Regression coverage for issue #80: the amount shown must be per-hiker rate ×
    (1 + guests), not the flat per-hiker rate regardless of guest count."""
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("field-name").fill("Wanjiru Kamau")
        page.get_by_test_id("field-ageGroup").select_option("30–39")
        page.get_by_test_id("field-school").select_option("AGHS")
        page.get_by_test_id("field-yearLeft").fill("2010")
        page.get_by_test_id("field-guestCount").fill("2")
        page.get_by_test_id("field-nextOfKinName").fill("Kamau Njoroge")
        page.get_by_test_id("field-nextOfKinContact").fill("0712345678")
        page.get_by_test_id("field-termsAccepted").check()
        page.get_by_test_id("media-consent-yes").check()
        page.get_by_test_id("field-isTestRow").check()
        page.get_by_test_id("submit-registration").click()

        success = page.get_by_test_id("registration-success")
        success.wait_for(state="visible")
        text = success.inner_text()
        assert "KES 4500" in text or "KES 4,500" in text
        assert "KES 1500" not in text and "KES 1,500" not in text


def test_registration_socials_only_ticket_type():
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("field-name").fill("Wanjiru Kamau")
        page.get_by_test_id("field-ageGroup").select_option("30–39")
        page.get_by_test_id("field-school").select_option("AGHS")
        page.get_by_test_id("field-yearLeft").fill("2010")
        page.get_by_test_id("field-guestCount").fill("1")
        page.get_by_test_id("field-nextOfKinName").fill("Kamau Njoroge")
        page.get_by_test_id("field-nextOfKinContact").fill("0712345678")
        page.get_by_test_id("ticket-type-socials_only").check()
        page.get_by_test_id("field-termsAccepted").check()
        page.get_by_test_id("media-consent-no").check()
        page.get_by_test_id("field-isTestRow").check()
        page.get_by_test_id("submit-registration").click()

        success = page.get_by_test_id("registration-success")
        success.wait_for(state="visible")

        inclusions = page.get_by_test_id("fee-inclusions")
        inclusions.wait_for(state="visible")
        text = inclusions.inner_text()
        assert "Transport" not in text
        assert "medal" not in text.lower()
        assert "Pizza" in text
        assert "gift hamper" in text
        assert "Impala Club" in text


def test_registration_requires_mandatory_fields():
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("submit-registration").click()

        name_field = page.get_by_test_id("field-name")
        error = name_field.locator("xpath=following-sibling::span[@role='alert']")
        error.wait_for(state="visible")
        assert page.get_by_test_id("registration-success").count() == 0


def test_registration_requires_terms_and_media_consent():
    """Regression coverage for issue #94: registering without ticking the Acknowledgement and
    Declaration checkbox, or without picking a Photograph and Media Consent option, must fail
    validation rather than silently succeed."""
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("field-name").fill("Wanjiru Kamau")
        page.get_by_test_id("field-ageGroup").select_option("30–39")
        page.get_by_test_id("field-school").select_option("AGHS")
        page.get_by_test_id("field-yearLeft").fill("2010")
        page.get_by_test_id("field-guestCount").fill("1")
        page.get_by_test_id("field-nextOfKinName").fill("Kamau Njoroge")
        page.get_by_test_id("field-nextOfKinContact").fill("0712345678")
        page.get_by_test_id("field-isTestRow").check()
        page.get_by_test_id("submit-registration").click()

        terms_error = page.get_by_test_id("field-termsAccepted").locator(
            "xpath=ancestor::div[contains(@class, 'flex-col')][1]//span[@role='alert']"
        )
        terms_error.wait_for(state="visible")

        media_error = page.get_by_test_id("field-mediaConsent").locator(
            "xpath=descendant::span[@role='alert']"
        )
        media_error.wait_for(state="visible")

        assert page.get_by_test_id("registration-success").count() == 0


TESTS = [
    test_registration_golden_path,
    test_registration_total_fee_covers_guests,
    test_registration_socials_only_ticket_type,
    test_registration_requires_mandatory_fields,
    test_registration_requires_terms_and_media_consent,
]

if __name__ == "__main__":
    run_tests(TESTS)
