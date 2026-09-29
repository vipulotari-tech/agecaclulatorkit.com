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

console.log("Static SEO/privacy regression tests passed.");
