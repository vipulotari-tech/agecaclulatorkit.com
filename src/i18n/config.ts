export type Locale = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
  ogLocale: string; // e.g., en_US
  published: boolean; // whether to index this locale
};

export const defaultLocale = "en";

export const locales: Locale[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", dir: "ltr", ogLocale: "en_US", published: true },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", dir: "ltr", ogLocale: "es_ES", published: true },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr", ogLocale: "fr_FR", published: true },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr", ogLocale: "de_DE", published: true },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", dir: "ltr", ogLocale: "pt_PT", published: false },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", dir: "ltr", ogLocale: "it_IT", published: false },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", dir: "ltr", ogLocale: "nl_NL", published: false },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", dir: "ltr", ogLocale: "ru_RU", published: false },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", dir: "ltr", ogLocale: "tr_TR", published: false },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl", ogLocale: "ar_SA", published: true },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", dir: "ltr", ogLocale: "hi_IN", published: true },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩", dir: "ltr", ogLocale: "bn_BD", published: false },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰", dir: "rtl", ogLocale: "ur_PK", published: false },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", dir: "ltr", ogLocale: "id_ID", published: false },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", dir: "ltr", ogLocale: "vi_VN", published: false },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", dir: "ltr", ogLocale: "ja_JP", published: true },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", dir: "ltr", ogLocale: "ko_KR", published: false },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", dir: "ltr", ogLocale: "zh_CN", published: true },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭", dir: "ltr", ogLocale: "th_TH", published: false },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱", dir: "ltr", ogLocale: "pl_PL", published: false },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪", dir: "ltr", ogLocale: "sv_SE", published: false },
];

export const publishedLocales = locales.filter((l) => l.published);

export function isValidLocale(code: string): boolean {
  return locales.some((l) => l.code === code);
}

export function getLocale(code: string): Locale | undefined {
  return locales.find((l) => l.code === code);
}

export function getLocaleOrDefault(code?: string): Locale {
  if (!code) return getLocale(defaultLocale)!;
  return getLocale(code) ?? getLocale(defaultLocale)!;
}

// URL helpers — root "/" is English, others are "/{code}/"
export function localizedPath(path: string, locale: string): string {
  // path is absolute like "/" or "/birthday-calculator/"
  // ensure leading slash and trailing slash handling
  const cleanPath = path.startsWith("/") ? path : "/" + path;
  if (locale === defaultLocale) return cleanPath;
  if (cleanPath === "/") return `/${locale}/`;
  return `/${locale}${cleanPath}`;
}

export function getLocaleFromUrl(url: URL | string): string {
  const pathname = typeof url === "string" ? url : url.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && isValidLocale(first)) return first;
  return defaultLocale;
}

export function stripLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isValidLocale(segments[0])) {
    const rest = "/" + segments.slice(1).join("/");
    return rest === "/" ? "/" : rest + (pathname.endsWith("/") ? "/" : "");
  }
  return pathname;
}

// For hreflang, build absolute URL
export function hreflangUrl(pathname: string, locale: string, site: string): string {
  const stripped = stripLocaleFromPath(pathname);
  const localized = localizedPath(stripped, locale);
  return new URL(localized, site).toString();
}
