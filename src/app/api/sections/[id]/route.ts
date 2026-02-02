import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sectionId } = await params
    const { title, content, imageUrl, isVisible } = await request.json()

    const section = await db.websiteSection.update({
      where: { id: sectionId },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isVisible !== undefined && { isVisible })
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Failed to update section:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}