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

    // Remove custom domain from school
    const updatedSchool = await db.school.update({
      where: { id: session.user.schoolId as string },
      data: { customDomain: null }
    })

    return NextResponse.json({
      success: true,
      school: updatedSchool
    })

  } catch (error) {
    console.error('Domain removal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}