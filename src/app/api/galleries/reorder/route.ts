import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { galleries } = await request.json()
    
    // Update each gallery's order
    await Promise.all(
      galleries.map(({ id, order }: { id: string; order: number }) =>
        db.gallery.update({
          where: { id },
          data: { order }
        })
      )
    )

    return NextResponse.json({ message: 'Galleries reordered successfully' })
  } catch (error) {
    console.error('Failed to reorder galleries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}