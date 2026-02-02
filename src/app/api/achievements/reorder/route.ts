import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { achievements } = await request.json()
    
    // Update each achievement's order
    await Promise.all(
      achievements.map(({ id, order }: { id: string; order: number }) =>
        db.achievement.update({
          where: { id },
          data: { order }
        })
      )
    )

    return NextResponse.json({ message: 'Achievements reordered successfully' })
  } catch (error) {
    console.error('Failed to reorder achievements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}