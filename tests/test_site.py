import json
import unittest
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_PAGES = {
    "/": ROOT / "index.html",
    "/how-it-works": ROOT / "how-it-works.html",
    "/services/presentation-design": ROOT / "services/presentation-design.html",
    "/services/packaging-label-design": ROOT / "services/packaging-label-design.html",
    "/services/3d-rendering-product-animation": ROOT / "services/3d-rendering-product-animation.html",
    "/integrations/chatgpt-claude-mcp": ROOT / "integrations/chatgpt-claude-mcp.html",
    "/for-professionals": ROOT / "for-professionals.html",
    "/privacy": ROOT / "privacy.html",
    "/terms": ROOT / "terms.html",
}


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lang = None
        self.title = ""
        self._in_title = False
        self.h1_count = 0
        self.description = None
        self.canonical = None
        self.links = []
        self.json_ld = []
        self._in_json_ld = False
        self._json_buffer = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "html":
            self.lang = values.get("lang")
        elif tag == "title":
            self._in_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "meta" and values.get("name") == "description":
            self.description = values.get("content")
        elif tag == "link" and values.get("rel") == "canonical":
            self.canonical = values.get("href")
        elif tag == "a" and values.get("href"):
            self.links.append(values["href"])
        elif tag == "script" and values.get("type") == "application/ld+json":
            self._in_json_ld = True
            self._json_buffer = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "script" and self._in_json_ld:
            self.json_ld.append("".join(self._json_buffer))
            self._in_json_ld = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_json_ld:
            self._json_buffer.append(data)


def parse_page(path):
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


class SiteQualityTests(unittest.TestCase):
    def test_public_pages_have_unique_search_metadata(self):
        titles = set()
        descriptions = set()
        for route, path in PUBLIC_PAGES.items():
            with self.subTest(route=route):
                self.assertTrue(path.exists())
                page = parse_page(path)
                self.assertEqual(page.lang, "en-US")
                self.assertEqual(page.h1_count, 1)
                self.assertTrue(20 <= len(page.title.strip()) <= 70)
                self.assertTrue(50 <= len(page.description or "") <= 180)
                expected = "https://www.useborage.com/" if route == "/" else f"https://www.useborage.com{route}"
                self.assertEqual(page.canonical, expected)
                titles.add(page.title.strip())
                descriptions.add(page.description)
                for block in page.json_ld:
                    json.loads(block)
        self.assertEqual(len(titles), len(PUBLIC_PAGES))
        self.assertEqual(len(descriptions), len(PUBLIC_PAGES))

    def test_internal_links_resolve(self):
        allowed_virtual_routes = {"/sign-in"}
        for route, path in PUBLIC_PAGES.items():
            page = parse_page(path)
            for href in page.links:
                parsed = urlparse(href)
                if parsed.scheme or href.startswith(("#", "mailto:")):
                    continue
                target = parsed.path or "/"
                with self.subTest(source=route, href=href):
                    self.assertTrue(target in PUBLIC_PAGES or target in allowed_virtual_routes)

    def test_sitemap_contains_only_canonical_public_pages(self):
        tree = ET.parse(ROOT / "sitemap.xml")
        namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        locations = {node.text for node in tree.findall("sm:url/sm:loc", namespace)}
        expected = {
            "https://www.useborage.com/" if route == "/" else f"https://www.useborage.com{route}"
            for route in PUBLIC_PAGES
        }
        self.assertEqual(locations, expected)

    def test_robots_and_vercel_configuration(self):
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
        self.assertIn("User-agent: *\nAllow: /", robots)
        self.assertIn("Sitemap: https://www.useborage.com/sitemap.xml", robots)
        config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
        self.assertFalse(config["trailingSlash"])
        self.assertFalse(any(item.get("has") for item in config["redirects"]))
        self.assertTrue(any(item.get("source") == "/sign-in" for item in config["redirects"]))
        header_keys = {item["key"] for rule in config["headers"] for item in rule["headers"]}
        self.assertIn("X-Content-Type-Options", header_keys)
        self.assertIn("Referrer-Policy", header_keys)
        robot_rules = [rule for rule in config["headers"] if any(item["key"] == "X-Robots-Tag" for item in rule["headers"])]
        self.assertEqual(len(robot_rules), 1)
        self.assertEqual(robot_rules[0]["has"][0]["value"], "useborage-landing.vercel.app")

    def test_public_claims_match_current_boundaries(self):
        integration = (ROOT / "integrations/chatgpt-claude-mcp.html").read_text(encoding="utf-8")
        self.assertIn("requires explicit approval", integration)
        self.assertIn("may open Borage securely", integration)
        privacy = (ROOT / "privacy.html").read_text(encoding="utf-8")
        self.assertIn("processed in your browser", privacy)
        for path in PUBLIC_PAGES.values():
            text = path.read_text(encoding="utf-8")
            self.assertNotIn("£", text)
            self.assertNotIn("UK competitors", text)

    def test_homepage_has_one_clear_buyer_path(self):
        homepage = (ROOT / "index.html").read_text(encoding="utf-8")
        script = (ROOT / "assets/js/landing.js").read_text(encoding="utf-8")
        self.assertIn('<span class="brand-lockup"><small>Use</small><strong>Borage</strong></span>', homepage)
        self.assertIn("Borage | Get Creative &amp; Specialist Work Done", homepage)
        self.assertNotIn("Managed Project Delivery for Business", homepage)
        self.assertIn("Tell Borage what you need", homepage)
        self.assertIn("Start a project", homepage)
        for reassurance in ("No job post", "No profile search", "No obligation to proceed"):
            self.assertIn(reassurance, homepage)
        self.assertIn('class="graphic-reassurance"', homepage)
        self.assertNotIn('class="hero-reassurance"', homepage)
        self.assertIn("The project work you", homepage)
        self.assertIn('class="hero-orchestration"', homepage)
        self.assertIn("Running the project", homepage)
        self.assertIn("Work without the workload", homepage)
        self.assertIn("Selected by Borage", homepage)
        self.assertIn("Artwork checked", homepage)
        for role in ("Brand artist", "Packaging designer", "Production engineer"):
            self.assertIn(role, homepage)
        self.assertNotIn("3D specialist", homepage)
        self.assertNotIn('class="pro-portrait', homepage)
        for role_icon in ("artist-role-icon", "packaging-role-icon", "engineer-role-icon"):
            self.assertIn(role_icon, homepage)
        self.assertIn('/assets/agentura-hero-cutout.png', homepage)
        self.assertTrue((ROOT / "assets" / "agentura-hero-cutout.png").exists())
        self.assertNotIn('class="signal-orbit', homepage)
        self.assertNotIn("data-audience-switcher", homepage)
        self.assertNotIn("Get work done", homepage)
        self.assertNotIn("Do great work", homepage)
        self.assertNotIn("data-audience-button", homepage + script)
        self.assertNotIn('class="professional-section"', homepage)
        self.assertIn('id="chat"', homepage)
        self.assertIn("Add Borage as a plugin or MCP connection", homepage)
        self.assertIn("Keep the AI", homepage)
        self.assertIn("Prefer to stay in chat?", homepage)
        self.assertIn("Start the project in ChatGPT or Claude.", homepage)
        self.assertIn("No separate form.", homepage)
        self.assertNotIn("Bring Borage into your assistant", homepage)
        for brand in ("openai", "claude", "mcp"):
            self.assertIn(f'/assets/brands/{brand}.svg', homepage)
            self.assertTrue((ROOT / "assets" / "brands" / f"{brand}.svg").exists())
        self.assertNotIn("Buyer view", homepage + script)
        self.assertNotIn("Professional view", homepage + script)


if __name__ == "__main__":
    unittest.main()
