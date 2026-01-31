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

    const school = await db.school.findUnique({
      where: { id: session.user.schoolId as string },
      select: {
        id: true,
        name: true,
        subdomain: true,
        customDomain: true,
        plan: true,
        subscriptionEnds: true,
        status: true,
        email: true,
        phone: true,
        address: true
      }
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    return NextResponse.json(school)

  } catch (error) {
    console.error('School fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}