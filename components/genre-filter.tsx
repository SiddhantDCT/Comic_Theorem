"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

const POPULAR_GENRES = [
  "Superhero",
  "Horror",
  "Science Fiction",
  "Fantasy",
  "Crime",
  "Romance",
  "Comedy",
  "Action",
  "Adventure",
  "Mystery",
  "Thriller",
  "Western",
]

interface GenreFilterProps {
  selectedGenre: string
  onGenreSelect: (genre: string) => void
  onClearGenre: () => void
  compact?: boolean
}

export function GenreFilter({ selectedGenre, onGenreSelect, onClearGenre, compact = false }: GenreFilterProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-transparent border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground"
              >
                <span className="mr-2">{selectedGenre || "Select Genre"}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {POPULAR_GENRES.map((genre) => (
                <DropdownMenuItem
                  key={genre}
                  onClick={() => onGenreSelect(genre)}
                  className={selectedGenre === genre ? "bg-accent text-accent-foreground" : ""}
                >
                  {genre}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedGenre && (
            <Button onClick={onClearGenre} variant="outline" size="sm" className="h-9 text-xs bg-transparent">
              Clear
            </Button>
          )}
        </div>

        {selectedGenre && (
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            {selectedGenre}
          </Badge>
        )}
      </div>
    )
  }

  // Original full-size display for dedicated genres view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Browse by Genre</h2>
        {selectedGenre && (
          <Button onClick={onClearGenre} variant="outline" size="sm">
            Clear Filter
          </Button>
        )}
      </div>

      {selectedGenre && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Showing:</span>
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            {selectedGenre}
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {POPULAR_GENRES.map((genre) => (
          <Button
            key={genre}
            onClick={() => onGenreSelect(genre)}
            variant={selectedGenre === genre ? "default" : "outline"}
            className={`text-sm ${
              selectedGenre === genre
                ? "bg-accent text-accent-foreground"
                : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {genre}
          </Button>
        ))}
      </div>
    </div>
  )
}
