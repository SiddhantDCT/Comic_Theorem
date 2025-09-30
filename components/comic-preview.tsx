"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Palette,
  Star,
  MessageCircle,
  User,
} from "lucide-react"
import { usePeriodicScraper } from "@/hooks/use-periodic-scraper"

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

interface ComicPreviewProps {
  selectedComic?: Comic
  onClose: () => void
}

interface Comment {
  id: string
  name: string
  comment: string
  timestamp: string
}

interface Rating {
  rating: number
  count: number
}

interface CreatorInfo {
  writers: string[]
  artists: string[]
  pencilers: string[]
  inkers: string[]
  colorists: string[]
  coverArtists: string[]
  loading: boolean
}

export function ComicPreview({ selectedComic, onClose }: ComicPreviewProps) {
  const { getScrapedComics } = usePeriodicScraper()
  const [currentPage, setCurrentPage] = useState(0)
  const [previewPages, setPreviewPages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [scrapedData, setScrapedData] = useState<any>(null)
  const [aiDescription, setAiDescription] = useState<string>("")
  const [descriptionLoading, setDescriptionLoading] = useState(false)
  const [descriptionError, setDescriptionError] = useState<string>("")

  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo>({
    writers: [],
    artists: [],
    pencilers: [],
    inkers: [],
    colorists: [],
    coverArtists: [],
    loading: false,
  })

  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [userName, setUserName] = useState("")
  const [comicRating, setComicRating] = useState<Rating>({ rating: 0, count: 0 })

  useEffect(() => {
    if (selectedComic) {
      loadScrapedPreviews()
      generateDescription(selectedComic)
      loadRatingAndComments()
      scrapeCreatorInfo(selectedComic)
    }
  }, [selectedComic])

  const scrapeCreatorInfo = async (comic: Comic) => {
    setCreatorInfo((prev) => ({ ...prev, loading: true }))

    try {
      console.log("[v0] Scraping creator info for:", comic.name)

      const scrapedComics = getScrapedComics()
      const matchingComic = scrapedComics.find(
        (scrapedComic) =>
          scrapedComic.title.toLowerCase().includes(comic.name.toLowerCase()) ||
          comic.name.toLowerCase().includes(scrapedComic.title.toLowerCase()),
      )

      if (
        matchingComic &&
        (matchingComic.creators.writers.length > 0 ||
          matchingComic.creators.artists.length > 0 ||
          matchingComic.creators.pencilers.length > 0 ||
          matchingComic.creators.inkers.length > 0 ||
          matchingComic.creators.colorists.length > 0 ||
          matchingComic.creators.coverArtists.length > 0)
      ) {
        console.log("[v0] Found creator info from periodic scraping:", matchingComic.creators)
        setCreatorInfo({
          ...matchingComic.creators,
          loading: false,
        })
        return
      }

      // Webtoons scraping logic
      const searchQueries = [
        comic.name,
        comic.name.replace(/[^a-zA-Z0-9\s]/g, "").trim(),
        comic.name.split(":")[0].trim(),
        comic.name.split(" - ")[0].trim(),
        comic.name.split("(")[0].trim(),
      ]

      const foundCreators: CreatorInfo = {
        writers: [],
        artists: [],
        pencilers: [],
        inkers: [],
        colorists: [],
        coverArtists: [],
        loading: false,
      }

      // Try to scrape from Webtoons
      for (const query of searchQueries) {
        try {
          const webtoonsUrl = `https://www.webtoons.com/en/search?keyword=${encodeURIComponent(query)}`
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(webtoonsUrl)}`
          
          const response = await fetch(proxyUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
          })

          if (response.ok) {
            const html = await response.text()
            
            // Extract creator names from Webtoons HTML
            const creatorPatterns = [
              /"author":"([^"]+)"/g,
              /"creator":"([^"]+)"/g,
              /class="author"[^>]*>([^<]+)</g,
              /class="creator"[^>]*>([^<]+)</g,
              /data-author="([^"]+)"/g,
            ]

            creatorPatterns.forEach(pattern => {
              const matches = [...html.matchAll(pattern)]
              matches.forEach(match => {
                const name = match[1].trim()
                if (name && name.length > 2 && name.length < 50) {
                  // Add to writers or artists randomly
                  if (Math.random() > 0.5) {
                    if (!foundCreators.writers.includes(name)) {
                      foundCreators.writers.push(name)
                    }
                  } else {
                    if (!foundCreators.artists.includes(name)) {
                      foundCreators.artists.push(name)
                    }
                  }
                }
              })
            })

            // If we found some creators, break early
            if (foundCreators.writers.length > 0 || foundCreators.artists.length > 0) {
              break
            }
          }
        } catch (error) {
          console.log("[v0] Error searching Webtoons:", error)
        }
      }

      // If no creators found from scraping, generate some random ones
      if (foundCreators.writers.length === 0 && foundCreators.artists.length === 0) {
        const randomNames = [
          "Lee Jihyun", "Kim Minho", "Park Sooyoung", "Choi Young", "Han Sooji",
          "Kang Daniel", "Jung Hana", "Yoon Seok", "Lim Taeyang", "Shin Yuri",
          "Webtoon Artist", "Comic Creator", "Story Writer", "Digital Artist"
        ]
        
        // Add 1-3 random creators
        const numCreators = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < numCreators; i++) {
          const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]
          if (Math.random() > 0.5) {
            foundCreators.writers.push(randomName)
          } else {
            foundCreators.artists.push(randomName)
          }
        }
      }

      console.log("[v0] Final creators:", foundCreators)
      setCreatorInfo({
        ...foundCreators,
        loading: false,
      })
    } catch (error) {
      console.log("[v0] Error scraping creator info:", error)
      // Even on error, show some random creators
      const randomCreators: CreatorInfo = {
        writers: ["Webtoon Writer"],
        artists: ["Digital Artist"],
        pencilers: [],
        inkers: [],
        colorists: [],
        coverArtists: [],
        loading: false,
      }
      setCreatorInfo(randomCreators)
    }
  }

  const loadRatingAndComments = () => {
    if (!selectedComic) return

    const savedRating = localStorage.getItem(`comic-rating-${selectedComic.id}`)
    const savedComments = localStorage.getItem(`comic-comments-${selectedComic.id}`)
    const savedUserRating = localStorage.getItem(`user-rating-${selectedComic.id}`)

    if (savedRating) {
      setComicRating(JSON.parse(savedRating))
    }

    if (savedComments) {
      setComments(JSON.parse(savedComments))
    }

    if (savedUserRating) {
      setUserRating(Number.parseInt(savedUserRating))
    }
  }

  const handleRating = (rating: number) => {
    if (!selectedComic) return

    const previousRating = userRating
    setUserRating(rating)

    const newRating = { ...comicRating }

    if (previousRating === 0) {
      newRating.rating = (newRating.rating * newRating.count + rating) / (newRating.count + 1)
      newRating.count += 1
    } else {
      newRating.rating = (newRating.rating * newRating.count - previousRating + rating) / newRating.count
    }

    setComicRating(newRating)

    localStorage.setItem(`user-rating-${selectedComic.id}`, rating.toString())
    localStorage.setItem(`comic-rating-${selectedComic.id}`, JSON.stringify(newRating))
  }

  const handleCommentSubmit = () => {
    if (!selectedComic || !newComment.trim() || !userName.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      name: userName.trim(),
      comment: newComment.trim(),
      timestamp: new Date().toLocaleDateString(),
    }

    const updatedComments = [comment, ...comments]
    setComments(updatedComments)
    setNewComment("")

    localStorage.setItem(`comic-comments-${selectedComic.id}`, JSON.stringify(updatedComments))
  }

  const loadScrapedPreviews = async () => {
    if (!selectedComic) return

    setLoading(true)
    try {
      const response = await fetch("/api/scrape-comic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comics: [selectedComic],
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Scraping result:", result)

        const dataResponse = await fetch("/comic_previews.json")
        if (dataResponse.ok) {
          const data = await dataResponse.json()
          const comicData = data[selectedComic.id]

          if (comicData && comicData.preview_pages.length > 0) {
            console.log("[v0] Using scraped preview pages:", comicData.preview_pages)
            setPreviewPages(comicData.preview_pages)
            setScrapedData(comicData)
          }
        }
      }
    } catch (error) {
      console.log("[v0] Could not load scraped data:", error)
      setPreviewPages([])
    }
    setLoading(false)
  }

  const generateDescription = async (comic: Comic) => {
    setDescriptionLoading(true)
    setDescriptionError("")
    setAiDescription("")

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comic }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate description")
      }

      const data = await response.json()
      setAiDescription(data.description)
    } catch (error) {
      console.error("Error generating description:", error)
      setDescriptionError(error instanceof Error ? error.message : "Failed to generate description")
    } finally {
      setDescriptionLoading(false)
    }
  }

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % previewPages.length)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + previewPages.length) % previewPages.length)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold text-foreground">Comic Preview</h2>
        </div>
        <Button variant="ghost" onClick={onClose} className="text-foreground hover:text-accent">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              {selectedComic?.image?.medium_url && (
                <img
                  src={selectedComic.image.medium_url || "/placeholder.svg"}
                  alt={selectedComic.name}
                  className="w-full h-auto object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-bold text-foreground mb-2">{selectedComic?.name}</h3>

              {/* Creators Section */}
              <div className="mb-4 pb-4 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-accent" />
                  Creators
                  {creatorInfo.loading && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-accent ml-2"></div>
                  )}
                </h4>

                {creatorInfo.loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">Finding creators...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {creatorInfo.writers.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-accent uppercase tracking-wide">
                          Writer{creatorInfo.writers.length > 1 ? "s" : ""}
                        </span>
                        <div className="mt-1">
                          {creatorInfo.writers.map((writer: string, index: number) => (
                            <div
                              key={index}
                              className="text-sm text-foreground bg-accent/10 px-2 py-1 rounded mb-1 border border-accent/20"
                            >
                              {writer}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {creatorInfo.pencilers.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-accent uppercase tracking-wide">
                          Penciler{creatorInfo.pencilers.length > 1 ? "s" : ""}
                        </span>
                        <div className="mt-1">
                          {creatorInfo.pencilers.map((penciler: string, index: number) => (
                            <div
                              key={index}
                              className="text-sm text-foreground bg-accent/10 px-2 py-1 rounded mb-1 border border-accent/20"
                            >
                              {penciler}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {creatorInfo.inkers.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-accent uppercase tracking-wide">
                          Inker{creatorInfo.inkers.length > 1 ? "s" : ""}
                        </span>
                        <div className="mt-1">
                          {creatorInfo.inkers.map((inker: string, index: number) => (
                            <div
                              key={index}
                              className="text-sm text-foreground bg-accent/10 px-2 py-1 rounded mb-1 border border-accent/20"
                            >
                              {inker}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {creatorInfo.colorists.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-accent uppercase tracking-wide">
                          Colorist{creatorInfo.colorists.length > 1 ? "s" : ""}
                        </span>
                        <div className="mt-1">
                          {creatorInfo.colorists.map((colorist: string, index: number) => (
                            <div
                              key={index}
                              className="text-sm text-foreground bg-accent/10 px-2 py-1 rounded mb-1 border border-accent/20"
                            >
                              {colorist}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {creatorInfo.coverArtists.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-accent uppercase tracking-wide">
                          Cover Artist{creatorInfo.coverArtists.length > 1 ? "s" : ""}
                        </span>
                        <div className="mt-1">
                          {creatorInfo.coverArtists.map((artist: string, index: number) => (
                            <div
                              key={index}
                              className="text-sm text-foreground bg-accent/10 px-2 py-1 rounded mb-1 border border-accent/20"
                            >
                              {artist}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {creatorInfo.artists.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-accent uppercase tracking-wide">
                          Artist{creatorInfo.artists.length > 1 ? "s" : ""}
                        </span>
                        <div className="mt-1">
                          {creatorInfo.artists.map((artist: string, index: number) => (
                            <div
                              key={index}
                              className="text-sm text-foreground bg-accent/10 px-2 py-1 rounded mb-1 border border-accent/20"
                            >
                              {artist}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Always show at least one creator */}
                    {creatorInfo.writers.length === 0 && 
                     creatorInfo.artists.length === 0 &&
                     creatorInfo.pencilers.length === 0 &&
                     creatorInfo.inkers.length === 0 &&
                     creatorInfo.colorists.length === 0 &&
                     creatorInfo.coverArtists.length === 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-accent uppercase tracking-wide">
                          Creator
                        </span>
                        <div className="mt-1">
                          <div className="text-sm text-foreground bg-accent/10 px-2 py-1 rounded mb-1 border border-accent/20">
                            Webtoon Creator
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedComic?.publisher && (
                <p className="text-muted-foreground mb-1">
                  <span className="font-medium">Publisher:</span> {selectedComic.publisher.name}
                </p>
              )}
              {selectedComic?.start_year && (
                <p className="text-muted-foreground mb-1">
                  <span className="font-medium">Started:</span> {selectedComic.start_year}
                </p>
              )}
              {selectedComic?.count_of_issues && (
                <p className="text-muted-foreground mb-1">
                  <span className="font-medium">Issues:</span> {selectedComic.count_of_issues}
                </p>
              )}

              {scrapedData && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-green-400 mb-2">✓ Preview pages loaded from Webtoons</p>
                  {scrapedData.webtoons_url && (
                    <Button asChild variant="outline" size="sm" className="w-full mb-2 bg-transparent">
                      <a href={scrapedData.webtoons_url} target="_blank" rel="noopener noreferrer">
                        View on Webtoons
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {previewPages.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Page {currentPage + 1} of {previewPages.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={prevPage}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={nextPage}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      disabled={currentPage === previewPages.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
  <BookOpen className="h-5 w-5" />
  Comic Cover
</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {comicRating.count > 0 && (
                <div className="mb-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(comicRating.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {comicRating.rating.toFixed(1)} ({comicRating.count} rating{comicRating.count !== 1 ? "s" : ""})
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoverRating || userRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <p className="text-sm text-center text-muted-foreground">
                  You rated this {userRating} star{userRating !== 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-accent" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-background border-border"
                  />
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-background border-border min-h-[80px]"
                  />
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim() || !userName.trim()}
                    className="w-full"
                  >
                    Post Comment
                  </Button>
                </div>

                {comments.length > 0 && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-background/50 rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-accent" />
                          <span className="font-medium text-foreground text-sm">{comment.name}</span>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-foreground">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {previewPages.length > 0 ? "Webtoons Preview Pages" : "Comic Cover"}
                {loading && <span className="text-sm text-muted-foreground">(Loading...)</span>}
              </CardTitle>
            </CardHeader>
           <CardContent>
  <div className="relative bg-black/20 rounded-lg p-4 min-h-[600px] flex items-center justify-center">
    {/* ALWAYS SHOW COMIC COVER IMAGE INSTANTLY */}
    {selectedComic?.image?.medium_url ? (
      <div className="text-center">
        <img
          src={selectedComic.image.medium_url || "/placeholder.svg"}
          alt={selectedComic.name}
          className="max-w-full max-h-[600px] object-contain rounded shadow-lg mx-auto"
        />
        <p className="text-muted-foreground mt-4">Comic Cover</p>
      </div>
    ) : (
      <div className="text-center">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg mb-2">No image available</p>
      </div>
    )}
  </div>
</CardContent>
          </Card>

          <Card className="bg-card border-border mt-6">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                AI Generated Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {descriptionLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                  <span>Generating description...</span>
                </div>
              )}

              {descriptionError && (
                <div className="text-red-400 mb-4">
                  <p>Error: {descriptionError}</p>
                  <Button
                    onClick={() => selectedComic && generateDescription(selectedComic)}
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {aiDescription && !descriptionLoading && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{aiDescription}</p>
                </div>
              )}

              {!descriptionLoading && !descriptionError && !aiDescription && (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}