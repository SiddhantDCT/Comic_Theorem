"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Card } from "@/components/ui/card"

interface SearchResult {
  id: number
  name: string
  image?: {
    thumb_url: string
  }
  publisher?: {
    name: string
  }
  start_year?: number
}

interface SearchBarProps {
  onSearch: (query: string, results: SearchResult[]) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const API_KEY = "bd7d82a0262443d662eb697abf55b7dc499d575a"

  // Popular comic suggestions to show when no search is performed
  const popularSuggestions = ["Batman", "Spider-Man", "X-Men"]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions(query)
      }, 300)

      return () => clearTimeout(debounceTimer)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const fetchSuggestions = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&api_key=${API_KEY}&limit=3`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.results || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&api_key=${API_KEY}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        onSearch(searchQuery, data.results || [])
        setShowSuggestions(false)
        setQuery("")
      }
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: SearchResult) => {
    handleSearch(suggestion.name)
  }

  const handlePopularSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search comics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            onFocus={() => query.length > 2 && setShowSuggestions(true)}
            className="pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                setSuggestions([])
                setShowSuggestions(false)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (suggestions.length > 0 || query.length <= 2) && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 bg-card border-border shadow-lg z-50">
          {query.length <= 2 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
              <div className="space-y-2">
                {popularSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularSuggestionClick(suggestion)}
                    className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Suggestions:</p>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-3 w-full text-left p-2 rounded hover:bg-muted transition-colors"
                  >
                    {suggestion.image?.thumb_url && (
                      <img
                        src={suggestion.image.thumb_url || "/placeholder.svg"}
                        alt={suggestion.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="text-foreground font-medium">{suggestion.name}</p>
                      {suggestion.publisher && (
                        <p className="text-xs text-muted-foreground">
                          {suggestion.publisher.name}
                          {suggestion.start_year && ` • ${suggestion.start_year}`}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
