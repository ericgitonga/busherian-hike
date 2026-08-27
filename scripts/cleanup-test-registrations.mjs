import { createClient } from "@libsql/client";

// e2e/test_registration.py's golden-path spec submits this exact fixture against the real,
// shared Turso database (no dev/prod split — see SKILL.md) — every CI run on every PR would
// otherwise leave a row behind that counts against the real capacity cap (issue #4). Run after
// the e2e suite (see .github/workflows/e2e.yml) to remove it again.
const TEST_NAME = "Wanjiru Kamau";
const TEST_NEXT_OF_KIN_NAME = "Kamau Njoroge";
const TEST_NEXT_OF_KIN_CONTACT = "0712345678";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await client.execute({
  sql: `DELETE FROM registrations
        WHERE name = ? AND next_of_kin_name = ? AND next_of_kin_contact = ?`,
  args: [TEST_NAME, TEST_NEXT_OF_KIN_NAME, TEST_NEXT_OF_KIN_CONTACT],
});

console.log(`Removed ${result.rowsAffected} test registration(s).`);
client.close();
