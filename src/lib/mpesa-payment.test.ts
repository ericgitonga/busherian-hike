import { describe, expect, it } from "vitest";
import { parseMpesaPayment } from "./mpesa-payment";

const validInput = {
  registrationId: "test-id",
  payerPhone: "0712345678",
  mpesaCode: "SFH3XXXXXX",
};

describe("parseMpesaPayment", () => {
  it("accepts a fully valid submission", () => {
    const result = parseMpesaPayment(validInput);
    expect(result.success).toBe(true);
  });

  it("strips stray whitespace/punctuation pasted alongside the code", () => {
    const result = parseMpesaPayment({ ...validInput, mpesaCode: " SFH3-XXX XXX! " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mpesaCode).toBe("SFH3XXXXXX");
    }
  });

  it("rejects an empty M-Pesa code", () => {
    const result = parseMpesaPayment({ ...validInput, mpesaCode: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.mpesaCode).toBeDefined();
    }
  });

  it("rejects a code that's only punctuation once sanitized", () => {
    const result = parseMpesaPayment({ ...validInput, mpesaCode: "---" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.mpesaCode).toBeDefined();
    }
  });

  it("rejects a malformed payer phone number", () => {
    const result = parseMpesaPayment({ ...validInput, payerPhone: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.payerPhone).toBeDefined();
    }
  });

  it("rejects a missing registration id", () => {
    const result = parseMpesaPayment({ ...validInput, registrationId: "" });
    expect(result.success).toBe(false);
  });
});
