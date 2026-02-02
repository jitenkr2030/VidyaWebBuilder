import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enquiryId } = await params
    const { status } = await request.json()

    const enquiry = await db.admissionEnquiry.update({
      where: { id: enquiryId },
      data: {
        status: status as any
      }
    })

    return NextResponse.json(enquiry)
  } catch (error) {
    console.error('Failed to update enquiry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}