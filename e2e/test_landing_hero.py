"""E2E coverage for the landing-page hero section (issue #56).

Fixed UI copy, not data-driven — safe to assert the literal hero copy here, unlike registration
counts which come from the live database.
"""

from _common import browser_page


def test_hero_shows_event_name_and_hosts():
    with browser_page() as page:
        page.goto("/")
        heading = page.get_by_role("heading", name="Ngong Hills Hike and Socials")
        heading.wait_for(state="visible")

        tagline = page.get_by_test_id("hero-tagline")
        tagline.wait_for(state="visible")
        # CSS `uppercase` renders (and Playwright's inner_text() reflects) this text in caps.
        assert "msimalize mshahara" in tagline.inner_text().lower()


def test_hero_highlights_mention_mbuzi_and_dj():
    with browser_page() as page:
        page.goto("/")
        highlights = page.get_by_test_id("hero-highlights")
        highlights.wait_for(state="visible")
        text = highlights.inner_text()
        assert "Mbuzi" in text
        assert "DJ Stretch" in text


def test_hero_pricing_shows_both_ticket_types_at_same_price():
    with browser_page() as page:
        page.goto("/")
        hike_card = page.get_by_test_id("pricing-card-hike_and_socials")
        socials_card = page.get_by_test_id("pricing-card-socials_only")
        hike_card.wait_for(state="visible")
        socials_card.wait_for(state="visible")

        hike_text = hike_card.inner_text()
        socials_text = socials_card.inner_text()
        assert "KES 1500" in hike_text
        assert "KES 1500" in socials_text
        assert "medal" in hike_text.lower()
        assert "medal" not in socials_text.lower()


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
    test_hero_shows_event_name_and_hosts,
    test_hero_highlights_mention_mbuzi_and_dj,
    test_hero_pricing_shows_both_ticket_types_at_same_price,
    test_venue_info_states_impala_clubs_role,
]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"PASS {t.__name__}")
