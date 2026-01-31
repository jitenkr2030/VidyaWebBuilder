import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const schoolId = session.user.schoolId as string
    
    // Get WHOIS privacy settings for the school
    const privacySettings = await db.whoisPrivacy.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(privacySettings)
  } catch (error) {
    console.error('WHOIS privacy fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      domain, 
      isEnabled = false,
      privacyProvider,
      autoRenew = false,
      maskedEmail,
      maskedPhone,
      maskedAddress
    } = await request.json()
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    const schoolId = session.user.schoolId as string

    // Check if privacy setting already exists for this domain
    const existingPrivacy = await db.whoisPrivacy.findFirst({
      where: { schoolId, domain }
    })

    if (existingPrivacy) {
      return NextResponse.json({ error: 'Privacy setting already exists for this domain' }, { status: 409 })
    }

    // Create WHOIS privacy setting
    const privacy = await db.whoisPrivacy.create({
      data: {
        schoolId,
        domain,
        isEnabled,
        privacyProvider,
        autoRenew,
        maskedEmail,
        maskedPhone,
        maskedAddress,
        status: isEnabled ? 'ACTIVE' : 'DISABLED'
      }
    })

    // If enabled, activate privacy protection
    if (isEnabled) {
      await activatePrivacyProtection(privacy.id)
    }

    return NextResponse.json({
      success: true,
      privacy,
      message: 'WHOIS privacy setting created successfully'
    })
  } catch (error) {
    console.error('WHOIS privacy creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function activatePrivacyProtection(privacyId: string) {
  try {
    // Update status to activating
    await db.whoisPrivacy.update({
      where: { id: privacyId },
      data: { status: 'ACTIVATING' }
    })

    // Simulate privacy protection activation
    // In production, this would integrate with domain registrar privacy services
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Set expiry date (1 year from now)
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)

    await db.whoisPrivacy.update({
      where: { id: privacyId },
      data: {
        status: 'ACTIVE',
        expiryDate,
        lastUpdated: new Date()
      }
    })

    console.log(`WHOIS privacy protection activated for ${privacyId}`)
  } catch (error) {
    console.error('Privacy protection activation error:', error)
    
    await db.whoisPrivacy.update({
      where: { id: privacyId },
      data: {
        status: 'ERROR'
      }
    })
  }
}