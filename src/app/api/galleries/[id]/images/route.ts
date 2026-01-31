import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: galleryId } = await params

    const images = await db.galleryImage.findMany({
      where: {
        galleryId: galleryId
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Failed to fetch gallery images:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: galleryId } = await params
    const { url, caption } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Get the highest order value and increment
    const lastImage = await db.galleryImage.findFirst({
      where: { galleryId },
      orderBy: { order: 'desc' }
    })

    const image = await db.galleryImage.create({
      data: {
        galleryId,
        url,
        caption,
        order: (lastImage?.order || 0) + 1
      }
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Failed to create gallery image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}