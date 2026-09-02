"""E2E coverage for the privacy notice and next-of-kin hint (issue #9)."""

from _common import browser_page, run_tests


def test_privacy_link_navigates_to_notice():
    """The homepage's own footer link was removed (issue #102) — the registration form's
    next-of-kin hint is the one remaining path to this page."""
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("next-of-kin-privacy-link").click()
        content = page.get_by_test_id("privacy-content")
        content.wait_for(state="visible")
        assert "Luchiri Omoto" in content.inner_text()
        assert "30 days" in content.inner_text()
        assert "Ngong Hills Hike & After Party" in content.inner_text()
        assert "Ngong Hills Hike & After Party" in page.title()


def test_next_of_kin_hint_visible_on_registration_form():
    with browser_page() as page:
        page.goto("/")
        hint = page.get_by_test_id("next-of-kin-hint")
        hint.wait_for(state="visible")
        assert "Emergency contact only" in hint.inner_text()


def test_footer_privacy_link_removed():
    """Regression coverage for issue #102: the stale standalone footer link is gone now that
    the registration form's own Acknowledgement checkbox links to /terms (which covers data
    protection more comprehensively) just before the submit button."""
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("submit-registration").wait_for(state="visible")
        assert page.get_by_test_id("privacy-link").count() == 0


TESTS = [
    test_privacy_link_navigates_to_notice,
    test_next_of_kin_hint_visible_on_registration_form,
    test_footer_privacy_link_removed,
]

if __name__ == "__main__":
    run_tests(TESTS)
