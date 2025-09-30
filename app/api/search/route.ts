import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const apiKey = searchParams.get("api_key")
  const limit = searchParams.get("limit") || "10"

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 })
  }

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(query)}&resources=volume&limit=${limit}&field_list=id,name,image,description,site_detail_url,date_added,deck,publisher,count_of_issues,start_year`,
      {
        headers: {
          "User-Agent": "ComicTheoremApp/1.0",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Comic Vine API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.results) {
      data.results = data.results.map((comic: any) => ({
        ...comic,
        rating: calculateComicRating(comic),
      }))
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error searching comics:", error)
    return NextResponse.json({ error: "Failed to search comics from Comic Vine API" }, { status: 500 })
  }
}

function calculateComicRating(comic: any): number {
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
