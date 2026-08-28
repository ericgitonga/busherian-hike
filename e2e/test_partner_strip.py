"""E2E coverage for the venue partner (issue #5, confirmed as Impala Club in #44).

Fixed UI copy, not data-driven — safe to assert the literal partner name and venue-role copy
here, unlike registration counts which come from the live database.
"""

from _common import browser_page


def test_partner_strip_shows_impala_club():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("partner-strip")
        strip.wait_for(state="visible")
        # Impala Club renders as a logo image (alt text), not visible text — unlike a
        # name-only partner, which inner_text() would catch directly.
        logo = strip.get_by_alt_text("Impala Club")
        logo.wait_for(state="visible")


def test_partner_strip_links_impala_club_to_its_site():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("partner-strip")
        strip.wait_for(state="visible")
        link = strip.get_by_role("link")
        assert link.get_attribute("href") == "https://www.impalaclub.co.ke/"


def test_venue_info_states_impala_clubs_role():
    with browser_page() as page:
        page.goto("/")
        info = page.get_by_test_id("venue-info")
        info.wait_for(state="visible")
        text = info.inner_text()
        assert "Impala Club" in text
        assert "Pick-up" in text
        assert "drop-off" in text
        assert "after-party" in text
        assert "parking" in text


TESTS = [
    test_partner_strip_shows_impala_club,
    test_partner_strip_links_impala_club_to_its_site,
    test_venue_info_states_impala_clubs_role,
]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"PASS {t.__name__}")
