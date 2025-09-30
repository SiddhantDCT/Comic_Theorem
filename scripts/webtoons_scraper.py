import requests
from bs4 import BeautifulSoup
import json
import time

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.webtoons.com/"
}

def safe_request(url, retries=3, delay=3):
    """Wrapper around requests.get with retries + timeout."""
    for i in range(retries):
        try:
            res = requests.get(url, headers=HEADERS, timeout=15)
            res.raise_for_status()
            return res
        except Exception as e:
            print(f"⚠️ Request failed ({i+1}/{retries}): {e}")
            time.sleep(delay)
    return None

def scrape_webtoons_authors():
    base_url = "https://www.webtoons.com/en/dailySchedule"
    all_data = []

    res = safe_request(base_url)
    if not res:
        print("❌ Could not fetch Webtoons schedule page.")
        return

    soup = BeautifulSoup(res.text, "html.parser")
    cards = soup.select("a.daily_card_item")  # schedule cards

    if not cards:
        print("❌ No cards found — selector might be wrong.")
        return

    for card in cards:
        try:
            title_tag = card.select_one("p.subj")
            title = title_tag.text.strip() if title_tag else "Unknown Title"
            link = card.get("href")

            detail_res = safe_request(link)
            if not detail_res:
                continue

            detail_soup = BeautifulSoup(detail_res.text, "html.parser")

            # Try multiple selectors for author
            author_tag = (
                detail_soup.select_one(".author") or
                detail_soup.select_one(".info > h2") or
                detail_soup.select_one("p.author")
            )

            if author_tag:
                author = author_tag.get_text(strip=True)
            else:
                # Debug: print snippet so we can inspect
                snippet = detail_soup.select_one("div.info")
                print(f"⚠️ Author not found for {title}. HTML snippet:\n", snippet)
                author = "Unknown Author"

            all_data.append({
                "title": title,
                "author": author,
                "link": link
            })

            print(f"✅ {title} → {author}")
            time.sleep(2)

        except Exception as e:
            print(f"⚠️ Error scraping {title}: {e}")

    if all_data:
        with open("webtoons_authors.json", "w", encoding="utf-8") as f:
            json.dump(all_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Scraped {len(all_data)} titles → webtoons_authors.json")
    else:
        print("❌ No authors scraped.")

if __name__ == "__main__":
    scrape_webtoons_authors()
