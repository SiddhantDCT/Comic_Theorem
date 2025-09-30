"use client"

import { useState } from 'react'

export default function TestNotifications() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendTestNotifications = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to send test notifications' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Test Notifications</h1>
        
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Send Test Email Notifications</h2>
          <p className="text-muted-foreground mb-4">
            This will simulate sending daily comic release notifications to all subscribers.
            Check your browser console to see the simulated emails.
          </p>
          
          <button
            onClick={sendTestNotifications}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Test Notifications'}
          </button>
        </div>

        {result && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Results:</h3>
            <pre className="bg-muted p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Next Steps for Production:</h3>
          <ul className="list-disc list-inside text-yellow-700 space-y-1">
            <li>Integrate with Resend, SendGrid, or AWS SES for real emails</li>
            <li>Set up daily cron job using Vercel Cron or GitHub Actions</li>
            <li>Add payment processing with Stripe for the $1/month fee</li>
            <li>Create beautiful HTML email templates with comic covers</li>
            <li>Implement proper email verification</li>
          </ul>
        </div>
      </div>
    </div>
  )
}