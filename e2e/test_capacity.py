"""E2E coverage for the public slots-remaining counter (issue #4).

Never hardcode the expected count here — this suite runs against the real, shared production
database (no dev/prod split, see SKILL.md), so the number of paid registrations at test time is
not predictable. Always derive the expectation from /api/capacity itself.
"""

from _common import browser_page, run_tests


def test_slots_remaining_matches_live_count():
    with browser_page() as page:
        resp = page.request.get("/api/capacity")
        assert resp.status == 200
        capacity = resp.json()

        page.goto("/")
        counter = page.get_by_test_id("slots-remaining")
        counter.wait_for(state="visible")
        assert str(capacity["remaining"]) in counter.inner_text()


TESTS = [test_slots_remaining_matches_live_count]

if __name__ == "__main__":
    run_tests(TESTS)
