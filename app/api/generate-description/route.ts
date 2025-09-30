import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { comic } = await request.json()

    if (!comic) {
      return NextResponse.json({ error: "Comic data is required" }, { status: 400 })
    }

    // Prepare the prompt for the AI
    const prompt = `Generate a detailed description for the comic "${comic.name}". 

Comic Info:
- Name: ${comic.name}
- Publisher: ${comic.publisher || "Unknown"}
- Start Year: ${comic.start_year || "Unknown"}
${comic.description ? `- Description: ${comic.description.replace(/<[^>]*>/g, "").substring(0, 200)}` : ""}

Write a concise description covering the main storyline, key characters, and what makes this comic unique. Keep it under 150 words.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // Cheaper model
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200, // Reduced from 500
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter API error:", errorData)
      
      if (response.status === 402) {
        return NextResponse.json({ 
          error: "AI service credits exhausted. Please try again later." 
        }, { status: 402 })
      }
      
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response from OpenRouter API")
    }

    const description = data.choices[0].message.content

    return NextResponse.json({ description })
  } catch (error) {
    console.error("Error generating description:", error)
    return NextResponse.json({ 
      error: "Failed to generate description. Please try again later." 
    }, { status: 500 })
  }
}