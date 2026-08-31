import { describe, expect, it } from "vitest";
import { sendConfirmation } from "./confirmation";

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
  });
});
