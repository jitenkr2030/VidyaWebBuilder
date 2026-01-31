import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get first school (in real app, get from session)
    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json([])
    }

    const achievements = await db.achievement.findMany({
      where: {
        schoolId: school.id
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error('Failed to fetch achievements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, imageUrl, date, isVisible } = await request.json()
    
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
    const lastAchievement = await db.achievement.findFirst({
      where: { schoolId: school.id },
      orderBy: { order: 'desc' }
    })

    const achievement = await db.achievement.create({
      data: {
        schoolId: school.id,
        title,
        description,
        imageUrl,
        date: date ? new Date(date) : null,
        isVisible: isVisible ?? true,
        order: (lastAchievement?.order || 0) + 1
      }
    })

    return NextResponse.json(achievement, { status: 201 })
  } catch (error) {
    console.error('Failed to create achievement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}