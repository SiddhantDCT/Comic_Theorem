"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ComicCard } from "@/components/comic-card"
import { Sparkles, Loader2, Search, X } from "lucide-react"

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

interface AISuggestionsProps {
  selectedComic?: Comic
  onClose: () => void
}

export function AISuggestions({ selectedComic, onClose }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Comic[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Comic[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const API_KEY = "bd7d82a0262443d662eb697abf55b7dc499d575a"

  const generateSuggestions = async (comic: Comic) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comic,
          apiKey: API_KEY,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate suggestions")
      }

      const data = await response.json()
      setSuggestions(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    setSearchLoading(true)
    setSearchError(null)

    try {
      const response = await fetch("/api/search-comics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          apiKey: API_KEY,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to search comics")
      }

      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed")
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setSearchError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold text-foreground">AI Suggestions</h2>
        </div>
        <Button variant="ghost" onClick={onClose} className="text-foreground hover:text-accent">
          Back to Browse
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search for Comics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search for comics, characters, or publishers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(searchQuery)
                  }
                }}
                className="pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={() => handleSearch(searchQuery)}
              disabled={searchLoading || !searchQuery.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {searchError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
              <p className="text-destructive text-sm">Error: {searchError}</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-3">Search Results ({searchResults.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.map((comic) => (
                  <ComicCard key={comic.id} comic={comic} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!selectedComic ? (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Get Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Click on any comic from the main grid to get AI-powered suggestions for similar comics you might enjoy!
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Our AI analyzes publisher, genre, era, and themes to find perfect matches</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Based on: {selectedComic.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                {selectedComic.image?.medium_url && (
                  <img
                    src={selectedComic.image.medium_url || "/placeholder.svg"}
                    alt={selectedComic.name}
                    className="w-16 h-20 object-cover rounded"
                  />
                )}
                <div>
                  <p className="text-foreground font-medium">{selectedComic.name}</p>
                  {selectedComic.publisher && (
                    <p className="text-muted-foreground text-sm">{selectedComic.publisher.name}</p>
                  )}
                  {selectedComic.start_year && (
                    <p className="text-muted-foreground text-sm">Started: {selectedComic.start_year}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => generateSuggestions(selectedComic)}
                disabled={loading}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating Suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get AI Suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Card className="bg-destructive/10 border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">Error: {error}</p>
              </CardContent>
            </Card>
          )}

          {suggestions.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Recommended for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {suggestions.map((comic) => (
                  <ComicCard key={comic.id} comic={comic} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
