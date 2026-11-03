import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("dist/client");
const read = (path) => readFileSync(resolve(root, path), "utf8");

assert.ok(existsSync(resolve(root, "index.html")), "Homepage build output missing.");
assert.ok(existsSync(resolve(root, "age-difference-calculator/index.html")), "Age difference page missing.");

const home = read("index.html");
const ageGap = read("age-difference-calculator/index.html");
const privacy = read("privacy-policy/index.html");
const about = read("about/index.html");
const contact = read("contact/index.html");
const robots = read("robots.txt");
const sitemapIndex = read("sitemap-index.xml");
const sitemapMatch = /<loc>([^<]*sitemap-\d+\.xml)<\/loc>/.exec(sitemapIndex);
assert.ok(sitemapMatch, "Sitemap index does not reference a child sitemap.");
const sitemapFile = new URL(sitemapMatch[1]).pathname.replace(/^\//, "");
const sitemap = read(sitemapFile);

assert.match(home, /<link rel="canonical" href="https:\/\/agecalculatorkit\.com\/"\s*\/?>/);
assert.match(ageGap, /<link rel="canonical" href="https:\/\/agecalculatorkit\.com\/age-difference-calculator\/"\s*\/?>/);
assert.match(sitemap, /https:\/\/agecalculatorkit\.com\/age-difference-calculator\//);
assert.doesNotMatch(sitemap, /\/404(?:\/|<)/);
assert.doesNotMatch(sitemap, /\/500(?:\/|<)/);
assert.doesNotMatch(home, /pagead2\.googlesyndication\.com/, "AdSense must stay disabled unless PUBLIC_ADSENSE_ENABLED=true.");
assert.match(privacy, /AdSense and ad slots are disabled in this build/);
assert.match(about, /"@type":"AboutPage"/);
assert.match(contact, /"@type":"ContactPage"/);
assert.match(robots, /Sitemap: https:\/\/agecalculatorkit\.com\/sitemap-index\.xml/);
assert.doesNotMatch(robots, /^Host:/m);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = resolve(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

for (const file of walk(resolve("src")).filter((file) => file.endsWith(".astro"))) {
  const source = readFileSync(file, "utf8");
  let index = source.indexOf("mailto:");
  while (index !== -1) {
    const open = source.lastIndexOf("<!--email_off-->", index);
    const previousClose = source.lastIndexOf("<!--/email_off-->", index);
    const nextClose = source.indexOf("<!--/email_off-->", index);
    assert.ok(
      open > previousClose && nextClose > index,
      `Every authored mailto link must be wrapped in Cloudflare email_off markers: ${file}`
    );
    index = source.indexOf("mailto:", index + 1);
  }
}



// Audit every public page advertised by the production sitemap, not only a sample.
const expectedRoutes = [
  "/",
  "/about/",
  "/age-difference-calculator/",
  "/birthday-calculator/",
  "/contact/",
  "/date-difference/",
  "/disclaimer/",
  "/faq/",
  "/how-it-works/",
  "/privacy-policy/",
  "/terms/",
];

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(sitemapUrls.length, expectedRoutes.length, "Sitemap URL count changed; review the route inventory.");
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, "Sitemap contains duplicate URLs.");

const sitemapPaths = sitemapUrls.map((url) => {
  const parsed = new URL(url);
  assert.equal(parsed.origin, "https://agecalculatorkit.com", `Unexpected sitemap host: ${url}`);
  assert.equal(parsed.search, "", `Sitemap URL must not contain query parameters: ${url}`);
  assert.equal(parsed.hash, "", `Sitemap URL must not contain a fragment: ${url}`);
  return parsed.pathname;
});
assert.deepEqual([...sitemapPaths].sort(), [...expectedRoutes].sort(), "Sitemap routes do not match the reviewed public-page inventory.");

const pageTitles = new Set();
const pageDescriptions = new Set();
const pageH1s = new Set();

for (const route of expectedRoutes) {
  const outputPath = route === "/" ? "index.html" : `${route.replace(/^\//, "")}index.html`;
  assert.ok(existsSync(resolve(root, outputPath)), `Sitemap route is missing built HTML: ${route}`);
  const html = read(outputPath);
  const canonical = `https://agecalculatorkit.com${route}`;

  const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(html);
  const descriptionMatch = /<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i.exec(html);
  const canonicalMatch = /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/i.exec(html);
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];

  assert.ok(titleMatch?.[1].trim(), `Missing title: ${route}`);
  assert.ok(descriptionMatch?.[1].trim(), `Missing meta description: ${route}`);
  assert.equal(canonicalMatch?.[1], canonical, `Canonical mismatch: ${route}`);
  assert.equal(h1Matches.length, 1, `Expected exactly one H1: ${route}`);
  assert.doesNotMatch(html, /<meta\s+name="robots"\s+content="noindex/i, `Sitemap page is noindexed: ${route}`);

  const title = titleMatch[1].replace(/&amp;/g, "&").trim();
  const description = descriptionMatch[1].replace(/&amp;/g, "&").trim();
  const h1 = h1Matches[0][1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  assert.ok(!pageTitles.has(title), `Duplicate page title: ${title}`);
  assert.ok(!pageDescriptions.has(description), `Duplicate meta description: ${route}`);
  assert.ok(!pageH1s.has(h1), `Duplicate H1: ${h1}`);
  pageTitles.add(title);
  pageDescriptions.add(description);
  pageH1s.add(h1);

  const jsonLdScripts = [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const script of jsonLdScripts) {
    assert.doesNotThrow(() => JSON.parse(script[1]), `Invalid JSON-LD: ${route}`);
  }
}

console.log(`Sitewide SEO regression checks passed for ${expectedRoutes.length} sitemap pages (unique titles, descriptions, H1s, canonicals, indexability and JSON-LD syntax).`);
