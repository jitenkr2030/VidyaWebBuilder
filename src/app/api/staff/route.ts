import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get first school (in real app, get from session)
    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json([])
    }

    const staff = await db.staff.findMany({
      where: {
        schoolId: school.id
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Failed to fetch staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, designation, department, subject, email, phone, photo, bio, isVisible } = await request.json()
    
    if (!name || !designation) {
      return NextResponse.json(
        { error: 'Name and designation are required' },
        { status: 400 }
      )
    }

    const school = await db.school.findFirst()
    
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // Get the highest order value and increment
    const lastStaff = await db.staff.findFirst({
      where: { schoolId: school.id },
      orderBy: { order: 'desc' }
    })

    const staffMember = await db.staff.create({
      data: {
        schoolId: school.id,
        name,
        designation,
        department,
        subject,
        email,
        phone,
        photo,
        bio,
        isVisible: isVisible ?? true,
        order: (lastStaff?.order || 0) + 1
      }
    })

    return NextResponse.json(staffMember, { status: 201 })
  } catch (error) {
    console.error('Failed to create staff member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}