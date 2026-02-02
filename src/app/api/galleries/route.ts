import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get first school (in real app, get from session)
    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json([])
    }

    const galleries = await db.gallery.findMany({
      where: {
        schoolId: school.id
      },
      include: {
        _count: {
          select: {
            images: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(galleries)
  } catch (error) {
    console.error('Failed to fetch galleries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, eventDate, isVisible } = await request.json()
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
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

    // Get the highest order value and increment
    const lastGallery = await db.gallery.findFirst({
      where: { schoolId: school.id },
      orderBy: { order: 'desc' }
    })

    const gallery = await db.gallery.create({
      data: {
        schoolId: school.id,
        title,
        description,
        eventDate: eventDate ? new Date(eventDate) : null,
        isVisible: isVisible ?? true,
        order: (lastGallery?.order || 0) + 1
      }
    })

    return NextResponse.json(gallery, { status: 201 })
  } catch (error) {
    console.error('Failed to create gallery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}