import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("renders a header row followed by each row's values in column order", () => {
    const csv = toCsv(
      [{ id: "1", name: "Wanjiru" }, { id: "2", name: "Otieno" }],
      ["id", "name"],
    );
    expect(csv).toBe("id,name\r\n1,Wanjiru\r\n2,Otieno");
  });

  it("quotes and escapes a value containing a comma", () => {
    const csv = toCsv([{ name: "Kamau, Njoroge" }], ["name"]);
    expect(csv).toBe('name\r\n"Kamau, Njoroge"');
  });

  it("quotes and doubles internal quotes", () => {
    const csv = toCsv([{ name: 'Wa "Bester" Njeri' }], ["name"]);
    expect(csv).toBe('name\r\n"Wa ""Bester"" Njeri"');
  });

  it("renders null/undefined as an empty field", () => {
    const csv = toCsv([{ email: null }], ["email"]);
    expect(csv).toBe("email\r\n");
  });
});
