"""E2E coverage for the static partner-logo strip (issue #5).

Fixed UI copy, not data-driven — safe to assert the literal placeholder partner name here,
unlike registration counts which come from the live database.
"""

from _common import browser_page


def test_partner_strip_shows_placeholder_partner():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("partner-strip")
        strip.wait_for(state="visible")
        assert "Royal Nairobi Golf Club" in strip.inner_text()


TESTS = [test_partner_strip_shows_placeholder_partner]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"PASS {t.__name__}")
