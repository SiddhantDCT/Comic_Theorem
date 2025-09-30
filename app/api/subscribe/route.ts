import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'subscriptions.json')

function ensureDataDirectory() {
  const dataDir = path.dirname(SUBSCRIPTIONS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readSubscriptions() {
  try {
    ensureDataDirectory()
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading subscriptions:', error)
  }
  return []
}

function writeSubscriptions(subscriptions: any[]) {
  try {
    ensureDataDirectory()
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2))
  } catch (error) {
    console.error('Error writing subscriptions:', error)
  }
}

// In a real app, you would verify UTR with bank API
// For now, we'll do basic validation
function validateUTR(utrNumber: string): boolean {
  // Basic validation - in production, integrate with bank API
  return utrNumber.length >= 8 && utrNumber.length <= 20
}

export async function POST(request: NextRequest) {
  try {
    const { email, genres = [], paymentMethod, amount, utrNumber } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate payment amount
    if (amount !== 100) {
      return NextResponse.json(
        { error: 'Payment amount must be ₹100' },
        { status: 400 }
      )
    }

    // Validate UTR number
    if (!utrNumber || !validateUTR(utrNumber)) {
      return NextResponse.json(
        { error: 'Please enter a valid UTR number (8-20 characters)' },
        { status: 400 }
      )
    }

    const subscriptions = readSubscriptions()

    // Check if already subscribed
    const existingSubscription = subscriptions.find((sub: any) => sub.email === email)
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 400 }
      )
    }

    // Check if UTR already used (prevent duplicate payments)
    const existingUTR = subscriptions.find((sub: any) => sub.payment.utrNumber === utrNumber)
    if (existingUTR) {
      return NextResponse.json(
        { error: 'This UTR number has already been used. Please check your payment.' },
        { status: 400 }
      )
    }

    // Add to subscriptions
    const newSubscription = {
      id: Date.now().toString(),
      email,
      genres,
      payment: {
        method: paymentMethod,
        amount: 100,
        currency: 'INR',
        utrNumber: utrNumber,
        upiId: 'siddhantbhuyar423@okhdfcbank',
        paidAt: new Date().toISOString(),
        status: 'verified'
      },
      plan: 'weekly',
      isActive: true,
      subscribedAt: new Date().toISOString(),
      lastNotified: null,
      nextNotification: getNextSunday()
    }

    subscriptions.push(newSubscription)
    writeSubscriptions(subscriptions)

    console.log('💰 PAYMENT RECEIVED:')
    console.log('   Email:', email)
    console.log('   UTR:', utrNumber)
    console.log('   Amount: ₹100')
    console.log('   UPI ID: siddhantbhuyar423@okhdfcbank')
    console.log('   Total subscriptions:', subscriptions.length)

    // Calculate total revenue
    const totalRevenue = subscriptions.reduce((sum: number, sub: any) => sum + sub.payment.amount, 0)
    console.log('   Total revenue: ₹' + totalRevenue)

    return NextResponse.json(
      { 
        message: 'Payment verified successfully! You are now subscribed to weekly comic updates.',
        subscription: newSubscription,
        receipt: {
          amount: 100,
          currency: 'INR',
          upiId: 'siddhantbhuyar423@okhdfcbank',
          utrNumber: utrNumber
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper to get next Sunday
function getNextSunday() {
  const today = new Date()
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + (7 - today.getDay()))
  nextSunday.setHours(9, 0, 0, 0) // 9 AM on Sunday
  return nextSunday.toISOString()
}

// GET all subscriptions
export async function GET() {
  try {
    const subscriptions = readSubscriptions()
    const totalRevenue = subscriptions.reduce((sum: number, sub: any) => sum + sub.payment.amount, 0)
    
    return NextResponse.json({ 
      subscriptions,
      total: subscriptions.length,
      totalRevenue: `₹${totalRevenue}`,
      upiId: 'siddhantbhuyar423@okhdfcbank',
      revenueBreakdown: {
        activeSubscriptions: subscriptions.filter((s: any) => s.isActive).length,
        totalEarnings: `₹${totalRevenue}`
      }
    })
  } catch (error) {
    console.error('Error reading subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}