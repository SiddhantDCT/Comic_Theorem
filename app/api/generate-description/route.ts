import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { comic } = await request.json()

    if (!comic) {
      return NextResponse.json({ error: "Comic data is required" }, { status: 400 })
    }

    // Generate a smart fallback description without AI
    const description = generateSmartDescription(comic)

    // Simulate AI processing time (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    return NextResponse.json({ description })
    
  } catch (error) {
    console.error("Error generating description:", error)
    
    const fallback = `Discover ${comic?.name || 'this comic'}, an exciting series that delivers compelling storytelling and dynamic artwork.`
    
    return NextResponse.json({ description: fallback })
  }
}

function generateSmartDescription(comic: any) {
  const { name, publisher, start_year, description, deck, count_of_issues } = comic
  
  // Base template
  let baseDescription = `**${name}**`
  
  // Add publisher info
  if (publisher?.name) {
    baseDescription += ` from **${publisher.name}**`
  }
  
  // Add year info
  if (start_year) {
    baseDescription += ` launched in **${start_year}**`
  }
  
  // Add issue count
  if (count_of_issues) {
    baseDescription += ` spanning **${count_of_issues} issues**`
  }
  
  // Add the main content
  baseDescription += `. ${deck || ''}`
  
  // Use original description if available, but clean it up
  if (description) {
    const cleanDescription = description
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&[^;]+;/g, "") // Remove HTML entities
      .substring(0, 200)
    
    if (cleanDescription.length > 50) {
      baseDescription += ` ${cleanDescription}...`
    }
  }
  
  // Add engaging ending if description is short
  if (baseDescription.length < 150) {
    baseDescription += ` This compelling series features engaging storylines, memorable characters, and stunning artwork that has captivated readers worldwide. Explore the unique universe and discover why this comic stands out.`
  }
  
  return baseDescription
}