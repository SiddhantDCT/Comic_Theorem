import { type NextRequest, NextResponse } from "next/server"

interface Comic {
  id: number
  name: string
  image?: {
    medium_url: string
    original_url: string
  }
  description?: string
  site_detail_url: string
  date_added: string
  deck?: string
  publisher?: {
    name: string
  }
  count_of_issues?: number
  start_year?: number
}

export async function POST(request: NextRequest) {
  try {
    const { comic, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    if (!comic) {
      return NextResponse.json({ error: "Comic data is required" }, { status: 400 })
    }

    // Get similar comics based on the input comic
    const suggestions = await findSimilarComics(comic, apiKey)

    return NextResponse.json({
      status_code: 1,
      results: suggestions,
      message: `Found ${suggestions.length} similar comics to "${comic.name}"`,
    })
  } catch (error) {
    console.error("Error generating AI suggestions:", error)
    return NextResponse.json({ error: "Failed to generate AI suggestions" }, { status: 500 })
  }
}

async function findSimilarComics(inputComic: Comic, apiKey: string): Promise<Comic[]> {
  const suggestions: Comic[] = []

  try {
    // Strategy 1: Find comics from the same publisher
    if (inputComic.publisher?.name) {
      const publisherComics = await searchComicsByPublisher(inputComic.publisher.name, apiKey)
      suggestions.push(...publisherComics.slice(0, 3))
    }

    // Strategy 2: Find comics with similar names/keywords
    const keywords = extractKeywords(inputComic.name)
    for (const keyword of keywords.slice(0, 2)) {
      const keywordComics = await searchComicsByKeyword(keyword, apiKey)
      suggestions.push(...keywordComics.slice(0, 2))
    }

    // Strategy 3: Find comics from similar time period
    if (inputComic.start_year) {
      const eraComics = await searchComicsByEra(inputComic.start_year, apiKey)
      suggestions.push(...eraComics.slice(0, 2))
    }

    // Remove duplicates and the original comic
    const uniqueSuggestions = suggestions
      .filter((comic, index, self) => self.findIndex((c) => c.id === comic.id) === index)
      .filter((comic) => comic.id !== inputComic.id)
      .slice(0, 8) // Limit to 8 suggestions

    // Add ratings to suggestions
    return uniqueSuggestions.map((comic) => ({
      ...comic,
      rating: calculateComicRating(comic),
    }))
  } catch (error) {
    console.error("Error in findSimilarComics:", error)
    return []
  }
}

async function searchComicsByPublisher(publisherName: string, apiKey: string): Promise<Comic[]> {
  try {
    const response = await fetch(
      `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(publisherName)}&resources=volume&limit=5&field_list=id,name,image,description,site_detail_url,date_added,deck,publisher,count_of_issues,start_year`,
      {
        headers: {
          "User-Agent": "ComicTheoremApp/1.0",
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      return data.results || []
    }
  } catch (error) {
    console.error("Error searching by publisher:", error)
  }
  return []
}

async function searchComicsByKeyword(keyword: string, apiKey: string): Promise<Comic[]> {
  try {
    const response = await fetch(
      `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(keyword)}&resources=volume&limit=3&field_list=id,name,image,description,site_detail_url,date_added,deck,publisher,count_of_issues,start_year`,
      {
        headers: {
          "User-Agent": "ComicTheoremApp/1.0",
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      return data.results || []
    }
  } catch (error) {
    console.error("Error searching by keyword:", error)
  }
  return []
}

async function searchComicsByEra(year: number, apiKey: string): Promise<Comic[]> {
  try {
    // Search for comics from the same decade
    const decade = Math.floor(year / 10) * 10
    const response = await fetch(
      `https://comicvine.gamespot.com/api/volumes/?api_key=${apiKey}&format=json&limit=5&sort=date_added:desc&field_list=id,name,image,description,site_detail_url,date_added,deck,publisher,count_of_issues,start_year`,
      {
        headers: {
          "User-Agent": "ComicTheoremApp/1.0",
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      // Filter by decade
      return (data.results || []).filter((comic: Comic) => {
        if (!comic.start_year) return false
        const comicDecade = Math.floor(comic.start_year / 10) * 10
        return comicDecade === decade
      })
    }
  } catch (error) {
    console.error("Error searching by era:", error)
  }
  return []
}

function extractKeywords(title: string): string[] {
  // Remove common words and extract meaningful keywords
  const commonWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"]
  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.includes(word))

  return words.slice(0, 3) // Return top 3 keywords
}

function calculateComicRating(comic: Comic): number {
  let rating = 3.0 // Base rating

  // Boost rating based on issue count (popular series)
  if (comic.count_of_issues) {
    if (comic.count_of_issues > 100) rating += 1.2
    else if (comic.count_of_issues > 50) rating += 0.8
    else if (comic.count_of_issues > 20) rating += 0.5
    else if (comic.count_of_issues > 10) rating += 0.3
  }

  // Boost rating for older, established series
  if (comic.start_year) {
    const currentYear = new Date().getFullYear()
    const age = currentYear - comic.start_year
    if (age > 30) rating += 0.8
    else if (age > 20) rating += 0.5
    else if (age > 10) rating += 0.3
  }

  // Add some randomization to make ratings feel more realistic
  rating += (Math.random() - 0.5) * 0.6

  // Ensure rating stays within 1-5 range
  return Math.max(1.0, Math.min(5.0, Math.round(rating * 10) / 10))
}
