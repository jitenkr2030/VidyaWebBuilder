import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

const PLANS = {
  BASIC: { price: 2999, duration: 365 },
  STANDARD: { price: 6999, duration: 365 },
  PREMIUM: { price: 9999, duration: 365 }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await request.json()
    
    // Get school info
    const school = await db.school.findUnique({
      where: { id: session.user.schoolId as string }
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // Verify Razorpay signature (simplified - in production, use proper verification)
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const planConfig = PLANS[plan as keyof typeof PLANS]
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + planConfig.duration)

    // Create payment record
    const payment = await db.payment.create({
      data: {
        schoolId: school.id,
        amount: planConfig.price,
        currency: 'INR',
        status: 'SUCCESS',
        method: 'RAZORPAY',
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        description: `${plan} Plan Subscription`
      }
    })

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        schoolId: school.id,
        plan: plan as any,
        status: 'ACTIVE',
        startDate,
        endDate,
        amount: planConfig.price,
        currency: 'INR',
        paymentMethod: 'RAZORPAY',
        paymentId: payment.id
      }
    })

    // Update school plan
    await db.school.update({
      where: { id: school.id },
      data: {
        plan: plan as any,
        subscriptionEnds: endDate
      }
    })

    // Set up feature flags based on plan
    const features = getPlanFeatures(plan)
    for (const feature of features) {
      await db.featureFlag.upsert({
        where: {
          schoolId_feature: {
            schoolId: school.id,
            feature: feature.name
          }
        },
        update: { isEnabled: feature.enabled },
        create: {
          schoolId: school.id,
          feature: feature.name,
          isEnabled: feature.enabled
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      subscription,
      payment 
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getPlanFeatures(plan: string) {
  const basicFeatures = [
    { name: 'website', enabled: true },
    { name: 'hosting', enabled: true },
    { name: 'notice_board', enabled: true },
    { name: 'photo_gallery', enabled: true },
    { name: 'mobile_friendly', enabled: true },
    { name: 'free_subdomain', enabled: true },
    { name: 'custom_domain', enabled: false },
    { name: 'admission_form', enabled: false },
    { name: 'whatsapp_button', enabled: false },
    { name: 'google_map', enabled: false },
    { name: 'priority_support', enabled: false },
    { name: 'whatsapp_broadcast', enabled: false },
    { name: 'fee_payment', enabled: false },
    { name: 'results_upload', enabled: false },
    { name: 'content_updates', enabled: false }
  ]

  const standardFeatures = [
    ...basicFeatures.map(f => ({ ...f, enabled: true })),
    { name: 'whatsapp_broadcast', enabled: false },
    { name: 'fee_payment', enabled: false },
    { name: 'results_upload', enabled: false },
    { name: 'content_updates', enabled: false }
  ]

  const premiumFeatures = basicFeatures.map(f => ({ ...f, enabled: true }))

  switch (plan) {
    case 'BASIC': return basicFeatures
    case 'STANDARD': return standardFeatures
    case 'PREMIUM': return premiumFeatures
    default: return basicFeatures
  }
}