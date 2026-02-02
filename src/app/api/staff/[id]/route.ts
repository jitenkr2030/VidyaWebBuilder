import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params
    const { name, designation, department, subject, email, phone, photo, bio, isVisible } = await request.json()

    const staffMember = await db.staff.update({
      where: { id: staffId },
      data: {
        ...(name && { name }),
        ...(designation && { designation }),
        ...(department !== undefined && { department }),
        ...(subject !== undefined && { subject }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(photo !== undefined && { photo }),
        ...(bio !== undefined && { bio }),
        ...(isVisible !== undefined && { isVisible })
      }
    })

    return NextResponse.json(staffMember)
  } catch (error) {
    console.error('Failed to update staff member:', error)
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
    const { id: staffId } = await params

    await db.staff.delete({
      where: { id: staffId }
    })

    return NextResponse.json({ message: 'Staff member deleted successfully' })
  } catch (error) {
    console.error('Failed to delete staff member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}