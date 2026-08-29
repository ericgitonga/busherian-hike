import { createClient } from "@libsql/client";

// Removes every row marked is_test_row = 1 (issue #66) — set by RegistrationForm's toggle,
// itself only rendered outside production (see src/app/page.tsx), so this only ever touches rows
// nobody could mistake for a real signup. Covers both e2e/run.py's automated fixture submissions
// (which check the toggle themselves) and ad-hoc manual Preview-check submissions alike, without
// needing to know their exact field values in advance. e2e/run.py's main() always runs this
// after the suite, pass or fail (issue #65) — no separate invocation needed.

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await client.execute(
  "DELETE FROM registrations WHERE is_test_row = 1",
);

console.log(`Removed ${result.rowsAffected} test registration(s).`);
client.close();
