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
    
    // Get school's current plan
    const school = await db.school.findUnique({
      where: { id: schoolId },
      select: { plan: true, subscriptionEnds: true }
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // Check if subscription is active
    const isSubscriptionActive = !school.subscriptionEnds || new Date(school.subscriptionEnds) > new Date()

    // Get feature flags from database
    const featureFlags = await db.featureFlag.findMany({
      where: { schoolId }
    })

    // Convert to key-value object
    const flags: any = {}
    featureFlags.forEach(flag => {
      flags[flag.feature] = flag.isEnabled && isSubscriptionActive
    })

    // Default features based on plan if no flags exist
    if (Object.keys(flags).length === 0) {
      const defaultFlags = getDefaultFeatures(school.plan)
      Object.assign(flags, defaultFlags)
    }

    return NextResponse.json(flags)

  } catch (error) {
    console.error('Feature flags error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getDefaultFeatures(plan: string) {
  switch (plan) {
    case 'BASIC':
      return {
        website: true,
        hosting: true,
        notice_board: true,
        photo_gallery: true,
        mobile_friendly: true,
        free_subdomain: true,
        custom_domain: false,
        admission_form: false,
        whatsapp_button: false,
        google_map: false,
        priority_support: false,
        whatsapp_broadcast: false,
        fee_payment: false,
        results_upload: false,
        content_updates: false,
        ssl_certificates: true,
        uptime_monitoring: false,
        renewal_reminders: false,
        domain_transfers: false,
        dns_management: false,
        whois_privacy: false
      }
    case 'STANDARD':
      return {
        website: true,
        hosting: true,
        notice_board: true,
        photo_gallery: true,
        mobile_friendly: true,
        free_subdomain: true,
        custom_domain: true,
        admission_form: true,
        whatsapp_button: true,
        google_map: true,
        priority_support: true,
        whatsapp_broadcast: false,
        fee_payment: false,
        results_upload: false,
        content_updates: false,
        ssl_certificates: true,
        uptime_monitoring: true,
        renewal_reminders: true,
        domain_transfers: true,
        dns_management: true,
        whois_privacy: true
      }
    case 'PREMIUM':
      return {
        website: true,
        hosting: true,
        notice_board: true,
        photo_gallery: true,
        mobile_friendly: true,
        free_subdomain: true,
        custom_domain: true,
        admission_form: true,
        whatsapp_button: true,
        google_map: true,
        priority_support: true,
        whatsapp_broadcast: true,
        fee_payment: true,
        results_upload: true,
        content_updates: true,
        ssl_certificates: true,
        uptime_monitoring: true,
        renewal_reminders: true,
        domain_transfers: true,
        dns_management: true,
        whois_privacy: true
      }
    default:
      return {
        website: true,
        hosting: false,
        notice_board: true,
        photo_gallery: false,
        mobile_friendly: true,
        free_subdomain: true,
        custom_domain: false,
        admission_form: false,
        whatsapp_button: false,
        google_map: false,
        priority_support: false,
        whatsapp_broadcast: false,
        fee_payment: false,
        results_upload: false,
        content_updates: false,
        ssl_certificates: false,
        uptime_monitoring: false,
        renewal_reminders: false,
        domain_transfers: false,
        dns_management: false,
        whois_privacy: false
      }
  }
}