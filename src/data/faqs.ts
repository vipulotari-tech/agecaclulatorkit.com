export type FAQ = {
  question: string;
  /** Plain text answer for JSON-LD and fallback */
  answer: string;
  /** Optional HTML answer with internal links for UI (if omitted, answer is used) */
  answerHtml?: string;
};

export const faqs: FAQ[] = [
  {
    question: "How do I calculate my exact age?",
    answer:
      "Enter your date of birth (day, month, year) and choose the date you want to calculate your age at — it defaults to today. Press Calculate Age. The age calculator shows your exact age in years, months and days, plus totals like age in days and your next birthday.",
    answerHtml:
      'Enter your <strong>date of birth</strong> (day, month, year) and choose the date you want to calculate your age at — it defaults to today. Press Calculate Age. The <strong>age calculator</strong> shows your <strong>exact age</strong> in years, months and days, plus totals like <strong>age in days</strong> and your next birthday. For the steps behind the result, see <a href="/how-it-works/" class="text-link underline underline-offset-4">how age is calculated</a>.',
  },
  {
    question: "How does an age calculator calculate age?",
    answer:
      "It treats both dates as calendar dates and walks the calendar forward. It counts completed years first (adjusted if your birthday has not occurred yet this year), then completed months with borrowing, then remaining days using the exact days in the previous month. Leap years are handled with the Gregorian rule, so February is 28 or 29 days as needed. It never just divides total days by 365.",
    answerHtml:
      'It treats both dates as calendar dates and walks the calendar forward. It counts completed years first (adjusted if your birthday has not occurred yet this year), then completed months with borrowing, then remaining days using the exact days in the previous month. Leap years are handled with the Gregorian rule, so February is 28 or 29 days as needed. It never just divides total days by 365. Learn more on <a href="/how-it-works/" class="text-link underline underline-offset-4">how age is calculated</a>.',
  },
  {
    question: "Can I calculate my age from my date of birth?",
    answer:
      "Yes. This is an age calculator by date of birth: enter your date of birth and the reference date to see your chronological age. It works as an exact age calculator and date of birth calculator, showing years, months and days instantly.",
    answerHtml:
      'Yes. This is an <strong>age calculator by date of birth</strong>: enter your <strong>date of birth</strong> and the reference date on the <a href="/" class="text-link underline underline-offset-4">age calculator</a> to see your chronological age. It works as an <strong>exact age calculator</strong> and <strong>date of birth calculator</strong>, showing years, months and days instantly.',
  },
  {
    question: "Can I calculate my age on a specific date?",
    answer:
      "Yes. Use “Calculate Age At” to select any valid past, present, or future date. The calculator will determine your age on that date in years, months and days. If the date is before your birth date, it shows an error instead of a negative age.",
    answerHtml:
      'Yes. Use “Calculate Age At” on the <a href="/" class="text-link underline underline-offset-4">age calculator</a> to select any valid past, present, or future <strong>age on a specific date</strong>. The online age calculator will determine your age on that date in years, months and days. If the date is before your birth date, it shows an error instead of a negative age.',
  },
  {
    question: "How old am I today?",
    answer:
      "Enter your date of birth and leave “Calculate Age At” set to today — it defaults to your current local date. Press Calculate Age to see how old you are in years, months and days, plus total days and your next birthday.",
    answerHtml:
      'Enter your date of birth and leave “Calculate Age At” set to today — it defaults to your current local date. Press Calculate Age on the <a href="/" class="text-link underline underline-offset-4">age calculator</a> to see <strong>how old you are</strong> in years, months and days, plus total days and your next birthday.',
  },
  {
    question: "How is age calculated in years, months, and days?",
    answer:
      "By walking the calendar: completed years first (borrowing a year if your birthday has not occurred yet), then completed months (borrowing 12 months if needed), then remaining days borrowing the exact days in the previous month of the reference date. This handles different month lengths correctly, unlike dividing total days by 365.",
  },
  {
    question: "How many days old am I?",
    answer:
      "Calculate your age and check the detailed breakdown. Total days are counted from your date of birth to the reference date at UTC midnight and divided by 86,400,000 milliseconds. The card also shows total weeks, hours, minutes and seconds derived from that count.",
    answerHtml:
      'Calculate your age and check the detailed breakdown. <strong>Age in days</strong> is counted from your date of birth to the reference date at UTC midnight and divided by 86,400,000 milliseconds. The card also shows <strong>age in weeks</strong>, <strong>age in hours</strong>, minutes and seconds derived from that count. See <a href="/how-it-works/" class="text-link underline underline-offset-4">how age is calculated</a> for the assumptions.',
  },
  {
    question: "Can an age calculator calculate my age in weeks, hours, minutes, and seconds?",
    answer:
      "Yes. After you calculate, the breakdown shows age in weeks (total days divided by 7), age in days, age in hours (days times 24), age in minutes and age in seconds. All are derived from whole calendar days at UTC midnight, so daylight saving does not shift the result.",
  },
  {
    question: "How does the calculator handle leap years?",
    answer:
      "It uses the Gregorian rule: a year is a leap year if divisible by 4, not by 100 unless also by 400. February is 29 days in leap years and 28 otherwise. This leap year age calculator logic ensures month-end borrowing and the next-birthday countdown stay accurate across any span.",
  },
  {
    question: "How is a February 29 birthday handled?",
    answer:
      "For this site, February 29 birthdays use February 28 as the anniversary in non-leap years for both calendar age and the birthday countdown. In leap years, February 29 is used exactly. For example, February 29, 2000 to February 28, 2001 is treated as 1 year.",
    answerHtml:
      'For this site, a <strong>February 29 birthday</strong> uses February 28 as the anniversary in non-leap years for both calendar age and the countdown. In leap years, February 29 is used exactly. For example, February 29, 2000 to February 28, 2001 is treated as 1 year. Try the <a href="/birthday-calculator/" class="text-link underline underline-offset-4">birthday calculator</a> to see it.',
  },
  {
    question: "Can I calculate my age for a past date?",
    answer:
      "Yes. Set “Calculate Age At” to any past date, such as 1 January 2010, to see how old you were then. The same calendar logic applies — completed years, then months, then days with real month lengths — so you get the exact age on that historical date.",
  },
  {
    question: "Can I calculate my age for a future date?",
    answer:
      "Yes. Set a future date to see how old you will be then. The free age calculator works forward as well, handling leap years and varying month lengths accurately. If the future date is before your birth date, it shows a clear error instead of a negative age.",
  },
  {
    question: "What happens if my date of birth is today?",
    answer:
      "If your date of birth equals the calculation date, your age is 0 years, 0 months, 0 days. The next birthday shows 0 days remaining with a full progress bar and a celebration message, and your zodiac and weekday are still shown.",
  },
  {
    question: "How do I find my next birthday?",
    answer:
      "Enter your date of birth in the birthday calculator to see your next birthday date, its weekday, and days remaining with a progress bar. It also shows your previous birthday, current age in years months days, and zodiac sign, with February 29 handled on February 28 in common years.",
    answerHtml:
      'Enter your date of birth in the <a href="/birthday-calculator/" class="text-link underline underline-offset-4">birthday calculator</a> to see your next birthday date, its weekday, and days remaining with a progress bar. It also shows your previous birthday, current age in years months days, and zodiac sign, with February 29 handled on February 28 in common years. On the main <a href="/" class="text-link underline underline-offset-4">age calculator</a> the same card appears after you calculate.',
  },
  {
    question: "How many days are left until my next birthday?",
    answer:
      "The next birthday card shows days remaining to your next birthday. If today is your birthday it shows 0 days and a celebration. For February 29 birthdays it counts to February 28 in non-leap years, so the birthday countdown stays intuitive.",
    answerHtml:
      'The next birthday card shows <strong>days left until your next birthday</strong>. If today is your birthday it shows 0 days and a celebration. For February 29 birthdays it counts to February 28 in non-leap years, so the <strong>birthday countdown</strong> stays intuitive. Use the <a href="/birthday-calculator/" class="text-link underline underline-offset-4">next birthday calculator</a> for a focused view.',
  },
  {
    question: "Can I use an age calculator on my phone?",
    answer:
      "Yes. This online age calculator is mobile-friendly with large touch targets, responsive cards and full keyboard support. It works on small phones, tablets, laptops and desktops without horizontal scrolling, and respects reduced-motion and accessibility preferences for comfortable use on any device.",
  },
  {
    question: "Is the age calculator free to use?",
    answer:
      "Yes. It is a free age calculator and free online age calculator with no sign-up or payment. All calculations run locally in your browser, and you can use the birthday calculator and date difference calculator the same way without any limits or subscriptions.",
  },
  {
    question: "Does the age calculator store my date of birth?",
    answer:
      "The calculation runs in your browser and we do not store your date of birth in a server database. For convenience, recent dates can be saved in your browser's localStorage until you reset the tool or clear site data. If you use a shareable URL containing dates, those parameters travel with the URL when it is opened.",
  },
  {
    question: "What is the difference between calendar age and total days?",
    answer:
      "Calendar age is the familiar years, months and days using real month lengths — for example, 25 years, 4 months, 3 days. Total days is the elapsed count of whole calendar days between the two dates, which is then used to derive weeks, hours, minutes and seconds. One is human-friendly, the other is a pure count.",
    answerHtml:
      'Calendar age is the familiar years, months and days using real month lengths — for example, 25 years, 4 months, 3 days. Total days is the elapsed count of whole calendar days between the two dates, which is then used to derive weeks, hours, minutes and seconds. One is human-friendly, the other is a pure count. See <a href="/how-it-works/" class="text-link underline underline-offset-4">how age is calculated</a> for the assumptions.',
  },
  {
    question: "How accurate is an online age calculator?",
    answer:
      "Very accurate for calendar dates when it uses real month lengths and leap-year rules, as this exact age calculator does. Total days and derived hours or minutes assume each calendar day is 24 hours at UTC midnight, so daylight saving does not shift the result. For legal or official use, verify independently.",
    answerHtml:
      'Very accurate for calendar dates when it uses real month lengths and leap-year rules, as this <strong>exact age calculator</strong> does. Total days and derived hours or minutes assume each calendar day is 24 hours at UTC midnight, so daylight saving does not shift the result. For legal or official use, verify independently. See the <a href="/disclaimer/" class="text-link underline underline-offset-4">disclaimer</a> for details.',
  },
];

// Homepage uses 6–8 most useful; spec recommends these 8
export const homepageFaqIndices = [0, 1, 3, 9, 6, 13, 15, 16];

export function homepageFaqs(): FAQ[] {
  return homepageFaqIndices.map((i) => faqs[i]);
}

export function faqAnswerPlain(f: FAQ): string {
  return f.answer;
}
