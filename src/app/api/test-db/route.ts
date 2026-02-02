import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await db.$connect()
    console.log('✅ Database connected')
    
    // Get user count
    const userCount = await db.user.count()
    console.log('📊 User count:', userCount)
    
    // Get all users
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolId: true,
        school: {
          select: {
            name: true,
            plan: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      userCount,
      users: users.map(user => ({
        ...user,
        passwordHash: '***hidden***'
      }))
    })
    
  } catch (error) {
    console.error('❌ Database test error:', error)
    return NextResponse.json({ 
      error: 'Database connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}