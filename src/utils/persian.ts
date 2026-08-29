/**
 * Persian typography, Real Dynamic Jalali Date System, and Validation Utilities
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

export function toEnglishDigits(input: string | null | undefined): string {
  if (!input) return '';
  let str = input.toString();
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), ENGLISH_DIGITS[i]);
    // Also Arabic digits
    str = str.replace(new RegExp(String.fromCharCode(1632 + i), 'g'), ENGLISH_DIGITS[i]);
  }
  return str;
}

export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const SCHOOL_MONTHS = [
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
  'فروردین',
  'اردیبهشت',
  'خرداد',
];

export const MONTH_NAMES = SCHOOL_MONTHS;

const PERSIAN_WEEK_DAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه',
];

/**
 * Standard Gregorian to Jalali Conversion Algorithm
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 0) days = (days - 1) % 365;
  const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return [jy, jm, jd];
}

/**
 * Standard Jalali to Gregorian Conversion Algorithm
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = (jy <= 979) ? 621 : 1600;
  jy -= (jy <= 979) ? 0 : 979;
  let days = (365 * jy) + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 13 && days >= sal_a[gm]) {
    days -= sal_a[gm];
    gm++;
  }
  const gd = days + 1;
  return [gy, gm, gd];
}

export interface JalaliDateInfo {
  year: number;
  month: number;
  day: number;
  monthName: string;
  dayName: string;
  formattedString: string;
  persianString: string;
}

/**
 * Returns structured information for a given Date object (defaulting to current date)
 */
export function getJalaliDateInfo(dateInput?: Date | string | number): JalaliDateInfo {
  const date = dateInput ? new Date(dateInput) : new Date();
  const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const monthName = PERSIAN_MONTHS[jm - 1] || 'مهر';
  const dayName = PERSIAN_WEEK_DAYS[date.getDay()] || 'شنبه';
  const mm = String(jm).padStart(2, '0');
  const dd = String(jd).padStart(2, '0');
  const formattedString = `${jy}/${mm}/${dd}`;
  const persianString = toPersianDigits(formattedString);

  return {
    year: jy,
    month: jm,
    day: jd,
    monthName,
    dayName,
    formattedString,
    persianString,
  };
}

/**
 * Dynamic Real Jalali Date (Formatted with Persian Digits, e.g. ۱۴۰۴/۰۶/۰۵)
 * Calculates from the real current JavaScript date.
 */
export function getCurrentJalaliDate(dateInput?: Date): string {
  const info = getJalaliDateInfo(dateInput);
  return info.persianString;
}

/**
 * English digits Jalali date for internal storage or sorting (e.g. 1404/06/05)
 */
export function getEnglishJalaliDate(dateInput?: Date): string {
  const info = getJalaliDateInfo(dateInput);
  return info.formattedString;
}

/**
 * Returns the current active Jalali month name (e.g. مهر, آبان, شهریور...)
 */
export function getCurrentJalaliMonthName(dateInput?: Date): string {
  return getJalaliDateInfo(dateInput).monthName;
}

/**
 * Returns the current Jalali year number (e.g. 1404)
 */
export function getCurrentJalaliYear(dateInput?: Date): number {
  return getJalaliDateInfo(dateInput).year;
}

/**
 * Returns full Persian date string, e.g. "چهارشنبه ۵ شهریور ۱۴۰۴"
 */
export function formatJalaliFullDate(dateInput?: Date | string): string {
  const info = getJalaliDateInfo(dateInput ? new Date(dateInput) : undefined);
  return `${info.dayName} ${toPersianDigits(info.day)} ${info.monthName} ${toPersianDigits(info.year)}`;
}

/**
 * Returns current Academic Year Label, e.g. "سال تحصیلی ۱۴۰۴–۱۴۰۵"
 */
export function getCurrentAcademicYearName(dateInput?: Date): string {
  const { year, month } = getJalaliDateInfo(dateInput);
  if (month >= 7) {
    return `سال تحصیلی ${toPersianDigits(year)}–${toPersianDigits(year + 1)}`;
  } else {
    return `سال تحصیلی ${toPersianDigits(year - 1)}–${toPersianDigits(year)}`;
  }
}

/**
 * Intelligently orders school months so the current active month is prominent
 */
export function getOrderedSchoolMonths(currentMonthOverride?: string): string[] {
  const activeMonth = currentMonthOverride || getCurrentJalaliMonthName();
  
  // If activeMonth is in school months, ensure it is available and ordered
  if (SCHOOL_MONTHS.includes(activeMonth)) {
    const activeIdx = SCHOOL_MONTHS.indexOf(activeMonth);
    // Return months with current first, then previous months in reverse, then remaining upcoming
    const pastAndCurrent = SCHOOL_MONTHS.slice(0, activeIdx + 1).reverse();
    const future = SCHOOL_MONTHS.slice(activeIdx + 1);
    return [...pastAndCurrent, ...future];
  }

  return [...SCHOOL_MONTHS];
}

export function getGradeColorClass(score: number): string {
  if (score >= 18) return 'text-emerald-600 dark:text-emerald-400 font-bold';
  if (score >= 15) return 'text-blue-600 dark:text-blue-400 font-bold';
  if (score >= 12) return 'text-amber-600 dark:text-amber-400 font-bold';
  return 'text-rose-600 dark:text-rose-400 font-bold';
}

/**
 * Standard Iranian National Code (کد ملی) Validation Algorithm
 */
export function validateIranianNationalId(code: string): { isValid: boolean; message?: string } {
  const cleanCode = toEnglishDigits(code).trim();
  
  if (!cleanCode) {
    return { isValid: false, message: 'لطفاً کد ملی را وارد کنید.' };
  }
  
  if (!/^\d{10}$/.test(cleanCode)) {
    return { isValid: false, message: 'کد ملی باید دقیقاً ۱۰ رقم باشد.' };
  }
  
  // Check for repetitive all-same digits like 1111111111, 0000000000
  if (/^(\d)\1{9}$/.test(cleanCode)) {
    return { isValid: false, message: 'کد ملی واردشده نامعتبر است.' };
  }
  
  const check = parseInt(cleanCode.charAt(9), 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCode.charAt(i), 10) * (10 - i);
  }
  
  const remainder = sum % 11;
  const isValid = (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
  
  if (!isValid) {
    return { isValid: false, message: 'کد ملی واردشده بر اساس الگوریتم ثبت احوال معتبر نیست.' };
  }
  
  return { isValid: true };
}

/**
 * Normalizes Persian strings for fuzzy searching (unifying Ye/Kaf and spaces)
 */
export function normalizePersianText(str: string): string {
  if (!str) return '';
  return str
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/‌/g, ' ') // half-space to space
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

/**
 * Formats a score out of 20 with 2 decimal places and Persian digits
 */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) return '-';
  const formatted = score % 1 === 0 ? score.toString() : score.toFixed(2);
  return toPersianDigits(formatted);
}

/**
 * Returns qualitative label for an Iranian grade
 */
export function getGradeQualityLabel(score: number): { label: string; color: string; badgeBg: string } {
  if (score >= 18) {
    return { label: 'عالی', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
  } else if (score >= 15) {
    return { label: 'بسیار خوب', color: 'text-blue-600 dark:text-blue-400', badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
  } else if (score >= 12) {
    return { label: 'خوب', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
  } else if (score >= 10) {
    return { label: 'قابل قبول', color: 'text-yellow-600 dark:text-yellow-400', badgeBg: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' };
  } else {
    return { label: 'نیاز به تلاش', color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
  }
}

export const getGradeLabel = getGradeQualityLabel;

export const SAMPLE_STUDENT_CSV = `کد ملی,نام,نام خانوادگی,نام پدر,کلاس,شماره همراه ولی
0080000001,علی,رضایی,محسن,کلاس هفتم الف,09121112233
0080000002,محمد,حسینی,علیرضا,کلاس هفتم الف,09122223344
0080000003,امیرحسین,محمدی,مهدی,کلاس هفتم الف,09123334455
0080000004,سینا,کریمی,حسین,کلاس هفتم ب,09124445566
0080000005,پارسا,احمدی,جعفر,کلاس هشتم الف,09125556677`;
