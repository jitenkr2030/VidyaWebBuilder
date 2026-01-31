import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get first school (in real app, get from session)
    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json([])
    }

    const notices = await db.notice.findMany({
      where: {
        schoolId: school.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(notices)
  } catch (error) {
    console.error('Failed to fetch notices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, isImportant, expiryDate } = await request.json()
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
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

    const notice = await db.notice.create({
      data: {
        schoolId: school.id,
        title,
        content,
        isImportant: isImportant || false,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error('Failed to create notice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}