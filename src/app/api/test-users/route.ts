import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await db.user.count()
    
    // Get specific demo users
    const principalUser = await db.user.findUnique({
      where: { email: 'principal@dps.edu.in' },
      include: { school: true }
    })
    
    const teacherUser = await db.user.findUnique({
      where: { email: 'teacher@dps.edu.in' },
      include: { school: true }
    })
    
    const staffUser = await db.user.findUnique({
      where: { email: 'staff@dps.edu.in' },
      include: { school: true }
    })
    
    // Test password verification for principal
    let principalPasswordValid = false
    if (principalUser) {
      principalPasswordValid = await bcrypt.compare('principal123', principalUser.password)
    }
    
    return NextResponse.json({
      totalUsers: userCount,
      demoUsers: {
        principal: {
          exists: !!principalUser,
          passwordValid: principalPasswordValid,
          user: principalUser ? {
            id: principalUser.id,
            email: principalUser.email,
            name: principalUser.name,
            role: principalUser.role,
            schoolId: principalUser.schoolId,
            schoolName: principalUser.school?.name
          } : null
        },
        teacher: {
          exists: !!teacherUser,
          user: teacherUser ? {
            id: teacherUser.id,
            email: teacherUser.email,
            name: teacherUser.name,
            role: teacherUser.role,
            schoolId: teacherUser.schoolId,
            schoolName: teacherUser.school?.name
          } : null
        },
        staff: {
          exists: !!staffUser,
          user: staffUser ? {
            id: staffUser.id,
            email: staffUser.email,
            name: staffUser.name,
            role: staffUser.role,
            schoolId: staffUser.schoolId,
            schoolName: staffUser.school?.name
          } : null
        }
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: 'Database connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}