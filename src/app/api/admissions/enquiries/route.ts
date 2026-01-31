import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get first school (in real app, get from session)
    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json([])
    }

    const enquiries = await db.admissionEnquiry.findMany({
      where: {
        admission: {
          schoolId: school.id
        }
      },
      include: {
        admission: {
          select: {
            session: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(enquiries)
  } catch (error) {
    console.error('Failed to fetch enquiries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentName, parentName, phone, email, grade, message, admissionId } = await request.json()
    
    if (!studentName || !parentName || !phone || !admissionId) {
      return NextResponse.json(
        { error: 'Student name, parent name, phone, and admission ID are required' },
        { status: 400 }
      )
    }

    const enquiry = await db.admissionEnquiry.create({
      data: {
        admissionId,
        studentName,
        parentName,
        phone,
        email,
        grade,
        message
      }
    })

    return NextResponse.json(enquiry, { status: 201 })
  } catch (error) {
    console.error('Failed to create enquiry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}