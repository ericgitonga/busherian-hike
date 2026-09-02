import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocked so an isTestRow assertion can prove the channels are never even attempted, not just
// that they happen to return false — the "unconfigured" tests below don't need this, since
// process.env.SASASIGNAL_API_TOKEN/RESEND_API_KEY are never set in the unit-test job anyway.
vi.mock("@/lib/sms", () => ({ sendSmsConfirmation: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmailConfirmation: vi.fn() }));
// registrations-store touches @/lib/db, which throws at import time without TURSO_* env vars
// (deliberately unset in the unit-test job, see route.test.ts's own comment on this) — mocked
// the same way that route.test.ts mocks it.
vi.mock("@/lib/registrations-store", () => ({
  getResendSmsTarget: vi.fn(),
  updateSmsStatus: vi.fn(),
}));

import { sendEmailConfirmation } from "@/lib/email";
import {
  getResendSmsTarget,
  updateSmsStatus,
} from "@/lib/registrations-store";
import { sendSmsConfirmation } from "@/lib/sms";
import { resendSmsConfirmation, sendConfirmation } from "./confirmation";

beforeEach(() => {
  vi.mocked(sendSmsConfirmation).mockReset().mockResolvedValue(false);
  vi.mocked(sendEmailConfirmation).mockReset().mockResolvedValue(false);
  vi.mocked(getResendSmsTarget).mockReset();
  vi.mocked(updateSmsStatus).mockReset().mockResolvedValue(undefined);
});

describe("sendConfirmation", () => {
  it("no-ops every channel when no provider credentials are configured", async () => {
    const result = await sendConfirmation({
      registrationId: "test-id",
      name: "Test Hiker",
      phone: "0712345678",
    });
    expect(result).toEqual({
      smsSent: false,
      emailSent: false,
    });
  });

  it("still no-ops the email channel when an email is supplied but unconfigured", async () => {
    const result = await sendConfirmation({
      registrationId: "test-id",
      name: "Test Hiker",
      phone: "0712345678",
      email: "test@example.com",
    });
    expect(result.emailSent).toBe(false);
  });

  it("skips the email channel entirely when no email is supplied", async () => {
    const result = await sendConfirmation({
      registrationId: "test-id",
      name: "Test Hiker",
      phone: "0712345678",
    });
    expect(result.emailSent).toBe(false);
    expect(sendEmailConfirmation).not.toHaveBeenCalled();
  });

  it("skips every channel for a test row without even attempting a send, even with an email supplied", async () => {
    const result = await sendConfirmation({
      registrationId: "test-id",
      name: "Test Hiker",
      phone: "0712345678",
      email: "test@example.com",
      isTestRow: true,
    });
    expect(result).toEqual({
      smsSent: false,
      emailSent: false,
    });
    expect(sendSmsConfirmation).not.toHaveBeenCalled();
    expect(sendEmailConfirmation).not.toHaveBeenCalled();
  });
});

describe("resendSmsConfirmation", () => {
  it("reports not_found when the row has no mpesa proof submitted yet", async () => {
    vi.mocked(getResendSmsTarget).mockResolvedValue(null);
    const result = await resendSmsConfirmation("missing-id");
    expect(result).toEqual({ status: "not_found" });
    expect(sendSmsConfirmation).not.toHaveBeenCalled();
    expect(updateSmsStatus).not.toHaveBeenCalled();
  });

  it("skips a test row without attempting a real send, and records 'skipped'", async () => {
    vi.mocked(getResendSmsTarget).mockResolvedValue({
      name: "Test Hiker",
      payerPhone: "0712345678",
      isTestRow: true,
    });
    const result = await resendSmsConfirmation("test-row-id");
    expect(result).toEqual({ status: "skipped" });
    expect(sendSmsConfirmation).not.toHaveBeenCalled();
    expect(updateSmsStatus).toHaveBeenCalledWith("test-row-id", "skipped");
  });

  it("records 'sent' and returns it when the real send succeeds", async () => {
    vi.mocked(getResendSmsTarget).mockResolvedValue({
      name: "Wanjiru Kamau",
      payerPhone: "0712345678",
      isTestRow: false,
    });
    vi.mocked(sendSmsConfirmation).mockResolvedValue(true);
    const result = await resendSmsConfirmation("real-id");
    expect(result).toEqual({ status: "sent" });
    expect(updateSmsStatus).toHaveBeenCalledWith("real-id", "sent");
  });

  it("records 'failed' and returns it when the real send fails", async () => {
    vi.mocked(getResendSmsTarget).mockResolvedValue({
      name: "Wanjiru Kamau",
      payerPhone: "0712345678",
      isTestRow: false,
    });
    vi.mocked(sendSmsConfirmation).mockResolvedValue(false);
    const result = await resendSmsConfirmation("real-id");
    expect(result).toEqual({ status: "failed" });
    expect(updateSmsStatus).toHaveBeenCalledWith("real-id", "failed");
  });
});
