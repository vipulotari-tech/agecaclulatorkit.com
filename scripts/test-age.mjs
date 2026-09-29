import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const outDir = resolve(".tmp-age-tests");
rmSync(outDir, { recursive: true, force: true });

try {
  execFileSync(process.execPath, [
    "node_modules/typescript/bin/tsc",
    "src/utils/age.ts",
    "--target", "ES2022",
    "--module", "ES2022",
    "--moduleResolution", "bundler",
    "--outDir", outDir,
    "--skipLibCheck"
  ], { stdio: "inherit" });

  const age = await import(pathToFileURL(resolve(outDir, "age.js")).href);

  const cases = [
    [{ year: 2026, month: 1, day: 31 }, { year: 2026, month: 3, day: 1 }, { years: 0, months: 1, days: 1 }],
    [{ year: 2026, month: 1, day: 31 }, { year: 2026, month: 2, day: 28 }, { years: 0, months: 1, days: 0 }],
    [{ year: 2000, month: 2, day: 29 }, { year: 2001, month: 2, day: 28 }, { years: 1, months: 0, days: 0 }],
    [{ year: 2024, month: 2, day: 29 }, { year: 2025, month: 3, day: 1 }, { years: 1, months: 0, days: 1 }],
    [{ year: 2025, month: 8, day: 31 }, { year: 2025, month: 9, day: 30 }, { years: 0, months: 1, days: 0 }],
    [{ year: 2026, month: 9, day: 29 }, { year: 2026, month: 9, day: 29 }, { years: 0, months: 0, days: 0 }],
  ];

  for (const [start, end, expected] of cases) {
    assert.deepEqual(age.calculateCalendarAge(start, end), expected, `${JSON.stringify(start)} -> ${JSON.stringify(end)}`);
  }

  assert.equal(
    age.calculateCalendarAge({ year: 2026, month: 3, day: 1 }, { year: 2026, month: 1, day: 31 }),
    null,
    "Age calculation should reject a reference date before DOB."
  );

  const diff = age.calculateDateDifference(
    { year: 2026, month: 9, day: 29 },
    { year: 2026, month: 9, day: 30 }
  );
  assert.equal(diff.totalDays, 1);
  assert.equal(diff.inclusiveDays, 2);
  assert.equal(diff.weekdaysInclusive + diff.weekendDaysInclusive, diff.inclusiveDays);

  const reversed = age.calculateDateDifference(
    { year: 2026, month: 9, day: 30 },
    { year: 2026, month: 9, day: 29 }
  );
  assert.equal(reversed.isReversed, true);
  assert.equal(reversed.totalDays, 1);

  console.log("Age/date regression tests passed.");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
