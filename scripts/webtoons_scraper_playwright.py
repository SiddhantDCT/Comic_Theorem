# scripts/webtoons_scraper_playwright.py
import time
import json
import os
import re
from playwright.sync_api import sync_playwright

LISTING_URL = "https://www.webtoons.com/en/dailySchedule"
OUT_PATH = os.path.join("public", "data", "webtoons_authors.json")
DEBUG_DIR = "scripts_debug"
MAX_TITLES = None   # set to an int for testing (e.g. 20), or None to scrape all found

AUTHOR_SELECTORS = [
    "p.author", ".author", ".sub_info .author", ".sub_info_author",
    ".info > h2", ".info .author", ".artist", ".created-by", "p.subj_author",
    ".profile .author", ".creator", ".creator-name", ".profile_info .author"
]

def safe_filename(s):
    return re.sub(r'[^0-9A-Za-z._-]', '_', s)[:90]

def extract_author_from_html_text(text):
    # fallback regex 'by NAME' or 'Created by NAME'
    m = re.search(r"(?:by|created by|creator:|creators?:)\s*([A-Za-z0-9 ,.&\-()]+)", text, re.I)
    if m:
        return m.group(1).strip()
    return None

def run():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    os.makedirs(DEBUG_DIR, exist_ok=True)

    results = []
    seen = set()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)  # set headless=False for debugging
        page = browser.new_page()
        print("Loading listing:", LISTING_URL)
        page.goto(LISTING_URL, wait_until="networkidle")
        try:
            page.wait_for_selector('a[href*="title_no="]', timeout=10000)
        except Exception:
            # selector might still work, but if not we still grab anchors
            print("Warning: timed out waiting for anchors; continuing to read available anchors.")

        anchors = page.query_selector_all('a[href*="title_no="]')
        print(f"Found {len(anchors)} anchors with title_no= (rendered).")

        # iterate anchors, collect unique hrefs
        links = []
        for a in anchors:
            href = a.get_attribute("href") or ""
            if href.startswith("/"):
                href = "https://www.webtoons.com" + href
            if not href.lower().startswith("http"):
                continue
            if href in seen:
                continue
            seen.add(href)
            title_text = a.inner_text().strip()
            title = " ".join(title_text.split()) or "Unknown Title"
            links.append((title, href))
            if MAX_TITLES and len(links) >= MAX_TITLES:
                break

        print(f"Will scrape {len(links)} detail pages (MAX_TITLES={MAX_TITLES}).")

        for idx, (title, href) in enumerate(links, start=1):
            print(f"[{idx}/{len(links)}] {title} -> {href}")
            try:
                page.goto(href, wait_until="networkidle", timeout=30000)
            except Exception as e:
                print("  ❌ Failed to load detail page:", e)
                continue

            author = None
            # try CSS selectors first
            for sel in AUTHOR_SELECTORS:
                try:
                    el = page.query_selector(sel)
                    if el:
                        txt = el.inner_text().strip()
                        if txt:
                            author = txt
                            break
                except Exception:
                    continue

            # fallback: use page content and regex
            if not author:
                html = page.content()
                author = extract_author_from_html_text(html)

            # still not found -> save debug html
            if not author:
                safe = safe_filename(title)
                debug_fn = os.path.join(DEBUG_DIR, f"debug_{safe}.html")
                with open(debug_fn, "w", encoding="utf-8") as f:
                    f.write(page.content())
                print(f"  ⚠️ Author NOT found for '{title}'. Saved debug file: {debug_fn}")
                author = "Unknown Author"
            else:
                print(f"  ✅ Found author: {author}")

            results.append({
                "title": title,
                "author": author,
                "link": href
            })

            # be polite
            time.sleep(1.2)

        browser.close()

    # save results
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(results)} records to {OUT_PATH}")

if __name__ == "__main__":
    run()
