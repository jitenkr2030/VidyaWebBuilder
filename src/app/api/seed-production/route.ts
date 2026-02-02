import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting database seeding for production...')
    
    // Clean existing data
    await prisma.user.deleteMany()
    await prisma.school.deleteMany()
    
    console.log('🗑️ Cleaned existing data')
    
    // Create Demo Schools
    const dpsSchool = await prisma.school.create({
      data: {
        name: 'Delhi Public School',
        subdomain: 'dpsrkp',
        customDomain: 'dpsrkp.vidyawebbuilder.in',
        logo: '/schools/dps-logo.png',
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        template: 'Modern CBSE School',
        language: 'ENGLISH',
        status: 'PUBLISHED',
        plan: 'PREMIUM',
        subscriptionEnds: new Date('2024-12-31'),
        seoTitle: 'Delhi Public School R.K. Puram - Best CBSE School in Delhi',
        seoDescription: 'DPS R.K. Puram is a premier CBSE affiliated school providing quality education since 1972',
        address: 'Sector 12, R.K. Puram, New Delhi - 110022',
        phone: '+91-11-26172479',
        email: 'info@dpsrkp.net',
        whatsapp: '+91-9876543210',
        mapEmbed: 'https://maps.google.com/maps?q=dps+rk+puram'
      }
    })
    
    console.log('🏫 Created demo school:', dpsSchool.name)
    
    // Create Demo Users
    const demoUsers = [
      {
        email: 'admin@vidyawebbuilder.in',
        name: 'Demo Platform Admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        schoolId: null // Platform admin
      },
      {
        email: 'principal@dps.edu.in',
        name: 'Rajesh Kumar',
        password: await bcrypt.hash('principal123', 10),
        role: 'ADMIN',
        schoolId: dpsSchool.id
      },
      {
        email: 'teacher@dps.edu.in',
        name: 'Priya Sharma',
        password: await bcrypt.hash('teacher123', 10),
        role: 'EDITOR',
        schoolId: dpsSchool.id
      },
      {
        email: 'staff@dps.edu.in',
        name: 'Amit Singh',
        password: await bcrypt.hash('staff123', 10),
        role: 'VIEWER',
        schoolId: dpsSchool.id
      }
    ]
    
    for (const user of demoUsers) {
      await prisma.user.create({ data: user })
    }
    
    console.log('👥 Created demo users')
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      users: demoUsers.map(u => ({ email: u.email, name: u.name, role: u.role }))
    })
    
  } catch (error) {
    console.error('❌ Seeding error:', error)
    return NextResponse.json({ 
      error: 'Seeding failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}