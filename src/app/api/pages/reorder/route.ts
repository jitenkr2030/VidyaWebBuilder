import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { pages } = await request.json()
    
    // Update each page's order
    await Promise.all(
      pages.map(({ id, order }: { id: string; order: number }) =>
        db.page.update({
          where: { id },
          data: { order }
        })
      )
    )

    return NextResponse.json({ message: 'Pages reordered successfully' })
  } catch (error) {
    console.error('Failed to reorder pages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}