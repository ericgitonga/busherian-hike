import { describe, expect, it } from "vitest";
import { buildConfirmationMessage } from "./confirmation-message";

describe("buildConfirmationMessage", () => {
  it("includes the registrant's name and the event date", () => {
    const message = buildConfirmationMessage("Wanjiru Kamau");
    expect(message).toContain("Wanjiru Kamau");
    expect(message).toContain("19 September 2026");
  });

  it("names the event \"Ngong Hills Hike & After Party\", not the old AHS/AGHS phrasing (issue #88)", () => {
    const message = buildConfirmationMessage("Wanjiru Kamau");
    expect(message).toContain("Ngong Hills Hike & After Party");
    expect(message).not.toContain("AHS/AGHS alumni Ngong Hills hike");
  });
});
