import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const PLANS = {
  BASIC: { price: 2999, duration: 365 }, // 1 year in days
  STANDARD: { price: 6999, duration: 365 },
  PREMIUM: { price: 9999, duration: 365 }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()
    
    // Get school info
    const school = await db.school.findUnique({
      where: { id: session.user.schoolId as string }
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const planConfig = PLANS[plan as keyof typeof PLANS]
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXX',
      key_secret: process.env.RAZORPAY_SECRET || 'XXXXXXXXXXXX'
    })

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: planConfig.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${school.id}_${Date.now()}`,
      notes: {
        schoolId: school.id,
        plan: plan
      }
    })
    
    return NextResponse.json({
      orderId: order.id,
      amount: planConfig.price,
      currency: 'INR',
      plan
    })

  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}