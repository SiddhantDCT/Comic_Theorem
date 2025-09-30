"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Star, Heart } from "lucide-react"
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
}

interface ComicCardProps {
  comic: Comic
}

export function ComicCard({ comic }: ComicCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const isComicFavorite = isFavorite(comic.id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const stripHtml = (html: string) => {
    if (!html) return ""
    return html.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
  }

  const renderStarRating = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-gray-400" />
          <Star
            className="h-4 w-4 fill-yellow-400 text-yellow-400 absolute top-0 left-0"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>,
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-400" />)
    }

    return stars
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(comic)
  }

  return (
    <Card className="comic-card-hover bg-card border-border overflow-hidden group">
      <div className="aspect-[3/4] overflow-hidden relative">
        <img
          src={comic.image?.medium_url || "/placeholder.svg?height=400&width=300&query=comic book cover"}
          alt={comic.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <Button
          onClick={handleFavoriteClick}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm p-2 h-auto w-auto"
        >
          <Heart
            className={`h-5 w-5 ${
              isComicFavorite ? "fill-red-500 text-red-500" : "text-white hover:text-red-500"
            } transition-colors`}
          />
        </Button>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg font-bold line-clamp-2 text-balance leading-tight">
          {comic.name}
        </CardTitle>

        {comic.rating && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">{renderStarRating(comic.rating)}</div>
            <span className="text-yellow-400 text-sm font-medium">{comic.rating.toFixed(1)}</span>
          </div>
        )}

        {comic.publisher && <div className="text-gray-400 text-sm font-medium">{comic.publisher.name}</div>}

        <div className="flex items-center text-gray-500 text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(comic.date_added)}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-center text-sm text-muted-foreground">Click to preview</div>
      </CardContent>
    </Card>
  )
}
