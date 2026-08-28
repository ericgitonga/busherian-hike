import { describe, expect, it } from "vitest";
import { parseRegistration } from "./registration";

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
};

describe("parseRegistration", () => {
  it("accepts a fully valid registration", () => {
    const result = parseRegistration(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts a valid registration with an email address", () => {
    const result = parseRegistration({
      ...validInput,
      email: "wanjiru@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = parseRegistration({ ...validInput, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it("rejects an invalid school", () => {
    const result = parseRegistration({ ...validInput, school: "Somewhere Else" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.school).toBeDefined();
    }
  });

  it("accepts the socials-only ticket type", () => {
    const result = parseRegistration({ ...validInput, ticketType: "socials_only" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid ticket type", () => {
    const result = parseRegistration({ ...validInput, ticketType: "vip" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.ticketType).toBeDefined();
    }
  });

  it("rejects a malformed next-of-kin phone number", () => {
    const result = parseRegistration({
      ...validInput,
      nextOfKinContact: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.nextOfKinContact).toBeDefined();
    }
  });

  it("rejects a malformed email when one is supplied", () => {
    const result = parseRegistration({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
    }
  });

  it("rejects a guest count above the cap", () => {
    const result = parseRegistration({ ...validInput, guestCount: 11 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.guestCount).toBeDefined();
    }
  });

  it("rejects a negative guest count", () => {
    const result = parseRegistration({ ...validInput, guestCount: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.guestCount).toBeDefined();
    }
  });
});
