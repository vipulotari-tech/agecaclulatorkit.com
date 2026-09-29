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
    "--ignoreConfig",
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

  // Property sweep across month ends and leap-year boundaries. This specifically
  // guards against negative day components and off-by-one elapsed durations.
  let swept = 0;
  for (let year = 1999; year <= 2032; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      for (const day of [1, 28, 29, 30, 31]) {
        const start = { year, month, day };
        if (!age.isValidCalendarDate(start)) continue;
        const startMs = age.calendarDateToUTCms(start);
        for (let delta = 0; delta <= 400; delta += 7) {
          const d = new Date(startMs + delta * 86400000);
          const end = {
            year: d.getUTCFullYear(),
            month: d.getUTCMonth() + 1,
            day: d.getUTCDate(),
          };
          const cal = age.calculateCalendarAge(start, end);
          assert.ok(cal, "Calendar age should exist for an ordered valid span.");
          assert.ok(cal.years >= 0, "Years must never be negative.");
          assert.ok(cal.months >= 0 && cal.months < 12, "Months must be normalized to 0-11.");
          assert.ok(cal.days >= 0, "Days must never be negative.");

          const span = age.calculateDateDifference(start, end);
          assert.equal(span.totalDays, delta, "Elapsed days must equal the UTC calendar-day delta.");
          assert.equal(span.weekdaysInclusive + span.weekendDaysInclusive, span.inclusiveDays);
          swept += 1;
        }
      }
    }
  }
  assert.ok(swept > 50000, "Expected broad calendar sweep coverage.");

  console.log(`Age/date regression tests passed (${swept.toLocaleString()} property cases).`);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
