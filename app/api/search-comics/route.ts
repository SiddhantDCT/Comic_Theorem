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
  rating?: number
}

export async function POST(request: NextRequest) {
  try {
    const { query, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    // Search for comics using Comic Vine API
    const searchResults = await searchComics(query.trim(), apiKey)

    // Enhance results with AI-generated insights
    const enhancedResults = await enhanceWithAI(searchResults, query.trim())

    return NextResponse.json({
      status_code: 1,
      results: enhancedResults,
      message: `Found ${enhancedResults.length} comics matching "${query}"`,
    })
  } catch (error) {
    console.error("Error searching comics:", error)
    return NextResponse.json({ error: "Failed to search comics" }, { status: 500 })
  }
}

async function searchComics(query: string, apiKey: string): Promise<Comic[]> {
  try {
    const response = await fetch(
      `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(query)}&resources=volume&limit=12&field_list=id,name,image,description,site_detail_url,date_added,deck,publisher,count_of_issues,start_year`,
      {
        headers: {
          "User-Agent": "ComicTheoremApp/1.0",
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      return (data.results || []).map((comic: Comic) => ({
        ...comic,
        rating: calculateComicRating(comic),
      }))
    }
  } catch (error) {
    console.error("Error searching comics:", error)
  }
  return []
}

async function enhanceWithAI(comics: Comic[], query: string): Promise<Comic[]> {
  try {
    // Use OpenRouter AI to get additional context about the search
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Given the search query "${query}" and these comic results: ${comics.map((c) => c.name).join(", ")}, rank them by relevance and suggest why someone searching for "${query}" would be interested in each comic. Return a JSON array with comic names and relevance scores (1-10).`,
          },
        ],
      }),
    })

    if (response.ok) {
      const aiData = await response.json()
      const aiInsights = aiData.choices?.[0]?.message?.content

      // Try to parse AI response and enhance ratings
      if (aiInsights) {
        try {
          const insights = JSON.parse(aiInsights)
          if (Array.isArray(insights)) {
            comics.forEach((comic) => {
              const insight = insights.find((i) => i.name === comic.name)
              if (insight && insight.relevance) {
                comic.rating = Math.min(5, (comic.rating || 3) + insight.relevance / 10)
              }
            })
          }
        } catch (parseError) {
          console.log("Could not parse AI insights, using original ratings")
        }
      }
    }
  } catch (error) {
    console.log("AI enhancement failed, using original results:", error)
  }

  // Sort by rating (highest first)
  return comics.sort((a, b) => (b.rating || 0) - (a.rating || 0))
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
