"""E2E coverage for the confirmed-sponsors strip (issue #47, Impala Club moved in from the
now-removed partner strip in #74).

Fixed UI copy, not data-driven — safe to assert the literal confirmed sponsor names/link here
since SPONSORS only grows one confirmed entry at a time, not a live dataset. All confirmed
sponsors render as logo images (alt text), not visible text.
"""

from _common import browser_page, run_tests


def test_sponsor_strip_shows_eric_gitonga_logo_and_link():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        # Eric Gitonga renders as a logo image (alt text), not visible text — like Vecarian
        # Plant and Green Table, unlike before this entry had a logoSrc.
        logo = strip.get_by_alt_text("Eric Gitonga")
        logo.wait_for(state="visible")
        link = strip.get_by_role("link", name="Eric Gitonga")
        assert link.get_attribute("href") == "https://eric-gitonga-links.vercel.app/"


def test_sponsor_strip_shows_vecarian_plant_logo_and_link():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        logo = strip.get_by_alt_text("Vecarian Plant Limited")
        logo.wait_for(state="visible")
        link = strip.get_by_role("link", name="Vecarian Plant Limited")
        assert link.get_attribute("href") == "https://vecarianplant.com/"


def test_sponsor_strip_shows_green_table_logo_and_link():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        logo = strip.get_by_alt_text("The Green Table")
        logo.wait_for(state="visible")
        link = strip.get_by_role("link", name="The Green Table")
        assert link.get_attribute("href") == "https://www.thegreentablepizza.com/"


def test_sponsor_strip_shows_kayjah_design_studio_logo_and_link():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        logo = strip.get_by_alt_text("Kayjah Design Studio")
        logo.wait_for(state="visible")
        link = strip.get_by_role("link", name="Kayjah Design Studio")
        assert link.get_attribute("href") == "https://kayjah.com/"


def test_sponsor_strip_shows_impala_club_logo_and_link():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        logo = strip.get_by_alt_text("Impala Club")
        logo.wait_for(state="visible")
        link = strip.get_by_role("link", name="Impala Club")
        assert link.get_attribute("href") == "https://www.impalaclub.co.ke/"


def test_sponsor_strip_shows_zbom_logo_without_a_link():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        logo = strip.get_by_alt_text("ZBOM")
        logo.wait_for(state="visible")
        # No linkHref yet (issue #75) — must render as a plain logo, not a link.
        assert strip.get_by_role("link", name="ZBOM").count() == 0


TESTS = [
    test_sponsor_strip_shows_eric_gitonga_logo_and_link,
    test_sponsor_strip_shows_vecarian_plant_logo_and_link,
    test_sponsor_strip_shows_green_table_logo_and_link,
    test_sponsor_strip_shows_kayjah_design_studio_logo_and_link,
    test_sponsor_strip_shows_impala_club_logo_and_link,
    test_sponsor_strip_shows_zbom_logo_without_a_link,
]

if __name__ == "__main__":
    run_tests(TESTS)
