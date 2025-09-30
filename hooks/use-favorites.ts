"use client"

import { useState, useEffect } from "react"

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

export function useFavorites() {
  const [favorites, setFavorites] = useState<Comic[]>([])

  useEffect(() => {
    const savedFavorites = localStorage.getItem("comic-favorites")
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites)
        console.log("[v0] Loading favorites from localStorage:", parsed.length, "comics")
        setFavorites(parsed)
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error)
        setFavorites([])
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "comic-favorites" && e.newValue) {
        try {
          const newFavorites = JSON.parse(e.newValue)
          console.log("[v0] Syncing favorites from storage event:", newFavorites.length, "comics")
          setFavorites(newFavorites)
        } catch (error) {
          console.error("Error parsing favorites from storage event:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const addToFavorites = (comic: Comic) => {
    console.log("[v0] Adding comic to favorites:", comic.name)
    const updatedFavorites = [...favorites, comic]
    setFavorites(updatedFavorites)
    localStorage.setItem("comic-favorites", JSON.stringify(updatedFavorites))
    console.log("[v0] Total favorites after adding:", updatedFavorites.length)
  }

  const removeFromFavorites = (comicId: number) => {
    console.log("[v0] Removing comic from favorites:", comicId)
    const updatedFavorites = favorites.filter((comic) => comic.id !== comicId)
    setFavorites(updatedFavorites)
    localStorage.setItem("comic-favorites", JSON.stringify(updatedFavorites))
    console.log("[v0] Total favorites after removing:", updatedFavorites.length)
  }

  const isFavorite = (comicId: number) => {
    const result = favorites.some((comic) => comic.id === comicId)
    console.log("[v0] Checking if comic", comicId, "is favorite:", result)
    return result
  }

  const toggleFavorite = (comic: Comic) => {
    console.log("[v0] Toggling favorite for comic:", comic.name, "Current favorites count:", favorites.length)
    if (isFavorite(comic.id)) {
      removeFromFavorites(comic.id)
    } else {
      addToFavorites(comic)
    }
  }

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
  }
}
