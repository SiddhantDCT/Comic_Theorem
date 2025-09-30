import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { comic } = await request.json()

    if (!comic) {
      return NextResponse.json({ error: "Comic data is required" }, { status: 400 })
    }

    // Generate a detailed long description
    const description = generateDetailedDescription(comic)

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

    return NextResponse.json({ description })
    
  } catch (error) {
    console.error("Error generating description:", error)
    
    const fallback = generateDetailedDescription(comic)
    return NextResponse.json({ description: fallback })
  }
}

function generateDetailedDescription(comic: any) {
  const { name, publisher, start_year, description, deck, count_of_issues, rating } = comic
  
  // Start with an engaging introduction
  let longDescription = `# ${name}\n\n`
  
  // Publisher and timeline section
  longDescription += `## Publication History\n`
  if (publisher?.name) {
    longDescription += `**Publisher:** ${publisher.name}\n\n`
  }
  if (start_year) {
    longDescription += `**First Published:** ${start_year}\n\n`
  }
  if (count_of_issues) {
    longDescription += `**Total Issues:** ${count_of_issues}\n\n`
  }
  if (rating) {
    longDescription += `**Community Rating:** ${rating}/5\n\n`
  }

  // Main story section
  longDescription += `## Overview\n`
  
  if (deck) {
    longDescription += `*${deck}*\n\n`
  }

  // Enhanced description with more detail
  if (description) {
    const cleanDescription = description
      .replace(/<[^>]*>/g, "")
      .replace(/&[^;]+;/g, "")
      .replace(/&nbsp;/g, " ")
    
    longDescription += `${cleanDescription}\n\n`
  } else {
    // Generate a comprehensive description
    longDescription += `${name} stands as a landmark series in the comic book landscape, offering readers an immersive experience through its rich narrative tapestry and compelling character development. `
  }

  // Add detailed story elements
  longDescription += `## Story & Characters\n`
  longDescription += `The series masterfully blends action-packed sequences with deep emotional moments, creating a balanced narrative that appeals to both new readers and long-time fans. Character arcs are carefully crafted, with protagonists facing moral dilemmas and personal growth that resonate with audiences. The supporting cast adds depth to the universe, each bringing unique perspectives and abilities that enrich the main storyline.\n\n`

  // Art and style section
  longDescription += `## Art & Visual Style\n`
  longDescription += `Visually stunning artwork complements the narrative, with dynamic panel layouts that enhance the storytelling. The character designs are distinctive and memorable, while the action sequences are choreographed with cinematic flair. Background details and world-building elements create an immersive environment that feels both fantastic and grounded.\n\n`

  // Legacy and impact
  longDescription += `## Legacy & Impact\n`
  longDescription += `This series has left an indelible mark on comic book history, influencing subsequent generations of creators and inspiring adaptations across various media. Its themes remain relevant, exploring complex issues while maintaining the sense of wonder and adventure that defines the comic book medium. The enduring popularity of ${name} speaks to its quality and the emotional connection it establishes with its audience.\n\n`

  // Why read it section
  longDescription += `## Why You Should Read It\n`
  longDescription += `Whether you're a seasoned comic enthusiast or new to the medium, ${name} offers a perfect entry point with its accessible yet sophisticated storytelling. The series balances standalone adventures with longer narrative arcs, providing both immediate satisfaction and long-term investment in the characters' journeys. Its ability to evolve while maintaining core principles makes it a timeless addition to any comic collection.`

  return longDescription
}