"""E2E coverage for the privacy notice and next-of-kin hint (issue #9)."""

from _common import browser_page, run_tests


def test_privacy_link_navigates_to_notice():
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("privacy-link").click()
        content = page.get_by_test_id("privacy-content")
        content.wait_for(state="visible")
        assert "Luchiri Omoto" in content.inner_text()
        assert "30 days" in content.inner_text()


def test_next_of_kin_hint_visible_on_registration_form():
    with browser_page() as page:
        page.goto("/")
        hint = page.get_by_test_id("next-of-kin-hint")
        hint.wait_for(state="visible")
        assert "Emergency contact only" in hint.inner_text()


TESTS = [
    test_privacy_link_navigates_to_notice,
    test_next_of_kin_hint_visible_on_registration_form,
]

if __name__ == "__main__":
    run_tests(TESTS)
