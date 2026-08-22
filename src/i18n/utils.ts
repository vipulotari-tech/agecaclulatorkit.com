import { defaultLocale, locales, getLocale, type Locale } from "./config";

import en from "./translations/en.json";
import es from "./translations/es.json";
import fr from "./translations/fr.json";
import de from "./translations/de.json";
import hi from "./translations/hi.json";
import ar from "./translations/ar.json";
import ja from "./translations/ja.json";
import zh from "./translations/zh.json";

// Map of translations — add more imports as you add files
const translations: Record<string, any> = {
  en,
  es,
  fr,
  de,
  hi,
  ar,
  ja,
  zh,
};

// Fallback for unpublished locales — use English but keep flag/name
export function getTranslations(locale: string): any {
  const base = translations[defaultLocale];
  const trans = translations[locale];
  if (!trans) return base;
  // shallow merge top-level, deep for nested? do deep merge for seo etc.
  return deepMerge(base, trans);
}

function deepMerge(target: any, source: any): any {
  const out = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

export function t(locale: string, path: string, fallback?: string): string {
  const trans = getTranslations(locale);
  const keys = path.split(".");
  let cur: any = trans;
  for (const k of keys) {
    if (cur && typeof cur === "object" && k in cur) cur = cur[k];
    else return fallback ?? path;
  }
  if (typeof cur === "string") return cur;
  return fallback ?? path;
}

export function getLocaleFromUrl(url: URL): string {
  const segments = url.pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && locales.some((l) => l.code === first)) return first;
  return defaultLocale;
}

export function getLocaleInfo(code: string): Locale {
  return getLocale(code) ?? getLocale(defaultLocale)!;
}

export function localizePath(path: string, locale: string): string {
  // path like "/birthday-calculator/" or "/"
  const clean = path.startsWith("/") ? path : "/" + path;
  if (locale === defaultLocale) return clean;
  if (clean === "/") return `/${locale}/`;
  return `/${locale}${clean}`;
}

export function stripLocale(pathname: string): string {
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length && locales.some((l) => l.code === segs[0])) {
    const rest = "/" + segs.slice(1).join("/");
    return rest === "/" ? "/" : rest + (pathname.endsWith("/") ? "/" : "");
  }
  return pathname;
}

// Date formatting — calendar date to localized string
export function formatDateLocalized(date: { year: number; month: number; day: number }, locale: string): string {
  // Use Intl.DateTimeFormat with UTC to avoid TZ shift
  try {
    const dt = new Date(Date.UTC(date.year, date.month - 1, date.day));
    // Map locale code to Intl locale — zh -> zh-CN etc.
    const intlLocale = locale === "zh" ? "zh-CN" : locale === "ar" ? "ar-EG" : locale === "hi" ? "hi-IN" : locale === "ja" ? "ja-JP" : locale;
    return new Intl.DateTimeFormat(intlLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(dt);
  } catch {
    // fallback to English
    const dt = new Date(Date.UTC(date.year, date.month - 1, date.day));
    return dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  }
}

export function formatNumberLocalized(n: number, locale: string): string {
  try {
    const intlLocale = locale === "zh" ? "zh-CN" : locale === "ar" ? "ar-EG" : locale;
    return new Intl.NumberFormat(intlLocale).format(n);
  } catch {
    return new Intl.NumberFormat("en-US").format(n);
  }
}

export function getHreflangLinks(currentPath: string, site: string): Array<{ hreflang: string; href: string }> {
  const stripped = stripLocale(currentPath);
  const links = locales
    .filter((l) => l.published)
    .map((l) => ({
      hreflang: l.code,
      href: new URL(localizePath(stripped, l.code), site).toString(),
    }));
  // x-default to defaultLocale
  links.push({
    hreflang: "x-default",
    href: new URL(localizePath(stripped, defaultLocale), site).toString(),
  });
  return links;
}
