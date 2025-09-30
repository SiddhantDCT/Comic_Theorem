import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs/promises"

export async function POST(request: NextRequest) {
  try {
    const { comics } = await request.json()

    if (!comics || !Array.isArray(comics)) {
      return NextResponse.json({ error: "Invalid comics data" }, { status: 400 })
    }

    console.log(
      "[v0] Starting comic scraping for:",
      comics.map((c) => c.name),
    )

    // Create a temporary file with comic data
    const tempFile = path.join(process.cwd(), "temp_comics.json")
    await fs.writeFile(tempFile, JSON.stringify(comics, null, 2))

    // Run the Python scraping script
    const scriptPath = path.join(process.cwd(), "scripts", "scrape_globalcomix.py")

    return new Promise((resolve) => {
      const pythonProcess = spawn("python3", [scriptPath], {
        cwd: process.cwd(),
        env: { ...process.env, COMICS_FILE: tempFile },
      })

      let output = ""
      let error = ""

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString()
        console.log("[v0] Python output:", data.toString())
      })

      pythonProcess.stderr.on("data", (data) => {
        error += data.toString()
        console.error("[v0] Python error:", data.toString())
      })

      pythonProcess.on("close", async (code) => {
        // Clean up temp file
        try {
          await fs.unlink(tempFile)
        } catch (e) {
          console.log("[v0] Could not delete temp file:", e)
        }

        if (code === 0) {
          // Try to read the results
          try {
            const resultsPath = path.join(process.cwd(), "public", "comic_previews.json")
            const results = await fs.readFile(resultsPath, "utf-8")
            resolve(
              NextResponse.json({
                success: true,
                data: JSON.parse(results),
                output,
              }),
            )
          } catch (e) {
            resolve(
              NextResponse.json({
                success: false,
                error: "Could not read results",
                output,
                pythonError: error,
              }),
            )
          }
        } else {
          resolve(
            NextResponse.json({
              success: false,
              error: `Python script failed with code ${code}`,
              output,
              pythonError: error,
            }),
          )
        }
      })
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
