import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { staff } = await request.json()
    
    // Update each staff member's order
    await Promise.all(
      staff.map(({ id, order }: { id: string; order: number }) =>
        db.staff.update({
          where: { id },
          data: { order }
        })
      )
    )

    return NextResponse.json({ message: 'Staff reordered successfully' })
  } catch (error) {
    console.error('Failed to reorder staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}