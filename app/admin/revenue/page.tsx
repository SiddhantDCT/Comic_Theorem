"use client"

import { useState, useEffect } from 'react'

interface Subscription {
  id: string
  email: string
  genres: string[]
  payment: {
    method: string
    amount: number
    currency: string
    paidAt: string
    status: string
  }
  plan: string
  isActive: boolean
  subscribedAt: string
  lastNotified: string | null
  nextNotification: string
}

export default function RevenueDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingNotifications, setSendingNotifications] = useState(false)

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

  const sendSundayNotifications = async () => {
    setSendingNotifications(true)
    try {
      const response = await fetch('/api/subscribe', {
        method: 'PATCH',
      })
      const result = await response.json()
      alert(result.message)
      fetchSubscriptions()
    } catch (error) {
      alert('Failed to send notifications')
    } finally {
      setSendingNotifications(false)
    }
  }

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.payment.amount, 0)
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive)

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Revenue Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">₹{totalRevenue}</p>
            <p className="text-sm text-green-700">{subscriptions.length} payments</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Active Subscribers</h3>
            <p className="text-2xl font-bold text-blue-600">{activeSubscriptions.length}</p>
            <p className="text-sm text-blue-700">Weekly Sunday emails</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Next Notification</h3>
            <p className="text-2xl font-bold text-purple-600">Sunday</p>
            <p className="text-sm text-purple-700">9:00 AM weekly</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Weekly Notifications</h2>
              <p className="text-muted-foreground">
                Send weekly comic updates to all active subscribers
              </p>
            </div>
            <button
              onClick={sendSundayNotifications}
              disabled={sendingNotifications}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {sendingNotifications ? 'Sending...' : 'Send Sunday Emails'}
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">All Subscriptions</h2>
          
          {subscriptions.length === 0 ? (
            <p className="text-muted-foreground">No subscriptions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Payment</th>
                    <th className="text-left p-3">Subscribed</th>
                    <th className="text-left p-3">Next Email</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border hover:bg-accent/10">
                      <td className="p-3">{sub.email}</td>
                      <td className="p-3">
                        <div className="font-semibold">₹{sub.payment.amount}</div>
                        <div className="text-sm text-muted-foreground">{sub.payment.method}</div>
                      </td>
                      <td className="p-3">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {new Date(sub.nextNotification).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          sub.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </span>
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