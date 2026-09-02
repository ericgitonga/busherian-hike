import { describe, expect, it } from "vitest";
import { parseCompleteRegistration } from "./complete-registration";

const validInput = {
  name: "Wanjiru Kamau",
  ageGroup: "30–39",
  school: "AGHS",
  yearLeft: 2010,
  guestCount: 1,
  nextOfKinName: "Kamau Njoroge",
  nextOfKinContact: "0712345678",
  needsBus: true,
  ticketType: "hike_and_socials",
  email: "",
  termsAccepted: true,
  mediaConsent: "yes",
  payerPhone: "0712345678",
  mpesaCode: "SFH3XXXXXX",
};

describe("parseCompleteRegistration", () => {
  it("accepts a fully valid combined submission", () => {
    const result = parseCompleteRegistration(validInput);
    expect(result.success).toBe(true);
  });

  // Regression coverage for issue #106: the combined schema must still enforce every rule the
  // separate registrationSchema used to, not just the M-Pesa fields bolted on.
  it("rejects a missing name", () => {
    const result = parseCompleteRegistration({ ...validInput, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it("rejects an unchecked terms acceptance", () => {
    const result = parseCompleteRegistration({ ...validInput, termsAccepted: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.termsAccepted).toBeDefined();
    }
  });

  it("strips stray whitespace/punctuation pasted alongside the M-Pesa code", () => {
    const result = parseCompleteRegistration({ ...validInput, mpesaCode: " SFH3-XXX XXX! " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mpesaCode).toBe("SFH3XXXXXX");
    }
  });

  it("rejects an empty M-Pesa code", () => {
    const result = parseCompleteRegistration({ ...validInput, mpesaCode: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.mpesaCode).toBeDefined();
    }
  });

  it("rejects a code that's only punctuation once sanitized", () => {
    const result = parseCompleteRegistration({ ...validInput, mpesaCode: "---" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.mpesaCode).toBeDefined();
    }
  });

  it("rejects a malformed payer phone number", () => {
    const result = parseCompleteRegistration({ ...validInput, payerPhone: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.payerPhone).toBeDefined();
    }
  });
});
