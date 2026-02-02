import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: galleryId } = await params
    const { title, description, eventDate, isVisible } = await request.json()

    const gallery = await db.gallery.update({
      where: { id: galleryId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(eventDate !== undefined && { 
          eventDate: eventDate ? new Date(eventDate) : null 
        }),
        ...(isVisible !== undefined && { isVisible })
      }
    })

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('Failed to update gallery:', error)
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
    const { id: galleryId } = await params

    // Delete gallery and all its images (cascade delete)
    await db.gallery.delete({
      where: { id: galleryId }
    })

    return NextResponse.json({ message: 'Gallery deleted successfully' })
  } catch (error) {
    console.error('Failed to delete gallery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}