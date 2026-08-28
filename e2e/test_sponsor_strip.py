"""E2E coverage for the confirmed-sponsors strip (issue #47).

Fixed UI copy, not data-driven — like the partner strip, safe to assert the literal confirmed
sponsor names/link here since SPONSORS only grows one confirmed entry at a time, not a live
dataset.
"""

from _common import browser_page


def test_sponsor_strip_shows_confirmed_sponsors():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        assert "Eric Gitonga" in strip.inner_text()


def test_sponsor_strip_shows_vecarian_plant_logo_and_link():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        # Vecarian Plant renders as a logo image (alt text), not visible text — unlike
        # Eric Gitonga, which inner_text() catches directly.
        logo = strip.get_by_alt_text("Vecarian Plant Limited")
        logo.wait_for(state="visible")
        link = strip.get_by_role("link", name="Vecarian Plant Limited")
        assert link.get_attribute("href") == "https://vecarianplant.com/"


def test_sponsor_strip_links_eric_gitonga_to_his_site():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        link = strip.get_by_role("link", name="Eric Gitonga")
        assert link.get_attribute("href") == "https://eric-gitonga-links.vercel.app/"


def test_sponsor_strip_shows_green_table_logo_and_link():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        # Green Table renders as a logo image (alt text), not visible text — unlike the
        # name-only sponsors, which inner_text() would catch directly.
        logo = strip.get_by_alt_text("The Green Table")
        logo.wait_for(state="visible")
        link = strip.get_by_role("link", name="The Green Table")
        assert link.get_attribute("href") == "https://www.thegreentablepizza.com/"


TESTS = [
    test_sponsor_strip_shows_confirmed_sponsors,
    test_sponsor_strip_shows_vecarian_plant_logo_and_link,
    test_sponsor_strip_links_eric_gitonga_to_his_site,
    test_sponsor_strip_shows_green_table_logo_and_link,
]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"PASS {t.__name__}")
