import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log('🏗️ Creating database tables...')
    
    // Push Prisma schema to create tables
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    // Test connection and create tables
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Check if User table exists by trying to query it
    try {
      await prisma.user.count()
      console.log('✅ User table already exists')
    } catch (error) {
      console.log('❌ User table does not exist, creating...')
      
      // This would normally be done via prisma db push
      // For now, let's return instructions
      return NextResponse.json({
        success: false,
        error: 'Tables need to be created via Prisma migration',
        message: 'Please use the seed-postgresql endpoint instead',
        recommendation: 'Visit /api/seed-postgresql with POST request'
      }, { status: 400 })
    }
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Database tables exist and are accessible',
      nextStep: 'Visit /api/seed-postgresql to populate with demo data'
    })
    
  } catch (error) {
    console.error('❌ Table creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create tables', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}