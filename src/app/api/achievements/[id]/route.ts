import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: achievementId } = await params
    const { title, description, imageUrl, date, isVisible } = await request.json()

    const achievement = await db.achievement.update({
      where: { id: achievementId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(date !== undefined && { 
          date: date ? new Date(date) : null 
        }),
        ...(isVisible !== undefined && { isVisible })
      }
    })

    return NextResponse.json(achievement)
  } catch (error) {
    console.error('Failed to update achievement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: achievementId } = await params

    await db.achievement.delete({
      where: { id: achievementId }
    })

    return NextResponse.json({ message: 'Achievement deleted successfully' })
  } catch (error) {
    console.error('Failed to delete achievement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}