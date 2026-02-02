import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: noticeId } = await params
    const { title, content, isImportant, expiryDate } = await request.json()

    const notice = await db.notice.update({
      where: { id: noticeId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(isImportant !== undefined && { isImportant }),
        ...(expiryDate !== undefined && { 
          expiryDate: expiryDate ? new Date(expiryDate) : null 
        })
      }
    })

    return NextResponse.json(notice)
  } catch (error) {
    console.error('Failed to update notice:', error)
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
    const { id: noticeId } = await params

    await db.notice.delete({
      where: { id: noticeId }
    })

    return NextResponse.json({ message: 'Notice deleted successfully' })
  } catch (error) {
    console.error('Failed to delete notice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}