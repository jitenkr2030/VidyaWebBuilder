import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get first school's sections (in real app, get from session)
    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json([])
    }

    const sections = await db.websiteSection.findMany({
      where: {
        schoolId: school.id
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Failed to fetch sections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, title, content, imageUrl, order, isVisible } = await request.json()
    
    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    const section = await db.websiteSection.create({
      data: {
        schoolId: school.id,
        type,
        title,
        content,
        imageUrl,
        order,
        isVisible: isVisible ?? true
      }
    })

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error('Failed to create section:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}