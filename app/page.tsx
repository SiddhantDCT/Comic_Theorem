"use client"

import { useState } from "react"
import { ComicGrid } from "@/components/comic-grid"
import { AISuggestions } from "@/components/ai-suggestions"
import { ComicDetail } from "@/components/comic-detail"
import { GenreFilter } from "@/components/genre-filter"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FavoritesGrid } from "@/components/favorites-grid"
import { TrendingGrid } from "@/components/trending-grid"
import { ComicPreview } from "@/components/comic-preview"
import { usePeriodicScraper } from "@/hooks/use-periodic-scraper"
import { SubscriptionButton } from "@/components/SubscriptionButton"


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

export default function HomePage() {
  const { getScrapedComics, getLastScrapeTime } = usePeriodicScraper()

  const [currentView, setCurrentView] = useState<
    "browse" | "ai-suggestions" | "favorites" | "trending" | "comic-detail" | "comic-preview"
  >("browse")
  const [selectedComic, setSelectedComic] = useState<Comic | undefined>()
  const [searchResults, setSearchResults] = useState<Comic[] | undefined>()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedGenre, setSelectedGenre] = useState<string>("")

  const handleComicSelect = (comic: Comic) => {
    setSelectedComic(comic)
    setCurrentView("comic-preview")
  }

  const handleSearch = (query: string, results: Comic[]) => {
    setSearchQuery(query)
    setSearchResults(results)
    setSelectedGenre("") // Clear genre when searching
    setCurrentView("browse")
  }

  const handleAISuggestionsClick = () => {
    setCurrentView("ai-suggestions")
  }

  const handleFavoritesClick = () => {
    setCurrentView("favorites")
    setSearchResults(undefined)
    setSearchQuery("")
    setSelectedGenre("")
  }

  const handleTrendingClick = () => {
    setCurrentView("trending")
    setSearchResults(undefined)
    setSearchQuery("")
    setSelectedGenre("")
  }

  const handleHomeClick = () => {
    setCurrentView("browse")
    setSelectedComic(undefined)
    setSearchResults(undefined)
    setSearchQuery("")
    setSelectedGenre("")
  }

  const handleBackToBrowse = () => {
    setCurrentView("browse")
    setSelectedComic(undefined)
    setSearchResults(undefined)
    setSearchQuery("")
  }

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre)
    setCurrentView("browse")
    setSearchResults(undefined)
    setSearchQuery("")
  }

  const handleClearGenre = () => {
    setSelectedGenre("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        onAISuggestionsClick={handleAISuggestionsClick}
        onHomeClick={handleHomeClick}
        onFavoritesClick={handleFavoritesClick}
        onTrendingClick={handleTrendingClick}
      />

      {currentView !== "comic-detail" && currentView !== "comic-preview" && (
        <div className="border-b border-border bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Genre filter on the left */}
              <div className="flex-1 max-w-md">
                <GenreFilter
                  selectedGenre={selectedGenre}
                  onGenreSelect={handleGenreSelect}
                  onClearGenre={handleClearGenre}
                  compact={true}
                />
              </div>
              
              {/* Subscription button on the right */}
              <SubscriptionButton />
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {currentView === "browse" ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-foreground mb-4 text-balance">COMIC THEOREM</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                Discover the greatest comic books of all time with reviews, ratings, and stunning artwork from Comic Theorem's extensive database.
              </p>
            </div>
            <ComicGrid
              searchResults={searchResults}
              searchQuery={searchQuery}
              selectedGenre={selectedGenre}
              onComicSelect={handleComicSelect}
            />
          </>
        ) : currentView === "favorites" ? (
          <FavoritesGrid />
        ) : currentView === "trending" ? (
          <TrendingGrid />
        ) : currentView === "ai-suggestions" ? (
          <AISuggestions selectedComic={selectedComic} onClose={handleBackToBrowse} />
        ) : currentView === "comic-preview" ? (
          <ComicPreview selectedComic={selectedComic} onClose={handleBackToBrowse} />
        ) : (
          <ComicDetail selectedComic={selectedComic} onClose={handleBackToBrowse} />
        )}
      </main>
      <Footer />
    </div>
  )
}