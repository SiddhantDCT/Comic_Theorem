import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const offset = searchParams.get("offset") || "0"
  const limit = searchParams.get("limit") || "12"
  const apiKey = searchParams.get("api_key")

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://comicvine.gamespot.com/api/volumes/?api_key=${apiKey}&format=json&limit=${limit}&offset=${offset}&sort=date_added:desc&field_list=id,name,image,description,site_detail_url,date_added,deck,publisher,count_of_issues,start_year`,
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

      data.results.sort((a: any, b: any) => {
        const aPublisher = a.publisher?.name?.toLowerCase() || ""
        const bPublisher = b.publisher?.name?.toLowerCase() || ""

        const isMarvelOrDC = (publisher: string) =>
          publisher.includes("marvel") || publisher.includes("dc comics") || publisher.includes("dc entertainment")

        const aIsMarvelOrDC = isMarvelOrDC(aPublisher)
        const bIsMarvelOrDC = isMarvelOrDC(bPublisher)

        // If one is Marvel/DC and the other isn't, prioritize Marvel/DC
        if (aIsMarvelOrDC && !bIsMarvelOrDC) return -1
        if (!aIsMarvelOrDC && bIsMarvelOrDC) return 1

        // If both are Marvel/DC, sort Marvel first, then DC
        if (aIsMarvelOrDC && bIsMarvelOrDC) {
          const aIsMarvel = aPublisher.includes("marvel")
          const bIsMarvel = bPublisher.includes("marvel")
          if (aIsMarvel && !bIsMarvel) return -1
          if (!aIsMarvel && bIsMarvel) return 1
        }

        // For same category, maintain original order (by date_added desc)
        return 0
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching comics:", error)
    return NextResponse.json({ error: "Failed to fetch comics from Comic Vine API" }, { status: 500 })
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
