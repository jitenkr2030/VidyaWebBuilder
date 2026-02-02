import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { sections } = await request.json()
    
    // Update each section's order
    await Promise.all(
      sections.map(({ id, order }: { id: string; order: number }) =>
        db.websiteSection.update({
          where: { id },
          data: { order }
        })
      )
    )

    return NextResponse.json({ message: 'Sections reordered successfully' })
  } catch (error) {
    console.error('Failed to reorder sections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}