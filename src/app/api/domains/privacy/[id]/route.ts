import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const privacyId = params.id
    const schoolId = session.user.schoolId as string

    // Get WHOIS privacy setting
    const privacy = await db.whoisPrivacy.findFirst({
      where: { id: privacyId, schoolId }
    })

    if (!privacy) {
      return NextResponse.json({ error: 'Privacy setting not found' }, { status: 404 })
    }

    return NextResponse.json(privacy)
  } catch (error) {
    console.error('WHOIS privacy fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const privacyId = params.id
    const { action, maskedEmail, maskedPhone, maskedAddress, autoRenew } = await request.json()
    const schoolId = session.user.schoolId as string

    // Get existing privacy setting
    const privacy = await db.whoisPrivacy.findFirst({
      where: { id: privacyId, schoolId }
    })

    if (!privacy) {
      return NextResponse.json({ error: 'Privacy setting not found' }, { status: 404 })
    }

    let updateData: any = {}
    let message = ''

    switch (action) {
      case 'enable':
        updateData = {
          isEnabled: true,
          status: 'ACTIVATING'
        }
        message = 'Privacy protection activation started'
        activatePrivacyProtection(privacyId)
        break

      case 'disable':
        updateData = {
          isEnabled: false,
          status: 'DISABLED'
        }
        message = 'Privacy protection disabled'
        break

      case 'update_masked_info':
        updateData = {
          maskedEmail: maskedEmail || privacy.maskedEmail,
          maskedPhone: maskedPhone || privacy.maskedPhone,
          maskedAddress: maskedAddress || privacy.maskedAddress,
          lastUpdated: new Date()
        }
        message = 'Masked information updated successfully'
        break

      case 'toggle_auto_renew':
        updateData = {
          autoRenew: autoRenew !== undefined ? autoRenew : !privacy.autoRenew
        }
        message = `Auto-renew ${autoRenew ? 'enabled' : 'disabled'}`
        break

      case 'renew':
        if (privacy.status !== 'ACTIVE') {
          return NextResponse.json({ error: 'Can only renew active privacy protection' }, { status: 400 })
        }
        updateData = {
          status: 'RENEWING'
        }
        message = 'Privacy protection renewal started'
        renewPrivacyProtection(privacyId)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update privacy setting
    const updatedPrivacy = await db.whoisPrivacy.update({
      where: { id: privacyId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      privacy: updatedPrivacy,
      message
    })
  } catch (error) {
    console.error('WHOIS privacy update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const privacyId = params.id
    const schoolId = session.user.schoolId as string

    // Check if privacy setting exists and belongs to school
    const privacy = await db.whoisPrivacy.findFirst({
      where: { id: privacyId, schoolId }
    })

    if (!privacy) {
      return NextResponse.json({ error: 'Privacy setting not found' }, { status: 404 })
    }

    // Only allow deletion of disabled privacy settings
    if (privacy.isEnabled) {
      return NextResponse.json({ error: 'Cannot delete active privacy protection. Disable it first.' }, { status: 400 })
    }

    // Delete privacy setting
    await db.whoisPrivacy.delete({
      where: { id: privacyId }
    })

    return NextResponse.json({
      success: true,
      message: 'Privacy setting deleted successfully'
    })
  } catch (error) {
    console.error('WHOIS privacy deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function activatePrivacyProtection(privacyId: string) {
  try {
    await new Promise(resolve => setTimeout(resolve, 3000))

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

async function renewPrivacyProtection(privacyId: string) {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

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

    console.log(`WHOIS privacy protection renewed for ${privacyId}`)
  } catch (error) {
    console.error('Privacy protection renewal error:', error)
    
    await db.whoisPrivacy.update({
      where: { id: privacyId },
      data: {
        status: 'ERROR'
      }
    })
  }
}