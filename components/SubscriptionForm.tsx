'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Bell, Mail, CheckCircle, X, Calendar, Copy, QrCode, IndianRupee } from "lucide-react"

const POPULAR_GENRES = [
  "Superhero",
  "Horror", 
  "Science Fiction",
  "Fantasy",
  "Crime",
  "Romance",
  "Comedy",
  "Action"
]

interface SubscriptionFormProps {
  onClose?: () => void
}

export function SubscriptionForm({ onClose }: SubscriptionFormProps) {
  const [email, setEmail] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment'>('details')
  const [utrNumber, setUtrNumber] = useState('')

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentStep('payment')
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!utrNumber) {
      alert('Please enter UTR number after making payment')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          genres: selectedGenres,
          paymentMethod: 'upi',
          amount: 100,
          utrNumber: utrNumber.trim()
        }),
      })

      if (response.ok) {
        setIsSubscribed(true)
        setTimeout(() => {
          if (onClose) onClose()
        }, 3000)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Payment verification failed. Please check UTR number and try again.')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Payment verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('UPI ID copied to clipboard!')
  }

  const goBack = () => {
    setPaymentStep('details')
  }

  const handleClose = () => {
    if (onClose) onClose()
  }

  if (isSubscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-600 mb-2">
          You're now subscribed to weekly comic updates!
        </p>
        <p className="text-sm text-green-700">
          You'll receive email notifications every Sunday with new comic releases.
        </p>
      </div>
    )
  }

  if (paymentStep === 'payment') {
    return (
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <IndianRupee className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Complete Payment</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <p className="text-amber-800 font-semibold text-lg">₹100 One-Time Payment</p>
            <p className="text-amber-600 text-sm">Send payment via UPI</p>
          </div>
        </div>

        {/* UPI Payment Instructions */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Payment Instructions:</h4>
            <ol className="text-blue-700 text-sm space-y-2 list-decimal list-inside">
              <li>Open your UPI app (Google Pay, PhonePe, Paytm)</li>
              <li>Send <strong>₹100</strong> to the UPI ID below</li>
              <li>Come back here and enter the UTR/Reference number</li>
              <li>Click "Verify Payment" to complete subscription</li>
            </ol>
          </div>

          {/* Your UPI ID */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <Label className="text-green-800 font-semibold mb-2 block">Send ₹100 to this UPI ID:</Label>
            <div className="flex items-center justify-between bg-white p-3 rounded border">
              <code className="text-green-700 font-mono text-sm">siddhantbhuyar423@okhdfcbank</code>
              <button
                onClick={() => copyToClipboard('siddhantbhuyar423@okhdfcbank')}
                className="text-green-600 hover:text-green-800 p-1"
                title="Copy UPI ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-green-600 text-xs mt-2">
              ✅ This is Siddhant's official UPI ID
            </p>
          </div>

          {/* UTR Number Input */}
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="utr" className="text-sm font-semibold">
                UTR / Reference Number *
              </Label>
              <Input
                id="utr"
                type="text"
                placeholder="Enter UTR number from your payment"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Find this in your payment confirmation or bank statement
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={goBack}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !utrNumber}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {isLoading ? 'Verifying...' : 'Verify Payment'}
              </Button>
            </div>
          </form>

          <div className="text-center space-y-2 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              💰 One-time payment of ₹100 • No recurring charges
            </p>
            <p className="text-xs text-muted-foreground">
              📧 Weekly emails every Sunday • Personalized comic recommendations
            </p>
            <p className="text-xs text-muted-foreground">
              ⏰ Payment issues? Contact: siddhantbhuyar423@okhdfcbank
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Initial form (paymentStep === 'details')
  return (
    <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full relative">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Weekly Comic Updates</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <p className="text-amber-800 font-semibold text-lg">₹100 One-Time Payment</p>
          <p className="text-amber-600 text-sm">Get weekly updates every Sunday</p>
        </div>
      </div>

      <form onSubmit={handleDetailsSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm">Preferred Genres (Optional)</Label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {POPULAR_GENRES.map((genre) => (
              <div key={genre} className="flex items-center space-x-2">
                <Checkbox
                  id={`genre-${genre}`}
                  checked={selectedGenres.includes(genre)}
                  onCheckedChange={() => handleGenreToggle(genre)}
                />
                <Label
                  htmlFor={`genre-${genre}`}
                  className="text-sm cursor-pointer"
                >
                  {genre}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!email}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Continue
          </Button>
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            ✅ One-time payment • No recurring charges
          </p>
          <p className="text-xs text-muted-foreground">
            📧 Weekly emails every Sunday • Cancel anytime
          </p>
          <p className="text-xs text-muted-foreground">
            🔒 Secure UPI payment • Money goes directly to creator
          </p>
        </div>
      </form>
    </div>
  )
}