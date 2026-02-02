import { NextRequest, NextResponse } from "next/server"
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up database...')
    
    // Test database connection
    await db.$connect()
    console.log('✅ Database connected')
    
    // Check if admin user exists
    const existingAdmin = await db.user.findFirst({
      where: { email: 'admin@vidyawebbuilder.in' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Database already set up',
        adminEmail: existingAdmin.email
      })
    }
    
    // Create demo school
    const school = await db.school.create({
      data: {
        name: 'Delhi Public School',
        subdomain: 'dps',
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        template: 'PRIVATE',
        language: 'ENGLISH',
        status: 'PUBLISHED',
        plan: 'PREMIUM'
      }
    })
    
    // Create users
    const adminPassword = await bcrypt.hash('admin123', 12)
    const principalPassword = await bcrypt.hash('principal123', 12)
    const teacherPassword = await bcrypt.hash('teacher123', 12)
    const staffPassword = await bcrypt.hash('staff123', 12)
    
    await Promise.all([
      db.user.create({
        data: {
          email: 'admin@vidyawebbuilder.in',
          name: 'Platform Admin',
          password: adminPassword,
          role: 'ADMIN'
        }
      }),
      db.user.create({
        data: {
          email: 'principal@dps.edu.in',
          name: 'Principal',
          password: principalPassword,
          role: 'ADMIN',
          schoolId: school.id
        }
      }),
      db.user.create({
        data: {
          email: 'teacher@dps.edu.in',
          name: 'Teacher',
          password: teacherPassword,
          role: 'EDITOR',
          schoolId: school.id
        }
      }),
      db.user.create({
        data: {
          email: 'staff@dps.edu.in',
          name: 'Staff',
          password: staffPassword,
          role: 'VIEWER',
          schoolId: school.id
        }
      })
    ])
    
    console.log('✅ Database setup complete')
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      credentials: [
        { email: 'admin@vidyawebbuilder.in', password: 'admin123', role: 'Platform Admin' },
        { email: 'principal@dps.edu.in', password: 'principal123', role: 'School Admin' },
        { email: 'teacher@dps.edu.in', password: 'teacher123', role: 'Teacher' },
        { email: 'staff@dps.edu.in', password: 'staff123', role: 'Staff' }
      ]
    })
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}