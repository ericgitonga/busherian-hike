import { createClient } from "@libsql/client";

// e2e/test_registration.py's golden-path spec submits this exact fixture against whatever
// database TURSO_DATABASE_URL points to — CI's own dedicated database (issue #28), or, for a
// local run, the real shared Development/Preview/Production database (no dev/prod split for the
// app itself — see SKILL.md). Either way a leftover row would count against the real capacity
// cap (issue #4). e2e/run.py's main() always runs this after the suite, pass or fail (issue #65)
// — no separate invocation needed.
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
