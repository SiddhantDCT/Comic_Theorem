# scripts/webtoons_playwright_debug.py
from playwright.sync_api import sync_playwright
import os

def main():
    url = "https://www.webtoons.com/en/dailySchedule"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Loading page...")
        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(2000)
        html = page.content()

        os.makedirs("scripts_debug", exist_ok=True)
        with open("scripts_debug/debug_listing_rendered.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Saved: scripts_debug/debug_listing_rendered.html")

        anchors = page.query_selector_all("a")
        print("Total anchors found (rendered):", len(anchors))
        for i, a in enumerate(anchors[:60], 1):
            href = a.get_attribute("href")
            txt = a.inner_text().strip()[:60]
            print(f"{i:02d}. href={href!s} | text='{txt}'")
        
        # quick check for 'title_no=' in hrefs
        matches = [a for a in anchors if (a.get_attribute("href") or "").find("title_no=") >= 0]
        print("Anchors containing 'title_no=':", len(matches))

        browser.close()

if __name__ == "__main__":
    main()
