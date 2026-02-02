import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get first school (in real app, get from session)
    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json([])
    }

    const admissions = await db.admission.findMany({
      where: {
        schoolId: school.id
      },
      include: {
        _count: {
          select: {
            enquiries: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(admissions)
  } catch (error) {
    console.error('Failed to fetch admissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, isOpen, instructions, eligibility } = await request.json()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session is required' },
        { status: 400 }
      )
    }

    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    const admission = await db.admission.create({
      data: {
        schoolId: school.id,
        session,
        isOpen: isOpen ?? true,
        instructions,
        eligibility
      }
    })

    return NextResponse.json(admission, { status: 201 })
  } catch (error) {
    console.error('Failed to create admission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}