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

    // Convert to CSV
    const headers = ['Student Name', 'Parent Name', 'Phone', 'Email', 'Grade', 'Session', 'Status', 'Applied On', 'Message']
    const rows = enquiries.map(e => [
      e.studentName,
      e.parentName,
      e.phone,
      e.email || '',
      e.grade || '',
      e.admission.session,
      e.status,
      new Date(e.createdAt).toLocaleDateString(),
      e.message || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="admission-enquiries.csv"'
      }
    })
  } catch (error) {
    console.error('Failed to export enquiries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}