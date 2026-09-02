"""E2E coverage for rate limiting on PIN-gated routes, public registration (issue #26), and
M-Pesa payment-proof submission (issue #70).

Each test below runs in its own `browser_page()` session, which _common.py already gives a
fresh synthetic X-Forwarded-For identity — so these tests never collide with each other, with
test_checkin.py/test_export.py/test_registration.py's own (much lighter) usage, or with a
concurrent/rerun CI job against the same shared database (see issue #28).
"""

import re
from pathlib import Path

from _common import BASE_URL, browser_page, run_tests, synthetic_client_id

ENV_LOCAL = Path(__file__).parent.parent / ".env.local"
WRONG_PIN = "000000"

REGISTRATION_FIXTURE = {
    "field-name": "Wanjiru Kamau",
    "field-yearLeft": "2010",
    "field-guestCount": "1",
    "field-nextOfKinName": "Kamau Njoroge",
    "field-nextOfKinContact": "0712345678",
}


def test_checkin_verify_pin_locks_out_after_repeated_wrong_attempts():
    client_id = synthetic_client_id()
    with browser_page() as page:
        statuses = []
        for _ in range(6):
            response = page.request.post(
                f"{BASE_URL}/api/checkin/verify-pin",
                data={"pin": WRONG_PIN},
                headers={"x-forwarded-for": client_id},
            )
            statuses.append(response.status)

        assert statuses[:5] == [401] * 5, f"expected 5 straight 401s, got {statuses[:5]}"
        assert statuses[5] == 429, f"expected the 6th attempt to be rate-limited, got {statuses[5]}"


def test_checkin_verify_pin_never_throttles_correct_attempts():
    # A correct PIN never consumes the failure budget (see rate-limit.ts) — and, since issue
    # #27, the first correct call also sets a session cookie that shortcuts every later call
    # around the PIN check entirely (see test_checkin_session.py). Either way, repeated calls
    # with the correct PIN must never 429 — the check-in scanner effectively does this once per
    # attendee, which would break real event-day usage within minutes otherwise.
    match = re.search(r'^ORGANISER_PIN="?([^"\n]+)"?$', ENV_LOCAL.read_text(), re.MULTILINE)
    assert match, "ORGANISER_PIN not found in .env.local — run `vercel env pull .env.local`"
    pin = match.group(1)

    client_id = synthetic_client_id()
    with browser_page() as page:
        for _ in range(8):
            response = page.request.post(
                f"{BASE_URL}/api/checkin/verify-pin",
                data={"pin": pin},
                headers={"x-forwarded-for": client_id},
            )
            assert response.status == 200, "a correct PIN was throttled — it should never be"


def test_registration_throttled_after_repeated_submissions():
    with browser_page() as page:
        last_state = None
        for _ in range(6):
            page.goto("/")
            for test_id, value in REGISTRATION_FIXTURE.items():
                page.get_by_test_id(test_id).fill(value)
            page.get_by_test_id("field-ageGroup").select_option("30–39")
            page.get_by_test_id("field-school").select_option("AGHS")
            page.get_by_test_id("field-termsAccepted").check()
            page.get_by_test_id("media-consent-yes").check()
            page.get_by_test_id("field-isTestRow").check()
            page.get_by_test_id("submit-registration").click()

            page.wait_for_selector(
                '[data-testid="registration-success"], [data-testid="registration-rate-limited"]',
                state="visible",
            )
            last_state = (
                "rate_limited"
                if page.get_by_test_id("registration-rate-limited").count()
                else "success"
            )

        assert last_state == "rate_limited", "expected the 6th submission within the window to be throttled"


def test_mpesa_submit_throttled_after_repeated_submissions():
    # Each iteration needs its own fresh, first-time registration to submit mpesa payment
    # proof against (recordMpesaPayment's idempotency guard would otherwise make submissions
    # 2-6 no-ops on the *data* side, though they'd still count against the rate limit). But
    # registration has its own 5/hour limit — reusing one identity for both calls would trip
    # *that* limit first and never reach the mpesa-submit limit this test is actually after. So
    # each registration gets its own throwaway identity, while every mpesa-submit call
    # deliberately shares one fixed identity — that's the bucket being driven to its limit.
    with browser_page() as page:
        mpesa_submit_ip = synthetic_client_id()
        last_state = None
        for i in range(6):
            page.set_extra_http_headers({"x-forwarded-for": synthetic_client_id()})
            page.goto("/")
            for test_id, value in REGISTRATION_FIXTURE.items():
                page.get_by_test_id(test_id).fill(value)
            page.get_by_test_id("field-ageGroup").select_option("30–39")
            page.get_by_test_id("field-school").select_option("AGHS")
            page.get_by_test_id("field-termsAccepted").check()
            page.get_by_test_id("media-consent-yes").check()
            page.get_by_test_id("field-isTestRow").check()
            page.get_by_test_id("submit-registration").click()
            page.get_by_test_id("registration-success").wait_for(state="visible")

            page.set_extra_http_headers({"x-forwarded-for": mpesa_submit_ip})
            page.get_by_test_id("field-payerPhone").fill("0712345678")
            page.get_by_test_id("field-mpesaCode").fill(f"SFH3XXXXX{i}")
            page.get_by_test_id("submit-mpesa-payment").click()

            page.wait_for_selector(
                '[data-testid="mpesa-payment-recorded"], [data-testid="mpesa-rate-limited"]',
                state="visible",
            )
            last_state = (
                "rate_limited"
                if page.get_by_test_id("mpesa-rate-limited").count()
                else "success"
            )

        assert last_state == "rate_limited", "expected the 6th submission within the window to be throttled"


TESTS = [
    test_checkin_verify_pin_locks_out_after_repeated_wrong_attempts,
    test_checkin_verify_pin_never_throttles_correct_attempts,
    test_registration_throttled_after_repeated_submissions,
    test_mpesa_submit_throttled_after_repeated_submissions,
]

if __name__ == "__main__":
    run_tests(TESTS)
