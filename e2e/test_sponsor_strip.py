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
        text = strip.inner_text()
        assert "Vecarian Plant" in text
        assert "Eric Gitonga" in text


def test_sponsor_strip_links_eric_gitonga_to_his_site():
    with browser_page() as page:
        page.goto("/")
        strip = page.get_by_test_id("sponsor-strip")
        strip.wait_for(state="visible")
        link = strip.get_by_role("link", name="Eric Gitonga")
        assert link.get_attribute("href") == "https://eric-gitonga-links.vercel.app/"


TESTS = [
    test_sponsor_strip_shows_confirmed_sponsors,
    test_sponsor_strip_links_eric_gitonga_to_his_site,
]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"PASS {t.__name__}")
