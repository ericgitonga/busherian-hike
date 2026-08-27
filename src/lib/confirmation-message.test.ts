import { describe, expect, it } from "vitest";
import { buildConfirmationMessage } from "./confirmation-message";

describe("buildConfirmationMessage", () => {
  it("includes the registrant's name and the event date", () => {
    const message = buildConfirmationMessage("Wanjiru Kamau");
    expect(message).toContain("Wanjiru Kamau");
    expect(message).toContain("19 September 2026");
  });
});
