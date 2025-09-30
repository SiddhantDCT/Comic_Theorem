"use client"

import { useState, useEffect } from "react"
import { ComicCard } from "./comic-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Comic {
  id: number
  name: string
  image: {
    medium_url: string
    original_url: string
  }
  description: string
  site_detail_url: string
  date_added: string
  deck: string
  rating?: number
  publisher?: {
    name: string
  }
  count_of_issues?: number
  start_year?: number
}

interface ComicVineResponse {
  error: string
  limit: number
  offset: number
  number_of_page_results: number
  number_of_total_results: number
  status_code: number
  results: Comic[]
}

interface ComicGridProps {
  searchResults?: Comic[]
  searchQuery?: string
  selectedGenre?: string
  onComicSelect?: (comic: Comic) => void
}

export function ComicGrid({ searchResults, searchQuery, selectedGenre, onComicSelect }: ComicGridProps) {
  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const API_KEY = "bd7d82a0262443d662eb697abf55b7dc499d575a"
  const LIMIT = 12

  const fetchComics = async (currentOffset = 0, append = false) => {
    try {
      setLoading(true)
      let url = `/api/comics?offset=${currentOffset}&limit=${LIMIT}&api_key=${API_KEY}`

      // If a genre is selected, use the genres API endpoint
      if (selectedGenre) {
        url = `/api/genres?genre=${encodeURIComponent(selectedGenre)}&offset=${currentOffset}&limit=${LIMIT}&api_key=${API_KEY}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch comics")
      }

      const data: ComicVineResponse = await response.json()

      if (data.status_code === 1) {
        const newComics = data.results.filter((comic) => comic.image && comic.name)

        if (append) {
          setComics((prev) => [...prev, ...newComics])
        } else {
          setComics(newComics)
        }

        setHasMore(data.number_of_page_results === LIMIT)
        setOffset(currentOffset + LIMIT)
      } else {
        throw new Error("API returned error status")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!searchResults) {
      setOffset(0)
      fetchComics()
    } else {
      setComics(searchResults)
      setLoading(false)
    }
  }, [searchResults, selectedGenre])

  const loadMore = () => {
    fetchComics(offset, true)
  }

  if (loading && comics.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-2 text-foreground">Loading comics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive text-lg mb-4">Error loading comics: {error}</p>
        <Button onClick={() => fetchComics()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div>
      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Search results for "{searchQuery}" ({comics.length} found)
          </h2>
        </div>
      )}

      {selectedGenre && !searchQuery && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {selectedGenre} Comics ({comics.length} found)
          </h2>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {comics.map((comic) => (
          <div key={comic.id} onClick={() => onComicSelect?.(comic)} className="cursor-pointer">
            <ComicCard comic={comic} />
          </div>
        ))}
      </div>

      {!searchResults && hasMore && (
        <div className="text-center mt-12">
          <Button
            onClick={loadMore}
            disabled={loading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load More Comics"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
