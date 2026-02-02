import { db } from './db'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Check if data already exists
    const userCount = await db.user.count()
    if (userCount > 0) {
      return {
        success: true,
        message: 'Database already contains data',
        userCount
      }
    }

    // Create Demo Schools first
    const demoSchools = [
      {
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
        subscriptionEnds: new Date('2024-03-31'),
        seoTitle: 'Delhi Public School R.K. Puram - Best CBSE School in Delhi',
        seoDescription: 'DPS R.K. Puram is a premier CBSE affiliated school providing quality education since 1972',
        address: 'Sector 12, R.K. Puram, New Delhi - 110022',
        phone: '+91-11-26172479',
        email: 'info@dpsrkp.net',
        whatsapp: '+91-9876543210',
        mapEmbed: 'https://maps.google.com/maps?q=dps+rk+puram'
      },
      {
        name: 'Kendriya Vidyalaya No.1',
        subdomain: 'kv1jnu',
        customDomain: null,
        logo: '/schools/kv-logo.png',
        primaryColor: '#7c3aed',
        secondaryColor: '#475569',
        template: 'Kendriya Vidyalaya Premium',
        language: 'ENGLISH',
        status: 'PUBLISHED',
        plan: 'STANDARD',
        subscriptionEnds: new Date('2024-05-31'),
        seoTitle: 'KV No.1 JNU - Premier Kendriya Vidyalaya in Delhi',
        seoDescription: 'Kendriya Vidyalaya No.1 JNU is a premier central school providing quality education',
        address: 'JNU Campus, New Delhi - 110067',
        phone: '+91-11-26714075',
        email: 'kv1jnu@gmail.com',
        whatsapp: '+91-9876543211',
        mapEmbed: 'https://maps.google.com/maps?q=kv1+jnu'
      },
      {
        name: 'Sarvodaya Government School',
        subdomain: 'sarvodaya-bawana',
        customDomain: null,
        logo: '/schools/govt-logo.png',
        primaryColor: '#dc2626',
        secondaryColor: '#6b7280',
        template: 'Government School Classic',
        language: 'HINDI',
        status: 'PUBLISHED',
        plan: 'BASIC',
        subscriptionEnds: new Date('2024-06-30'),
        seoTitle: 'Sarvodaya Government School Bawana - Quality Education for All',
        seoDescription: 'Government school providing free and quality education to students from economically weaker sections',
        address: 'Village Bawana, Delhi - 110039',
        phone: '+91-11-27451234',
        email: 'govt.bawana@edu.delhi.gov.in',
        whatsapp: '+91-9876543212',
        mapEmbed: 'https://maps.google.com/maps?q=sarvodaya+school+bawana'
      }
    ]

    const createdSchools = []
    for (const school of demoSchools) {
      const createdSchool = await db.school.create({ data: school })
      createdSchools.push(createdSchool)
    }
    console.log('🏫 Created demo schools')

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
        schoolId: createdSchools[0].id
      },
      {
        email: 'teacher@dps.edu.in',
        name: 'Priya Sharma',
        password: await bcrypt.hash('teacher123', 10),
        role: 'EDITOR',
        schoolId: createdSchools[0].id
      },
      {
        email: 'staff@dps.edu.in',
        name: 'Amit Singh',
        password: await bcrypt.hash('staff123', 10),
        role: 'VIEWER',
        schoolId: createdSchools[0].id
      },
      {
        email: 'principal@kv.edu.in',
        name: 'Sunita Devi',
        password: await bcrypt.hash('principal123', 10),
        role: 'ADMIN',
        schoolId: createdSchools[1].id
      },
      {
        email: 'manager@govt-school.edu.in',
        name: 'Vijay Kumar',
        password: await bcrypt.hash('manager123', 10),
        role: 'ADMIN',
        schoolId: createdSchools[2].id
      }
    ]

    for (const user of demoUsers) {
      await db.user.create({ data: user })
    }
    console.log('👥 Created demo users')

    // Create some basic website sections for DPS
    const demoSections = [
      {
        schoolId: createdSchools[0].id,
        type: 'HERO',
        title: 'Welcome to Delhi Public School',
        content: JSON.stringify({
          headline: 'Excellence in Education Since 1972',
          subheadline: 'Nurturing Minds, Shaping Futures',
          ctaText: 'Explore Our Campus',
          ctaLink: '#about'
        }),
        order: 1,
        isVisible: true
      },
      {
        schoolId: createdSchools[0].id,
        type: 'ABOUT',
        title: 'About Our School',
        content: JSON.stringify({
          description: 'Delhi Public School, R.K. Puram is a premier educational institution committed to academic excellence and holistic development of students.',
          history: 'Established in 1972, DPS R.K. Puram has been a pioneer in educational innovation and excellence.',
          achievements: 'Consistently ranked among the top schools in India with outstanding board results.'
        }),
        order: 2,
        isVisible: true
      },
      {
        schoolId: createdSchools[0].id,
        type: 'CONTACT',
        title: 'Contact Us',
        content: JSON.stringify({
          address: 'Sector 12, R.K. Puram, New Delhi - 110022',
          phone: '+91-11-26172479',
          email: 'info@dpsrkp.net',
          workingHours: 'Monday - Saturday: 8:00 AM - 3:00 PM'
        }),
        order: 3,
        isVisible: true
      }
    ]

    for (const section of demoSections) {
      await db.websiteSection.create({ data: section })
    }
    console.log('📄 Created demo website sections')

    // Create some notices
    const demoNotices = [
      {
        schoolId: createdSchools[0].id,
        title: 'Annual Examination Schedule 2024',
        content: 'The annual examinations for classes 6-12 will commence from March 1, 2024. Detailed date sheet has been uploaded to the student portal.',
        isImportant: true,
        expiryDate: new Date('2024-03-31')
      },
      {
        schoolId: createdSchools[0].id,
        title: 'Parent-Teacher Meeting - Class 10',
        content: 'Parent-Teacher meeting for Class 10 students will be held on January 25, 2024 at 2:00 PM in the school auditorium.',
        isImportant: false,
        expiryDate: new Date('2024-01-26')
      },
      {
        schoolId: createdSchools[1].id,
        title: 'Admission Open 2024-25',
        content: 'Admissions are open for the academic session 2024-25. Forms available at school office and online.',
        isImportant: false,
        expiryDate: new Date('2024-03-31')
      }
    ]

    for (const notice of demoNotices) {
      await db.notice.create({ data: notice })
    }
    console.log('📢 Created demo notices')

    // Create feature flags for each plan
    const featureFlags = {
      'FREE': ['website_builder', 'free_subdomain', 'hosting'],
      'BASIC': ['website_builder', 'free_subdomain', 'hosting', 'ssl_certificates'],
      'STANDARD': ['website_builder', 'free_subdomain', 'custom_domain', 'hosting', 'ssl_certificates', 'domain_transfers', 'dns_management', 'whois_privacy', 'priority_support'],
      'PREMIUM': ['website_builder', 'free_subdomain', 'custom_domain', 'hosting', 'ssl_certificates', 'domain_transfers', 'dns_management', 'whois_privacy', 'priority_support', 'whatsapp_notices', 'online_fee_payment', 'results_upload', 'content_updates']
    }

    for (const school of createdSchools) {
      const features = featureFlags[school.plan as keyof typeof featureFlags] || []
      for (const feature of features) {
        await db.featureFlag.create({
          data: {
            schoolId: school.id,
            feature,
            isEnabled: true
          }
        })
      }
    }
    console.log('🚩 Created demo feature flags')

    const finalUserCount = await db.user.count()
    
    return {
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: finalUserCount,
        schools: createdSchools.length,
        sections: demoSections.length,
        notices: demoNotices.length,
        featureFlags: Object.values(featureFlags).flat().length
      },
      demoAccounts: [
        'Platform Admin: admin@vidyawebbuilder.in / admin123',
        'DPS Principal: principal@dps.edu.in / principal123',
        'DPS Teacher: teacher@dps.edu.in / teacher123',
        'DPS Staff: staff@dps.edu.in / staff123',
        'KV Principal: principal@kv.edu.in / principal123',
        'Govt School Manager: manager@govt-school.edu.in / manager123'
      ]
    }

  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}