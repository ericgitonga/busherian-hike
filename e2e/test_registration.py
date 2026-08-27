"""E2E coverage for the registration form (issue #2)."""

from _common import browser_page


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
        page.get_by_test_id("submit-registration").click()

        success = page.get_by_test_id("registration-success")
        success.wait_for(state="visible")
        assert "registered" in success.inner_text().lower()

        payment_link = page.get_by_test_id("payment-link")
        payment_link.wait_for(state="visible")
        assert "KES" in payment_link.inner_text()
        assert payment_link.get_attribute("href")


def test_registration_requires_mandatory_fields():
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("submit-registration").click()

        name_field = page.get_by_test_id("field-name")
        error = name_field.locator("xpath=following-sibling::span[@role='alert']")
        error.wait_for(state="visible")
        assert page.get_by_test_id("registration-success").count() == 0


TESTS = [test_registration_golden_path, test_registration_requires_mandatory_fields]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"PASS {t.__name__}")
