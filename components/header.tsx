"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import GoogleSignIn from "./GoogleSignIn"
import UserProfile from "./UserProfile"

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

interface HeaderProps {
  onSearch?: (query: string, results: SearchResult[]) => void
  onAISuggestionsClick?: () => void
  onHomeClick?: () => void
  onFavoritesClick?: () => void
  onTrendingClick?: () => void
}

interface User {
  name: string
  picture: string
  email: string
}

export function Header({
  onSearch,
  onAISuggestionsClick,
  onHomeClick,
  onFavoritesClick,
  onTrendingClick,
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for existing session on component mount
    try {
      const userData = localStorage.getItem('userData')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem('userData')
    }
  }, [])

  const handleSearch = (query: string, results: SearchResult[]) => {
    onSearch?.(query, results)
    setShowSearch(false)
  }

  const handleSignOut = () => {
    setUser(null)
    localStorage.removeItem('userData')
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <button
            onClick={onHomeClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">CT</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">COMIC THEOREM</h1>
          </button>

          <div className="flex items-center space-x-4">
            {showSearch ? (
              <div className="w-80">
                <SearchBar onSearch={handleSearch} />
              </div>
            ) : (
              <>
                <Button onClick={onAISuggestionsClick} variant="ghost" className="text-foreground hover:text-accent">
                  AI Suggestions
                </Button>
                <Button onClick={onFavoritesClick} variant="ghost" className="text-foreground hover:text-accent">
                  Favorites
                </Button>
                <Button onClick={onTrendingClick} variant="ghost" className="text-foreground hover:text-accent">
                  Trending
                </Button>
                <Button
                  onClick={() => setShowSearch(true)}
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                >
                  Search
                </Button>
              </>
            )}
            {showSearch && (
              <Button
                onClick={() => setShowSearch(false)}
                variant="ghost"
                className="text-foreground hover:text-accent"
              >
                Cancel
              </Button>
            )}

            {/* Buy me a coffee button */}
            <a 
              href="https://buymeacoffee.com/SiddhantDCT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors shadow-sm text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.5 2C5.5 2 4.6 2.5 4.1 3.3L2.3 6.2C1.5 7.5 2.4 9 4 9H20C21.6 9 22.5 7.5 21.7 6.2L19.9 3.3C19.4 2.5 18.5 2 17.5 2H6.5ZM4 10C2.3 10 1 11.3 1 13V18C1 20.2 2.8 22 5 22H19C21.2 22 23 20.2 23 18V13C23 11.3 21.7 10 20 10H4Z"/>
              </svg>
              Buy me a coffee
            </a>

            {/* Google Sign-In Section */}
            <div className="ml-2">
              {user ? (
                <UserProfile user={user} onSignOut={handleSignOut} />
              ) : (
                <GoogleSignIn onSignIn={setUser} />
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}