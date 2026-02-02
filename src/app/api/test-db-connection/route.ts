import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    const userCount = await db.user.count()
    const schoolCount = await db.school.count()
    
    console.log(`✅ Database connected: ${userCount} users, ${schoolCount} schools`)
    
    // Try to get a sample user if any exist
    let sampleUser = null
    if (userCount > 0) {
      sampleUser = await db.user.findFirst({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          schoolId: true
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      userCount,
      schoolCount,
      sampleUser,
      timestamp: new Date().toISOString(),
      message: userCount === 0 ? 'Database is empty - needs seeding' : 'Database has data'
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No details',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}