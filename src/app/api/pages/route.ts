import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get first school (in real app, get from session)
    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json([])
    }

    const pages = await db.page.findMany({
      where: {
        schoolId: school.id
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Failed to fetch pages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, slug, content, metaTitle, metaDesc, isVisible } = await request.json()
    
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
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

    // Check if slug already exists
    const existingPage = await db.page.findFirst({
      where: {
        schoolId: school.id,
        slug: slug
      }
    })

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      )
    }

    // Get the highest order value and increment
    const lastPage = await db.page.findFirst({
      where: { schoolId: school.id },
      orderBy: { order: 'desc' }
    })

    const page = await db.page.create({
      data: {
        schoolId: school.id,
        title,
        slug,
        content,
        metaTitle,
        metaDesc,
        isVisible: isVisible ?? true,
        order: (lastPage?.order || 0) + 1
      }
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Failed to create page:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}