"""E2E coverage for the Terms and Conditions page and the registration form's Acknowledgement
and Declaration / Photograph and Media Consent sections (issue #94)."""

from _common import browser_page, run_tests


def test_terms_link_navigates_to_terms_page():
    with browser_page() as page:
        page.goto("/")
        # The link opens in a new tab (target="_blank") since it sits inside the registration
        # form, which the participant shouldn't lose their in-progress entries by navigating
        # away from.
        with page.context.expect_page() as new_page_info:
            page.get_by_test_id("field-termsAccepted").locator(
                "xpath=following-sibling::span//a"
            ).click()
        terms_page = new_page_info.value
        terms_page.wait_for_load_state()
        content = terms_page.get_by_test_id("terms-content")
        content.wait_for(state="visible")
        text = content.inner_text()
        assert "Ngong Hills Hike" in text
        assert "Acceptance of these terms" in text
        assert "Photography, video and audio recording" in text
        assert "Data protection and privacy" in text
        assert "Terms and Conditions" in terms_page.title()


def test_acknowledgement_and_media_consent_sections_visible():
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("field-termsAccepted").wait_for(state="visible")
        page.get_by_test_id("media-consent-yes").wait_for(state="visible")
        page.get_by_test_id("media-consent-no").wait_for(state="visible")

        # Neither option is pre-selected — the source waiver requires an explicit choice.
        assert not page.get_by_test_id("media-consent-yes").is_checked()
        assert not page.get_by_test_id("media-consent-no").is_checked()
        assert not page.get_by_test_id("field-termsAccepted").is_checked()


TESTS = [
    test_terms_link_navigates_to_terms_page,
    test_acknowledgement_and_media_consent_sections_visible,
]

if __name__ == "__main__":
    run_tests(TESTS)
