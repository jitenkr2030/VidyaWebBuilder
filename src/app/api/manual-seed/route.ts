import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Simple manual seeding endpoint - call this to create demo accounts
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Manual database seeding started...')
    
    // Clean existing data first
    await db.user.deleteMany()
    await db.school.deleteMany()
    await db.websiteSection.deleteMany()
    await db.notice.deleteMany()
    await db.featureFlag.deleteMany()
    
    console.log('🗑️ Cleaned existing data')
    
    // Create DPS School
    const school = await db.school.create({
      data: {
        name: 'Delhi Public School',
        subdomain: 'dpsrkp',
        customDomain: 'dpsrkp.vidyawebbuilder.in',
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
        whatsapp: '+91-9876543210'
      }
    })
    console.log('🏫 Created DPS school')

    // Create Demo Users
    const users = [
      {
        email: 'admin@vidyawebbuilder.in',
        name: 'Demo Platform Admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        schoolId: null
      },
      {
        email: 'principal@dps.edu.in',
        name: 'Rajesh Kumar',
        password: await bcrypt.hash('principal123', 10),
        role: 'ADMIN',
        schoolId: school.id
      },
      {
        email: 'teacher@dps.edu.in',
        name: 'Priya Sharma',
        password: await bcrypt.hash('teacher123', 10),
        role: 'EDITOR',
        schoolId: school.id
      },
      {
        email: 'staff@dps.edu.in',
        name: 'Amit Singh',
        password: await bcrypt.hash('staff123', 10),
        role: 'VIEWER',
        schoolId: school.id
      }
    ]

    for (const userData of users) {
      await db.user.create({ data: userData })
    }
    console.log('👥 Created demo users')

    // Create basic website sections
    const sections = [
      {
        schoolId: school.id,
        type: 'HERO',
        title: 'Welcome to Delhi Public School',
        content: JSON.stringify({
          headline: 'Excellence in Education Since 1972',
          subheadline: 'Nurturing Minds, Shaping Futures'
        }),
        order: 1,
        isVisible: true
      },
      {
        schoolId: school.id,
        type: 'ABOUT',
        title: 'About Our School',
        content: JSON.stringify({
          description: 'Delhi Public School, R.K. Puram is a premier educational institution committed to academic excellence.'
        }),
        order: 2,
        isVisible: true
      }
    ]

    for (const section of sections) {
      await db.websiteSection.create({ data: section })
    }
    console.log('📄 Created website sections')

    // Create notices
    const notices = [
      {
        schoolId: school.id,
        title: 'Annual Examination Schedule 2024',
        content: 'The annual examinations for classes 6-12 will commence from March 1, 2024.',
        isImportant: true,
        expiryDate: new Date('2024-03-31')
      },
      {
        schoolId: school.id,
        title: 'Parent-Teacher Meeting',
        content: 'Parent-Teacher meeting will be held on January 25, 2024 at 2:00 PM.',
        isImportant: false,
        expiryDate: new Date('2024-01-26')
      }
    ]

    for (const notice of notices) {
      await db.notice.create({ data: notice })
    }
    console.log('📢 Created notices')

    // Create feature flags
    const features = [
      'website_builder', 'free_subdomain', 'custom_domain', 'hosting', 
      'ssl_certificates', 'domain_transfers', 'dns_management', 
      'whois_privacy', 'priority_support', 'whatsapp_notices'
    ]
    
    for (const feature of features) {
      await db.featureFlag.create({
        data: {
          schoolId: school.id,
          feature,
          isEnabled: true
        }
      })
    }
    console.log('🚩 Created feature flags')

    const userCount = await db.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: userCount,
        schools: 1,
        sections: sections.length,
        notices: notices.length,
        features: features.length
      },
      demoAccounts: [
        'admin@vidyawebbuilder.in / admin123 (Platform Admin)',
        'principal@dps.edu.in / principal123 (School Admin)',
        'teacher@dps.edu.in / teacher123 (Teacher)',
        'staff@dps.edu.in / staff123 (Staff)'
      ]
    })

  } catch (error) {
    console.error('❌ Manual seeding failed:', error)
    return NextResponse.json(
      { 
        error: 'Seeding failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : 'No details'
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
      userCount,
      schoolCount,
      message: userCount === 0 ? 'Database is empty - click POST to seed' : 'Database contains data'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check database: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}