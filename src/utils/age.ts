/**
 * Age calculation utilities - calendar accurate
 * Treats dates as calendar dates (year/month/day) without timezone shifting.
 * Elapsed durations (total days/hours etc) assume each calendar day = 86400000ms at UTC midnight.
 * Months are NOT fixed - calendar age uses real month lengths.
 */

export type CalendarDate = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
};

export type CalendarAge = {
  years: number;
  months: number;
  days: number;
};

export type DetailedDuration = {
  totalMonths: number; // years*12 + months
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
};

export type NextBirthdayInfo = {
  date: CalendarDate;
  daysRemaining: number;
  isToday: boolean;
  weekday: string;
};

export type ZodiacInfo = {
  name: string;
  symbol: string;
  range: string;
};

// ---------- basic helpers ----------

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  // month 1-12
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

export function isValidCalendarDate(d: CalendarDate): boolean {
  if (!Number.isInteger(d.year) || !Number.isInteger(d.month) || !Number.isInteger(d.day)) return false;
  if (d.month < 1 || d.month > 12) return false;
  if (d.day < 1 || d.day > daysInMonth(d.year, d.month)) return false;
  // Reasonable range: 1900-2100 plus historical
  if (d.year < 100 || d.year > 3000) return false;
  return true;
}

export function compareCalendarDate(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function calendarDateToUTCms(d: CalendarDate): number {
  // UTC midnight for elapsed calculations - avoids DST
  return Date.UTC(d.year, d.month - 1, d.day);
}

export function formatCalendarDate(d: CalendarDate, locale = "en-US"): string {
  const date = new Date(Date.UTC(d.year, d.month - 1, d.day));
  // Use UTC to keep calendar stable
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatCalendarDateISO(d: CalendarDate): string {
  const m = String(d.month).padStart(2, "0");
  const day = String(d.day).padStart(2, "0");
  return `${d.year}-${m}-${day}`;
}

export function parseISODateToCalendarDate(iso: string): CalendarDate | null {
  // expects YYYY-MM-DD strictly
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const cd: CalendarDate = { year: y, month: m, day: d };
  return isValidCalendarDate(cd) ? cd : null;
}

// ---------- core age ----------

function addYearsClamped(date: CalendarDate, years: number): CalendarDate {
  const year = date.year + years;
  return {
    year,
    month: date.month,
    day: Math.min(date.day, daysInMonth(year, date.month)),
  };
}

function addMonthsClamped(date: CalendarDate, months: number): CalendarDate {
  const monthIndex = (date.year * 12 + (date.month - 1)) + months;
  const year = Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;
  return {
    year,
    month,
    day: Math.min(date.day, daysInMonth(year, month)),
  };
}

export function calculateCalendarAge(dob: CalendarDate, ref: CalendarDate): CalendarAge | null {
  if (!isValidCalendarDate(dob) || !isValidCalendarDate(ref)) return null;
  if (compareCalendarDate(ref, dob) < 0) return null;

  // Count the largest complete calendar units first. Month-end dates are clamped
  // to the last valid day in the target month (Jan 31 + 1 month => Feb 28/29).
  // This keeps years/months/days non-negative and makes Feb 29 anniversaries
  // consistently fall on Feb 28 in non-leap years.
  let years = ref.year - dob.year;
  let yearAnchor = addYearsClamped(dob, years);
  if (compareCalendarDate(yearAnchor, ref) > 0) {
    years -= 1;
    yearAnchor = addYearsClamped(dob, years);
  }

  let months = (ref.year - yearAnchor.year) * 12 + (ref.month - yearAnchor.month);
  let monthAnchor = addMonthsClamped(yearAnchor, months);
  if (compareCalendarDate(monthAnchor, ref) > 0) {
    months -= 1;
    monthAnchor = addMonthsClamped(yearAnchor, months);
  }

  const days = Math.floor(
    (calendarDateToUTCms(ref) - calendarDateToUTCms(monthAnchor)) / 86400000
  );

  return { years, months, days };
}

export function calculateDetailedDuration(dob: CalendarDate, ref: CalendarDate): DetailedDuration | null {
  if (!isValidCalendarDate(dob) || !isValidCalendarDate(ref)) return null;
  if (compareCalendarDate(ref, dob) < 0) return null;
  const age = calculateCalendarAge(dob, ref);
  if (!age) return null;
  const totalMs = calendarDateToUTCms(ref) - calendarDateToUTCms(dob);
  const totalDays = Math.floor(totalMs / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = age.years * 12 + age.months;
  // totalHours etc derived from totalDays (calendar days) not partial day; assumption documented: each day =24h
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const totalSeconds = totalMinutes * 60;

  return { totalMonths, totalWeeks, totalDays, totalHours, totalMinutes, totalSeconds };
}

// ---------- next birthday ----------

export function getNextBirthday(dob: CalendarDate, ref: CalendarDate): NextBirthdayInfo | null {
  if (!isValidCalendarDate(dob) || !isValidCalendarDate(ref)) return null;

  // Handle Feb 29 -> Feb 28 in non-leap years (celebration date)
  function birthdayInYear(year: number): CalendarDate {
    if (dob.month === 2 && dob.day === 29 && !isLeapYear(year)) {
      return { year, month: 2, day: 28 };
    }
    return { year, month: dob.month, day: dob.day };
  }

  let candidate = birthdayInYear(ref.year);
  let cmp = compareCalendarDate(candidate, ref);
  if (cmp < 0) {
    // already passed this year -> next year
    candidate = birthdayInYear(ref.year + 1);
  }
  // if cmp ===0 => today, daysRemaining 0, isToday true
  const daysRemaining = Math.round((calendarDateToUTCms(candidate) - calendarDateToUTCms(ref)) / 86400000);
  const weekday = new Date(Date.UTC(candidate.year, candidate.month - 1, candidate.day)).toLocaleDateString(
    "en-US",
    { weekday: "long", timeZone: "UTC" }
  );
  return {
    date: candidate,
    daysRemaining: Math.max(0, daysRemaining),
    isToday: cmp === 0,
    weekday,
  };
}

export function getPreviousBirthday(dob: CalendarDate, ref: CalendarDate): CalendarDate | null {
  if (!isValidCalendarDate(dob) || !isValidCalendarDate(ref)) return null;
  function birthdayInYear(year: number): CalendarDate {
    if (dob.month === 2 && dob.day === 29 && !isLeapYear(year)) return { year, month: 2, day: 28 };
    return { year, month: dob.month, day: dob.day };
  }
  let candidate = birthdayInYear(ref.year);
  if (compareCalendarDate(candidate, ref) > 0) {
    candidate = birthdayInYear(ref.year - 1);
  }
  return candidate;
}

// ---------- zodiac ----------

const ZODIAC: Array<{ name: string; symbol: string; range: string; start: [number, number]; end: [number, number] }> = [
  { name: "Capricorn", symbol: "♑", range: "Dec 22 – Jan 19", start: [12, 22], end: [1, 19] },
  { name: "Aquarius", symbol: "♒", range: "Jan 20 – Feb 18", start: [1, 20], end: [2, 18] },
  { name: "Pisces", symbol: "♓", range: "Feb 19 – Mar 20", start: [2, 19], end: [3, 20] },
  { name: "Aries", symbol: "♈", range: "Mar 21 – Apr 19", start: [3, 21], end: [4, 19] },
  { name: "Taurus", symbol: "♉", range: "Apr 20 – May 20", start: [4, 20], end: [5, 20] },
  { name: "Gemini", symbol: "♊", range: "May 21 – Jun 20", start: [5, 21], end: [6, 20] },
  { name: "Cancer", symbol: "♋", range: "Jun 21 – Jul 22", start: [6, 21], end: [7, 22] },
  { name: "Leo", symbol: "♌", range: "Jul 23 – Aug 22", start: [7, 23], end: [8, 22] },
  { name: "Virgo", symbol: "♍", range: "Aug 23 – Sep 22", start: [8, 23], end: [9, 22] },
  { name: "Libra", symbol: "♎", range: "Sep 23 – Oct 22", start: [9, 23], end: [10, 22] },
  { name: "Scorpio", symbol: "♏", range: "Oct 23 – Nov 21", start: [10, 23], end: [11, 21] },
  { name: "Sagittarius", symbol: "♐", range: "Nov 22 – Dec 21", start: [11, 22], end: [12, 21] },
];

export function getZodiac(dob: CalendarDate): ZodiacInfo | null {
  if (!isValidCalendarDate(dob)) return null;
  const m = dob.month;
  const d = dob.day;
  for (const z of ZODIAC) {
    const [sM, sD] = z.start;
    const [eM, eD] = z.end;
    if (sM === 12 && eM === 1) {
      // Capricorn wraps year
      if ((m === 12 && d >= sD) || (m === 1 && d <= eD)) return { name: z.name, symbol: z.symbol, range: z.range };
    } else {
      const afterStart = m > sM || (m === sM && d >= sD);
      const beforeEnd = m < eM || (m === eM && d <= eD);
      if (afterStart && beforeEnd) return { name: z.name, symbol: z.symbol, range: z.range };
    }
  }
  return null;
}

export function getWeekday(dob: CalendarDate): string | null {
  if (!isValidCalendarDate(dob)) return null;
  return new Date(Date.UTC(dob.year, dob.month - 1, dob.day)).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

// ---------- date difference (two arbitrary dates) ----------

export type DateDifference = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  inclusiveDays: number;
  weekdaysInclusive: number;
  weekendDaysInclusive: number;
  isReversed: boolean; // if start > end
  start: CalendarDate;
  end: CalendarDate;
};

export function calculateDateDifference(a: CalendarDate, b: CalendarDate): DateDifference | null {
  if (!isValidCalendarDate(a) || !isValidCalendarDate(b)) return null;
  let start = a;
  let end = b;
  let isReversed = false;
  if (compareCalendarDate(start, end) > 0) {
    start = b;
    end = a;
    isReversed = true;
  }
  const cal = calculateCalendarAge(start, end);
  if (!cal) return null;
  const totalMs = calendarDateToUTCms(end) - calendarDateToUTCms(start);
  const totalDays = Math.floor(totalMs / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const totalSeconds = totalMinutes * 60;

  const inclusiveDays = totalDays + 1;
  const fullWeeks = Math.floor(inclusiveDays / 7);
  let weekdaysInclusive = fullWeeks * 5;
  let weekendDaysInclusive = fullWeeks * 2;
  const remainder = inclusiveDays % 7;
  const startWeekday = new Date(calendarDateToUTCms(start)).getUTCDay();
  for (let i = 0; i < remainder; i += 1) {
    const weekday = (startWeekday + i) % 7;
    if (weekday === 0 || weekday === 6) weekendDaysInclusive += 1;
    else weekdaysInclusive += 1;
  }

  return {
    years: cal.years,
    months: cal.months,
    days: cal.days,
    totalDays,
    totalWeeks,
    totalHours,
    totalMinutes,
    totalSeconds,
    inclusiveDays,
    weekdaysInclusive,
    weekendDaysInclusive,
    isReversed,
    start,
    end,
  };
}

// helpers for display

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function ageToString(age: CalendarAge): string {
  const parts: string[] = [];
  if (age.years === 1) parts.push("1 Year");
  else parts.push(`${age.years} Years`);
  if (age.months === 1) parts.push("1 Month");
  else parts.push(`${age.months} Months`);
  if (age.days === 1) parts.push("1 Day");
  else parts.push(`${age.days} Days`);
  return parts.join(", ");
}
