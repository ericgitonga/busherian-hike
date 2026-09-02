import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocked so an isTestRow assertion can prove the channels are never even attempted, not just
// that they happen to return false — the "unconfigured" tests below don't need this, since
// process.env.SASASIGNAL_API_TOKEN/RESEND_API_KEY are never set in the unit-test job anyway.
vi.mock("@/lib/sms", () => ({ sendSmsConfirmation: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmailConfirmation: vi.fn() }));

import { sendEmailConfirmation } from "@/lib/email";
import { sendSmsConfirmation } from "@/lib/sms";
import { sendConfirmation } from "./confirmation";

beforeEach(() => {
  vi.mocked(sendSmsConfirmation).mockReset().mockResolvedValue(false);
  vi.mocked(sendEmailConfirmation).mockReset().mockResolvedValue(false);
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
