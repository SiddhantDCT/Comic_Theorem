"use client"

import { ComicCard } from "@/components/comic-card"
import { useFavorites } from "@/hooks/use-favorites"

export function FavoritesGrid() {
  const { favorites } = useFavorites()

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">No Favorites Yet</h2>
        <p className="text-muted-foreground">
          Start adding comics to your favorites by clicking the heart icon on any comic card.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Your Favorite Comics</h2>
        <p className="text-muted-foreground">
          You have {favorites.length} comic{favorites.length !== 1 ? "s" : ""} in your favorites.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {favorites.map((comic) => (
          <ComicCard key={comic.id} comic={comic} />
        ))}
      </div>
    </div>
  )
}
