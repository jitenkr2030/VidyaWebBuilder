import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: admissionId } = await params
    const { session, isOpen, instructions, eligibility } = await request.json()

    const admission = await db.admission.update({
      where: { id: admissionId },
      data: {
        ...(session && { session }),
        ...(isOpen !== undefined && { isOpen }),
        ...(instructions !== undefined && { instructions }),
        ...(eligibility !== undefined && { eligibility })
      }
    })

    return NextResponse.json(admission)
  } catch (error) {
    console.error('Failed to update admission:', error)
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
    const { id: admissionId } = await params

    await db.admission.delete({
      where: { id: admissionId }
    })

    return NextResponse.json({ message: 'Admission session deleted successfully' })
  } catch (error) {
    console.error('Failed to delete admission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}