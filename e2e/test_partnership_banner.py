"""E2E coverage for the partnership banner (issue #74).

Fixed UI copy, not data-driven — safe to assert the literal banner text here, unlike
registration counts which come from the live database.
"""

from _common import browser_page, run_tests


def test_partnership_banner_names_all_three_hosts():
    with browser_page() as page:
        page.goto("/")
        banner = page.get_by_test_id("partnership-banner")
        banner.wait_for(state="visible")
        text = banner.inner_text()
        assert "ACR" in text
        assert "Jointea" in text
        assert "Socials FRFR" in text


TESTS = [
    test_partnership_banner_names_all_three_hosts,
]

if __name__ == "__main__":
    run_tests(TESTS)
