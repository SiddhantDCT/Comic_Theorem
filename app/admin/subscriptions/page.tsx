"use client"

import { useState, useEffect } from 'react'

interface Subscription {
  id: string
  email: string
  genres: string[]
  isActive: boolean
  subscribedAt: string
  lastNotified: string | null
}

export default function SubscriptionsAdmin() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscribe')
      const data = await response.json()
      setSubscriptions(data.subscriptions || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSubscription = async (email: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return

    try {
      const response = await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSubscriptions(prev => prev.filter(sub => sub.email !== email))
      } else {
        alert('Failed to delete subscription')
      }
    } catch (error) {
      console.error('Error deleting subscription:', error)
      alert('Failed to delete subscription')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Subscriptions Admin</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Subscriptions Admin</h1>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Total Subscriptions: {subscriptions.length}
            </h2>
            <button
              onClick={fetchSubscriptions}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          {subscriptions.length === 0 ? (
            <p className="text-muted-foreground">No subscriptions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Genres</th>
                    <th className="text-left p-3">Subscribed</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border hover:bg-accent/10">
                      <td className="p-3">{sub.email}</td>
                      <td className="p-3">
                        {sub.genres.length > 0 ? sub.genres.join(', ') : 'All genres'}
                      </td>
                      <td className="p-3">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => deleteSubscription(sub.email)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}