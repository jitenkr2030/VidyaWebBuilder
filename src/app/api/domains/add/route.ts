import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domain } = await request.json()
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
    }

    // Check if domain is already used by another school
    const existingSchool = await db.school.findFirst({
      where: { customDomain: domain }
    })

    if (existingSchool) {
      return NextResponse.json({ error: 'Domain is already in use' }, { status: 409 })
    }

    // Update school with custom domain
    const updatedSchool = await db.school.update({
      where: { id: session.user.schoolId as string },
      data: { customDomain: domain }
    })

    // Generate DNS records (in production, this would be more sophisticated)
    const dnsRecords = [
      {
        type: 'A',
        name: '@',
        value: '192.168.1.1', // This would be your actual server IP
        ttl: '1h'
      },
      {
        type: 'CNAME',
        name: 'www',
        value: domain,
        ttl: '1h'
      }
    ]

    return NextResponse.json({
      success: true,
      school: updatedSchool,
      dnsRecords
    })

  } catch (error) {
    console.error('Domain addition error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}