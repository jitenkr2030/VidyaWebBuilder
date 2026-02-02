import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params
    const { title, slug, content, metaTitle, metaDesc, isVisible } = await request.json()

    // Check if slug already exists (excluding current page)
    if (slug) {
      const existingPage = await db.page.findFirst({
        where: {
          slug: slug,
          NOT: { id: pageId }
        }
      })

      if (existingPage) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const page = await db.page.update({
      where: { id: pageId },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(content !== undefined && { content }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDesc !== undefined && { metaDesc }),
        ...(isVisible !== undefined && { isVisible })
      }
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Failed to update page:', error)
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
    const { id: pageId } = await params

    await db.page.delete({
      where: { id: pageId }
    })

    return NextResponse.json({ message: 'Page deleted successfully' })
  } catch (error) {
    console.error('Failed to delete page:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}