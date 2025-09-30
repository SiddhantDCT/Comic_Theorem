import { NextResponse } from "next/server"

interface Comic {
  id: number
  name: string
  image: {
    medium_url: string
    original_url: string
  }
  description: string
  site_detail_url: string
  date_added: string
  deck: string
  rating?: number
  publisher?: {
    name: string
  }
  count_of_issues?: number
  start_year?: number
}

export async function GET() {
  try {
    // Check if API key is available
    if (!process.env.COMIC_VINE_API_KEY) {
      // Return fallback trending comics if no API key
      const fallbackComics: Comic[] = [
        {
          id: 1001,
          name: "Batman: The Dark Knight Returns",
          image: {
            medium_url: "/batman-dark-knight-returns-comic.jpg",
            original_url: "/batman-dark-knight-returns-comic.jpg",
          },
          description: "Frank Miller's masterpiece that redefined Batman for a new generation.",
          site_detail_url: "#",
          date_added: "2024-01-15T00:00:00.000Z",
          deck: "The legendary Batman story that changed comics forever.",
          rating: 4.9,
          publisher: { name: "DC Comics" },
        },
        {
          id: 1002,
          name: "Spider-Man: Into the Spider-Verse",
          image: {
            medium_url: "/spider-man-into-spider-verse-comic.jpg",
            original_url: "/spider-man-into-spider-verse-comic.jpg",
          },
          description: "The multiverse-spanning adventure that inspired the acclaimed animated film.",
          site_detail_url: "#",
          date_added: "2024-01-10T00:00:00.000Z",
          deck: "Multiple Spider-People unite across dimensions.",
          rating: 4.8,
          publisher: { name: "Marvel Comics" },
        },
        {
          id: 1003,
          name: "Watchmen",
          image: {
            medium_url: "/watchmen-comic-book-cover.jpg",
            original_url: "/watchmen-comic-book-cover.jpg",
          },
          description: "Alan Moore's deconstruction of the superhero genre.",
          site_detail_url: "#",
          date_added: "2024-01-05T00:00:00.000Z",
          deck: "Who watches the Watchmen?",
          rating: 4.7,
          publisher: { name: "DC Comics" },
        },
        {
          id: 1004,
          name: "The Walking Dead",
          image: {
            medium_url: "/walking-dead-comic-book-cover.jpg",
            original_url: "/walking-dead-comic-book-cover.jpg",
          },
          description: "Robert Kirkman's zombie apocalypse epic.",
          site_detail_url: "#",
          date_added: "2024-01-01T00:00:00.000Z",
          deck: "Survival horror in a world overrun by zombies.",
          rating: 4.6,
          publisher: { name: "Image Comics" },
        },
        {
          id: 1005,
          name: "Saga",
          image: {
            medium_url: "/saga-comic-book-cover-space-opera.jpg",
            original_url: "/saga-comic-book-cover-space-opera.jpg",
          },
          description: "Brian K. Vaughan's space opera about love and war.",
          site_detail_url: "#",
          date_added: "2023-12-28T00:00:00.000Z",
          deck: "A sweeping tale of love, loss, and family.",
          rating: 4.5,
          publisher: { name: "Image Comics" },
        },
      ]

      return NextResponse.json({ results: fallbackComics })
    }

    // Fetch from Comic Vine API securely on server-side
    const response = await fetch(
      `https://comicvine.gamespot.com/api/volumes/?api_key=${process.env.COMIC_VINE_API_KEY}&format=json&sort=name:asc&limit=50&filter=name:batman,name:spider-man,name:superman,name:x-men,name:avengers,name:justice league,name:fantastic four,name:deadpool,name:wonder woman,name:flash`,
      {
        headers: {
          "User-Agent": "Comic Theorem App",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Comic Vine API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      // Add mock ratings and sort by rating
      const comicsWithRatings = data.results.map((comic: any, index: number) => ({
        ...comic,
        rating: 4.8 - index * 0.1, // Mock ratings from 4.8 to 4.3
      }))

      // Sort by rating and take top 5
      const topRated = comicsWithRatings.sort((a: Comic, b: Comic) => (b.rating || 0) - (a.rating || 0)).slice(0, 5)

      return NextResponse.json({ results: topRated })
    } else {
      // Return fallback if no results
      const fallbackComics: Comic[] = [
        {
          id: 1001,
          name: "Batman: The Dark Knight Returns",
          image: {
            medium_url: "/batman-dark-knight-returns-comic.jpg",
            original_url: "/batman-dark-knight-returns-comic.jpg",
          },
          description: "Frank Miller's masterpiece that redefined Batman for a new generation.",
          site_detail_url: "#",
          date_added: "2024-01-15T00:00:00.000Z",
          deck: "The legendary Batman story that changed comics forever.",
          rating: 4.9,
          publisher: { name: "DC Comics" },
        },
        {
          id: 1002,
          name: "Spider-Man: Into the Spider-Verse",
          image: {
            medium_url: "/spider-man-into-spider-verse-comic.jpg",
            original_url: "/spider-man-into-spider-verse-comic.jpg",
          },
          description: "The multiverse-spanning adventure that inspired the acclaimed animated film.",
          site_detail_url: "#",
          date_added: "2024-01-10T00:00:00.000Z",
          deck: "Multiple Spider-People unite across dimensions.",
          rating: 4.8,
          publisher: { name: "Marvel Comics" },
        },
        {
          id: 1003,
          name: "Watchmen",
          image: {
            medium_url: "/watchmen-comic-book-cover.jpg",
            original_url: "/watchmen-comic-book-cover.jpg",
          },
          description: "Alan Moore's deconstruction of the superhero genre.",
          site_detail_url: "#",
          date_added: "2024-01-05T00:00:00.000Z",
          deck: "Who watches the Watchmen?",
          rating: 4.7,
          publisher: { name: "DC Comics" },
        },
        {
          id: 1004,
          name: "The Walking Dead",
          image: {
            medium_url: "/walking-dead-comic-book-cover.jpg",
            original_url: "/walking-dead-comic-book-cover.jpg",
          },
          description: "Robert Kirkman's zombie apocalypse epic.",
          site_detail_url: "#",
          date_added: "2024-01-01T00:00:00.000Z",
          deck: "Survival horror in a world overrun by zombies.",
          rating: 4.6,
          publisher: { name: "Image Comics" },
        },
        {
          id: 1005,
          name: "Saga",
          image: {
            medium_url: "/saga-comic-book-cover-space-opera.jpg",
            original_url: "/saga-comic-book-cover-space-opera.jpg",
          },
          description: "Brian K. Vaughan's space opera about love and war.",
          site_detail_url: "#",
          date_added: "2023-12-28T00:00:00.000Z",
          deck: "A sweeping tale of love, loss, and family.",
          rating: 4.5,
          publisher: { name: "Image Comics" },
        },
      ]

      return NextResponse.json({ results: fallbackComics })
    }
  } catch (error) {
    console.error("Error fetching trending comics:", error)

    // Return fallback comics on error
    const fallbackComics: Comic[] = [
      {
        id: 1001,
        name: "Batman: The Dark Knight Returns",
        image: {
          medium_url: "/batman-dark-knight-returns-comic.jpg",
          original_url: "/batman-dark-knight-returns-comic.jpg",
        },
        description: "Frank Miller's masterpiece that redefined Batman for a new generation.",
        site_detail_url: "#",
        date_added: "2024-01-15T00:00:00.000Z",
        deck: "The legendary Batman story that changed comics forever.",
        rating: 4.9,
        publisher: { name: "DC Comics" },
      },
      {
        id: 1002,
        name: "Spider-Man: Into the Spider-Verse",
        image: {
          medium_url: "/spider-man-into-spider-verse-comic.jpg",
          original_url: "/spider-man-into-spider-verse-comic.jpg",
        },
        description: "The multiverse-spanning adventure that inspired the acclaimed animated film.",
        site_detail_url: "#",
        date_added: "2024-01-10T00:00:00.000Z",
        deck: "Multiple Spider-People unite across dimensions.",
        rating: 4.8,
        publisher: { name: "Marvel Comics" },
      },
      {
        id: 1003,
        name: "Watchmen",
        image: {
          medium_url: "/watchmen-comic-book-cover.jpg",
          original_url: "/watchmen-comic-book-cover.jpg",
        },
        description: "Alan Moore's deconstruction of the superhero genre.",
        site_detail_url: "#",
        date_added: "2024-01-05T00:00:00.000Z",
        deck: "Who watches the Watchmen?",
        rating: 4.7,
        publisher: { name: "DC Comics" },
      },
      {
        id: 1004,
        name: "The Walking Dead",
        image: {
          medium_url: "/walking-dead-comic-book-cover.jpg",
          original_url: "/walking-dead-comic-book-cover.jpg",
        },
        description: "Robert Kirkman's zombie apocalypse epic.",
        site_detail_url: "#",
        date_added: "2024-01-01T00:00:00.000Z",
        deck: "Survival horror in a world overrun by zombies.",
        rating: 4.6,
        publisher: { name: "Image Comics" },
      },
      {
        id: 1005,
        name: "Saga",
        image: {
          medium_url: "/saga-comic-book-cover-space-opera.jpg",
          original_url: "/saga-comic-book-cover-space-opera.jpg",
        },
        description: "Brian K. Vaughan's space opera about love and war.",
        site_detail_url: "#",
        date_added: "2023-12-28T00:00:00.000Z",
        deck: "A sweeping tale of love, loss, and family.",
        rating: 4.5,
        publisher: { name: "Image Comics" },
      },
    ]

    return NextResponse.json({ results: fallbackComics })
  }
}
