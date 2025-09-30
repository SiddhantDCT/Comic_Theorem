# scripts/webtoons_debug_fetch.py
import requests
from bs4 import BeautifulSoup
import os

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.webtoons.com/"
}

def main():
    url = "https://www.webtoons.com/en/dailySchedule"
    print("Fetching:", url)
    r = requests.get(url, headers=HEADERS, timeout=20)
    print("Status code:", r.status_code)
    html = r.text

    os.makedirs("scripts_debug", exist_ok=True)
    with open("scripts_debug/debug_listing.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Saved: scripts_debug/debug_listing.html")

    soup = BeautifulSoup(html, "lxml")
    anchors = soup.find_all("a")
    print("Total <a> tags found:", len(anchors))

    # Print first 40 anchors (href and short text)
    for i, a in enumerate(anchors[:40], 1):
        href = a.get("href")
        txt = a.get_text(strip=True)[:60]
        print(f"{i:02d}. href={href!s} | text='{txt}'")

    # Print anchors that contain title_no
    matches = [a for a in anchors if a.get("href") and "title_no=" in a.get("href")]
    print("Anchors containing 'title_no=':", len(matches))
    for a in matches[:30]:
        print(" ->", a.get("href"))

if __name__ == "__main__":
    main()
