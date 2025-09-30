"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, BookOpen } from "lucide-react"

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
  rating?: number
  publisher?: {
    name: string
  }
  count_of_issues?: number
  start_year?: number
}

interface ComicDetailProps {
  selectedComic?: Comic
  onClose: () => void
}

export function ComicDetail({ selectedComic, onClose }: ComicDetailProps) {
  const [aiDescription, setAiDescription] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateDescription = async (comic: Comic) => {
    setLoading(true)
    setError(null)
    setAiDescription("")

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comic: {
            name: comic.name,
            publisher: comic.publisher?.name,
            start_year: comic.start_year,
            description: comic.description,
            deck: comic.deck,
            count_of_issues: comic.count_of_issues,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate description")
      }

      const data = await response.json()
      setAiDescription(data.description)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedComic) {
      generateDescription(selectedComic)
    }
  }, [selectedComic])

  if (!selectedComic) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">No Comic Selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select a comic to view its details.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold text-foreground">Comic Details</h2>
        </div>
        <Button variant="ghost" onClick={onClose} className="text-foreground hover:text-accent">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comic Image and Basic Info */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              {selectedComic.image?.medium_url && (
                <img
                  src={selectedComic.image.medium_url || "/placeholder.svg"}
                  alt={selectedComic.name}
                  className="w-full h-auto object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-bold text-foreground mb-2">{selectedComic.name}</h3>
              {selectedComic.publisher && (
                <p className="text-muted-foreground mb-1">
                  <span className="font-medium">Publisher:</span> {selectedComic.publisher.name}
                </p>
              )}
              {selectedComic.start_year && (
                <p className="text-muted-foreground mb-1">
                  <span className="font-medium">Started:</span> {selectedComic.start_year}
                </p>
              )}
              {selectedComic.count_of_issues && (
                <p className="text-muted-foreground mb-1">
                  <span className="font-medium">Issues:</span> {selectedComic.count_of_issues}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Generated Description */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                AI Generated Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-accent mr-2" />
                  <span className="text-foreground">Generating description...</span>
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive">Error: {error}</p>
                  <Button
                    onClick={() => generateDescription(selectedComic)}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {aiDescription && !loading && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{aiDescription}</p>
                </div>
              )}

              {!loading && !error && !aiDescription && (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </CardContent>
          </Card>

          {/* Original Description if available */}
          {selectedComic.description && (
            <Card className="bg-card border-border mt-4">
              <CardHeader>
                <CardTitle className="text-foreground">Original Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-foreground leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedComic.description }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
