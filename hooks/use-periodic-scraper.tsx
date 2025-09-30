"use client"

import { useEffect, useRef } from "react"

interface GlobalComixComic {
  id: string
  title: string
  creators: {
    writers: string[]
    artists: string[]
    pencilers: string[]
    inkers: string[]
    colorists: string[]
    coverArtists: string[]
  }
  image: string
  description: string
  url: string
  lastUpdated: string
}

export function usePeriodicScraper() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrapeRef = useRef<number>(0)

  const scrapeGlobalComixHomepage = async (): Promise<GlobalComixComic[]> => {
    console.log("[v0] Starting periodic scrape of GlobalComix homepage")

    const proxies = [
      "https://api.allorigins.win/raw?url=",
      "https://cors-anywhere.herokuapp.com/",
      "https://thingproxy.freeboard.io/fetch/",
    ]

    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    ]

    for (const proxy of proxies) {
      try {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000))

        const response = await fetch(`${proxy}https://globalcomix.com`, {
          headers: {
            "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
          },
        })

        if (!response.ok) continue

        const html = await response.text()
        console.log("[v0] Successfully fetched GlobalComix homepage")

        const comics = parseHomepageComics(html)

        if (comics.length > 0) {
          const scrapedData = {
            comics,
            timestamp: Date.now(),
            lastScrape: new Date().toISOString(),
          }

          localStorage.setItem("globalcomix_scraped_data", JSON.stringify(scrapedData))
          console.log(`[v0] Stored ${comics.length} comics from GlobalComix homepage`)

          return comics
        }
      } catch (error) {
        console.log(`[v0] Error with proxy ${proxy}:`, error)
        continue
      }
    }

    console.log("[v0] All proxies failed, using cached data if available")
    return getCachedComics()
  }

  const parseHomepageComics = (html: string): GlobalComixComic[] => {
    const comics: GlobalComixComic[] = []

    try {
      const comicMatches = html.match(/<div[^>]*class="[^"]*comic[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || []

      comicMatches.forEach((match, index) => {
        try {
          // Extract title
          const titleMatch =
            match.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/) ||
            match.match(/title="([^"]+)"/) ||
            match.match(/alt="([^"]+)"/)

          // Extract image
          const imageMatch = match.match(/src="([^"]+)"/) || match.match(/data-src="([^"]+)"/)

          // Extract URL
          const urlMatch = match.match(/href="([^"]+)"/)

          if (titleMatch && imageMatch) {
            const comic: GlobalComixComic = {
              id: `gc_${Date.now()}_${index}`,
              title: titleMatch[1].trim(),
              creators: {
                writers: [],
                artists: [],
                pencilers: [],
                inkers: [],
                colorists: [],
                coverArtists: [],
              },
              image: imageMatch[1].startsWith("http") ? imageMatch[1] : `https://globalcomix.com${imageMatch[1]}`,
              description: "",
              url: urlMatch
                ? urlMatch[1].startsWith("http")
                  ? urlMatch[1]
                  : `https://globalcomix.com${urlMatch[1]}`
                : "",
              lastUpdated: new Date().toISOString(),
            }

            comics.push(comic)
          }
        } catch (error) {
          console.log("[v0] Error parsing individual comic:", error)
        }
      })

      if (comics.length === 0) {
        const alternativeMatches = html.match(/<a[^>]*href="[^"]*comic[^"]*"[^>]*>[\s\S]*?<\/a>/gi) || []

        alternativeMatches.forEach((match, index) => {
          try {
            const titleMatch = match
              .match(/>([^<]+)</g)
              ?.pop()
              ?.replace(/[><]/g, "")
            const imageMatch = match.match(/src="([^"]+)"/)
            const urlMatch = match.match(/href="([^"]+)"/)

            if (titleMatch && titleMatch.trim().length > 2) {
              const comic: GlobalComixComic = {
                id: `gc_alt_${Date.now()}_${index}`,
                title: titleMatch.trim(),
                creators: {
                  writers: [],
                  artists: [],
                  pencilers: [],
                  inkers: [],
                  colorists: [],
                  coverArtists: [],
                },
                image: imageMatch
                  ? imageMatch[1].startsWith("http")
                    ? imageMatch[1]
                    : `https://globalcomix.com${imageMatch[1]}`
                  : "",
                description: "",
                url: urlMatch
                  ? urlMatch[1].startsWith("http")
                    ? urlMatch[1]
                    : `https://globalcomix.com${urlMatch[1]}`
                  : "",
                lastUpdated: new Date().toISOString(),
              }

              comics.push(comic)
            }
          } catch (error) {
            console.log("[v0] Error parsing alternative comic:", error)
          }
        })
      }
    } catch (error) {
      console.log("[v0] Error parsing homepage HTML:", error)
    }

    return comics.slice(0, 50) // Limit to 50 comics to avoid overwhelming storage
  }

  const getCachedComics = (): GlobalComixComic[] => {
    try {
      const cached = localStorage.getItem("globalcomix_scraped_data")
      if (cached) {
        const data = JSON.parse(cached)
        return data.comics || []
      }
    } catch (error) {
      console.log("[v0] Error reading cached comics:", error)
    }
    return []
  }

  const shouldScrape = (): boolean => {
    const now = Date.now()
    const fourHours = 4 * 60 * 60 * 1000 // 4 hours in milliseconds

    // Check if 4 hours have passed since last scrape
    if (now - lastScrapeRef.current >= fourHours) {
      return true
    }

    // Also check localStorage for last scrape time
    try {
      const cached = localStorage.getItem("globalcomix_scraped_data")
      if (cached) {
        const data = JSON.parse(cached)
        const lastScrape = data.timestamp || 0
        return now - lastScrape >= fourHours
      }
    } catch (error) {
      console.log("[v0] Error checking last scrape time:", error)
    }

    return true
  }

  const startPeriodicScraping = () => {
    console.log("[v0] Starting periodic GlobalComix scraping (every 4 hours)")

    if (shouldScrape()) {
      setTimeout(() => {
        scrapeGlobalComixHomepage()
        lastScrapeRef.current = Date.now()
      }, Math.random() * 30000) // Random delay up to 30 seconds
    }

    intervalRef.current = setInterval(
      () => {
        if (shouldScrape()) {
          // Add random delay to avoid predictable scraping patterns
          setTimeout(() => {
            scrapeGlobalComixHomepage()
            lastScrapeRef.current = Date.now()
          }, Math.random() * 60000) // Random delay up to 1 minute
        }
      },
      4 * 60 * 60 * 1000,
    ) // 4 hours
  }

  const stopPeriodicScraping = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log("[v0] Stopped periodic GlobalComix scraping")
    }
  }

  const getScrapedComics = (): GlobalComixComic[] => {
    return getCachedComics()
  }

  const getLastScrapeTime = (): string | null => {
    try {
      const cached = localStorage.getItem("globalcomix_scraped_data")
      if (cached) {
        const data = JSON.parse(cached)
        return data.lastScrape || null
      }
    } catch (error) {
      console.log("[v0] Error getting last scrape time:", error)
    }
    return null
  }

  useEffect(() => {
    startPeriodicScraping()

    return () => {
      stopPeriodicScraping()
    }
  }, [])

  return {
    getScrapedComics,
    getLastScrapeTime,
    scrapeNow: scrapeGlobalComixHomepage,
  }
}
