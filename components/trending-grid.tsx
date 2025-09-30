"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Star, Calendar, Users, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useFavorites } from "@/hooks/use-favorites"

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

interface TrendingComicCardProps {
  comic: Comic
  rank: number
}

const staticTrendingComics: Comic[] = [
  {
    id: 1,
    name: "Batman: The Dark Knight Returns",
    image: {
      medium_url: "/images/batman-dark-knight.jpg",
      original_url: "/images/batman-dark-knight.jpg",
    },
    description: "The legendary Batman story that changed comics forever.",
    site_detail_url: "#",
    date_added: "2024-01-01",
    deck: "The legendary Batman story that changed comics forever.",
    rating: 4.9,
    publisher: { name: "DC Comics" },
    count_of_issues: 4,
    start_year: 1986,
  },
  {
    id: 2,
    name: "Spider-Man: Into the Spider-Verse",
    image: {
      medium_url: "/images/spiderman-spiderverse.jpg",
      original_url: "/images/spiderman-spiderverse.jpg",
    },
    description: "Multiple Spider-People unite across dimensions.",
    site_detail_url: "#",
    date_added: "2024-01-02",
    deck: "Multiple Spider-People unite across dimensions.",
    rating: 4.8,
    publisher: { name: "Marvel Comics" },
    count_of_issues: 5,
    start_year: 2018,
  },
  {
    id: 3,
    name: "Watchmen",
    image: {
      medium_url: "/images/watchmen.jpg",
      original_url: "/images/watchmen.jpg",
    },
    description: "Who watches the Watchmen?",
    site_detail_url: "#",
    date_added: "2024-01-03",
    deck: "Who watches the Watchmen?",
    rating: 4.7,
    publisher: { name: "DC Comics" },
    count_of_issues: 12,
    start_year: 1986,
  },
  {
    id: 4,
    name: "The Walking Dead",
    image: {
      medium_url: "/images/walking-dead.jpg",
      original_url: "/images/walking-dead.jpg",
    },
    description: "Survival horror in a zombie apocalypse.",
    site_detail_url: "#",
    date_added: "2024-01-04",
    deck: "Survival horror in a zombie apocalypse.",
    rating: 4.6,
    publisher: { name: "Image Comics" },
    count_of_issues: 193,
    start_year: 2003,
  },
  {
    id: 5,
    name: "X-Men",
    image: {
      medium_url: "/images/x-men.jpg",
      original_url: "/images/x-men.jpg",
    },
    description: "Mutants fighting for a world that hates them.",
    site_detail_url: "#",
    date_added: "2024-01-05",
    deck: "Mutants fighting for a world that hates them.",
    rating: 4.5,
    publisher: { name: "Marvel Comics" },
    count_of_issues: 600,
    start_year: 1963,
  },
]

function TrendingComicCard({ comic, rank }: TrendingComicCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const isComicFavorite = isFavorite(comic.id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(comic)
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-black"
      case 3:
        return "bg-gradient-to-r from-amber-500 to-amber-700 text-white"
      default:
        return "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
    }
  }

  return (
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-4 p-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <Badge className={`${getRankColor(rank)} font-bold text-lg px-4 py-2 shadow-lg min-w-[60px] text-center`}>
            #{rank}
          </Badge>
        </div>

        {/* Comic Image */}
        <div className="relative w-20 h-28 overflow-hidden rounded-lg flex-shrink-0">
          <img
            src={comic.image?.medium_url || "/placeholder.svg?height=200&width=150&query=comic book cover"}
            alt={comic.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <Button
            onClick={handleFavoriteClick}
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 backdrop-blur-sm p-1.5 h-auto w-auto"
          >
            <Heart
              className={`h-4 w-4 ${
                isComicFavorite ? "fill-red-500 text-red-500" : "text-white hover:text-red-500"
              } transition-colors`}
            />
          </Button>
        </div>

        {/* Comic Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xl mb-2 line-clamp-1 group-hover:text-accent transition-colors">
            {comic.name}
          </h3>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            {comic.publisher && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{comic.publisher.name}</span>
              </div>
            )}

            {comic.start_year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{comic.start_year}</span>
              </div>
            )}

            {comic.count_of_issues && <div className="text-xs">{comic.count_of_issues} issues</div>}
          </div>

          {comic.deck && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{comic.deck}</p>}
        </div>

        {/* Rating */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {comic.rating && (
            <Badge variant="secondary" className="bg-black/10 text-foreground backdrop-blur-sm">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {comic.rating.toFixed(1)}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}

export function TrendingGrid() {
  const [trendingComics, setTrendingComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendingComics = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulate loading delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setTrendingComics(staticTrendingComics)
      } catch (err) {
        console.error("Error fetching trending comics:", err)
        setError("Failed to load trending comics")
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingComics()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading trending comics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-gradient-to-r from-accent to-accent/80">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">Top Comics Ranking</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-accent to-accent/50 rounded-full mx-auto"></div>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-card to-card/50 border-accent/20">
          <CardContent className="p-6">
            <p className="text-muted-foreground text-lg">
              The ultimate ranking of comics based on community ratings, critical acclaim, and cultural impact.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {trendingComics.map((comic, index) => (
          <TrendingComicCard key={comic.id} comic={comic} rank={index + 1} />
        ))}
      </div>
    </div>
  )
}
