import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("dist/client");
const read = (path) => readFileSync(resolve(root, path), "utf8");

assert.ok(existsSync(resolve(root, "index.html")), "Homepage build output missing.");
assert.ok(existsSync(resolve(root, "age-difference-calculator/index.html")), "Age difference page missing.");

const home = read("index.html");
const ageGap = read("age-difference-calculator/index.html");
const privacy = read("privacy-policy/index.html");
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
assert.match(robots, /Sitemap: https:\/\/agecalculatorkit\.com\/sitemap-index\.xml/);
assert.doesNotMatch(robots, /^Host:/m);

console.log("Static SEO/privacy regression tests passed.");
