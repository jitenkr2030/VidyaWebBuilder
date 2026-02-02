import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// This endpoint automatically initializes the database if it's empty
// It's called by the frontend to ensure demo data exists
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Checking database initialization...')
    
    // Check if users already exist
    const userCount = await db.user.count()
    
    if (userCount === 0) {
      console.log('📝 Database is empty, triggering seeding...')
      
      // Call the seed-db endpoint
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
      const seedUrl = `${baseUrl}/api/seed-db`
      
      console.log('🌱 Calling seed endpoint:', seedUrl)
      
      // Direct seeding instead of HTTP call to avoid circular dependencies
      const { seedDatabase } = await import('@/lib/seed-production')
      const seedResult = await seedDatabase()
      
      if (seedResult.success) {
        console.log('✅ Database seeded successfully:', seedResult)
        return NextResponse.json({
          success: true,
          message: 'Database initialized successfully',
          ...seedResult
        })
      } else {
        console.error('❌ Failed to seed database:', seedResult.error)
        return NextResponse.json(
          { error: 'Failed to seed database', details: seedResult.error },
          { status: 500 }
        )
      }
    } else {
      console.log(`✅ Database already contains ${userCount} users`)
      return NextResponse.json({
        success: true,
        message: 'Database already initialized',
        userCount
      })
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return NextResponse.json(
      { 
        error: 'Database initialization failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const userCount = await db.user.count()
    const schoolCount = await db.school.count()
    
    return NextResponse.json({
      initialized: userCount > 0,
      userCount,
      schoolCount,
      message: userCount === 0 ? 'Database needs initialization' : 'Database is ready'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check database status' },
      { status: 500 }
    )
  }
}