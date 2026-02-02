import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT() {
  try {
    // Get the first school (in real app, get from session)
    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // Update school status to PUBLISHED
    const updatedSchool = await db.school.update({
      where: { id: school.id },
      data: {
        status: 'PUBLISHED'
      }
    })

    return NextResponse.json({ 
      message: 'Website published successfully',
      school: updatedSchool 
    })
  } catch (error) {
    console.error('Failed to publish website:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}