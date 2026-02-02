import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting demo data seeding...')

  // Clean existing data
  await prisma.renewalReminder.deleteMany()
  await prisma.uptimeAlert.deleteMany()
  await prisma.uptimeMonitor.deleteMany()
  await prisma.sslCertificate.deleteMany()
  await prisma.whoisPrivacy.deleteMany()
  await prisma.dnsRecord.deleteMany()
  await prisma.domainTransfer.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.galleryImage.deleteMany()
  await prisma.gallery.deleteMany()
  await prisma.notice.deleteMany()
  await prisma.page.deleteMany()
  await prisma.websiteSection.deleteMany()
  await prisma.admissionEnquiry.deleteMany()
  await prisma.admission.deleteMany()
  await prisma.featureFlag.deleteMany()
  await prisma.template.deleteMany()
  await prisma.school.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Cleaned existing data')

  // Create Demo Templates
  const demoTemplates = [
    {
      name: 'Modern CBSE School',
      description: 'Professional template for CBSE affiliated schools with modern design and comprehensive features',
      category: 'CBSE',
      previewUrl: '/templates/cbse-modern.jpg',
      isPremium: false
    },
    {
      name: 'Government School Classic',
      description: 'Clean and professional template for government schools with essential features',
      category: 'GOVERNMENT',
      previewUrl: '/templates/govt-classic.jpg',
      isPremium: false
    },
    {
      name: 'Kendriya Vidyalaya Premium',
      description: 'Premium template for Kendriya Vidyalayas with advanced features and elegant design',
      category: 'PRIVATE',
      previewUrl: '/templates/kv-premium.jpg',
      isPremium: true
    }
  ]

  for (const template of demoTemplates) {
    await prisma.template.create({ data: template })
  }
  console.log('🎨 Created demo templates')

  // Create Demo Schools
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
    const createdSchool = await prisma.school.create({ data: school })
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
    await prisma.user.create({ data: user })
  }
  console.log('👥 Created demo users')

  // Create Demo Feature Flags
  const featureFlags = {
    'FREE': ['website_builder', 'free_subdomain', 'hosting'],
    'BASIC': ['website_builder', 'free_subdomain', 'hosting', 'ssl_certificates'],
    'STANDARD': ['website_builder', 'free_subdomain', 'custom_domain', 'hosting', 'ssl_certificates', 'domain_transfers', 'dns_management', 'whois_privacy', 'priority_support'],
    'PREMIUM': ['website_builder', 'free_subdomain', 'custom_domain', 'hosting', 'ssl_certificates', 'domain_transfers', 'dns_management', 'whois_privacy', 'priority_support', 'whatsapp_notices', 'online_fee_payment', 'results_upload', 'content_updates']
  }

  for (const school of createdSchools) {
    const features = featureFlags[school.plan] || []
    for (const feature of features) {
      await prisma.featureFlag.create({
        data: {
          schoolId: school.id,
          feature,
          isEnabled: true
        }
      })
    }
  }
  console.log('🚩 Created demo feature flags')

  // Create Demo Website Sections
  const demoWebsiteSections = [
    {
      schoolId: createdSchools[0].id,
      type: 'HERO',
      title: 'Welcome to Delhi Public School',
      content: JSON.stringify({
        headline: 'Excellence in Education Since 1972',
        subheadline: 'Nurturing Minds, Shaping Futures',
        backgroundImage: '/images/hero-bg.jpg',
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
        achievements: 'Consistently ranked among the top schools in India with outstanding board results.',
        image: '/images/about-us.jpg'
      }),
      order: 2,
      isVisible: true
    },
    {
      schoolId: createdSchools[0].id,
      type: 'ACADEMICS',
      title: 'Academic Excellence',
      content: JSON.stringify({
        description: 'We offer a comprehensive curriculum that focuses on conceptual understanding and practical application.',
        streams: [
          { name: 'Science', subjects: 'Physics, Chemistry, Mathematics, Biology, Computer Science' },
          { name: 'Commerce', subjects: 'Accountancy, Business Studies, Economics, Mathematics' },
          { name: 'Humanities', subjects: 'History, Geography, Political Science, Psychology, Economics' }
        ],
        image: '/images/academics.jpg'
      }),
      order: 3,
      isVisible: true
    },
    {
      schoolId: createdSchools[0].id,
      type: 'FACILITIES',
      title: 'World-Class Facilities',
      content: JSON.stringify({
        description: 'Our campus is equipped with state-of-the-art facilities to support holistic learning.',
        facilities: [
          { name: 'Smart Classrooms', description: 'Interactive digital learning environment' },
          { name: 'Science Labs', description: 'Well-equipped Physics, Chemistry, and Biology labs' },
          { name: 'Computer Labs', description: 'Modern computer systems with high-speed internet' },
          { name: 'Library', description: 'Extensive collection of books and digital resources' },
          { name: 'Sports Complex', description: 'Indoor and outdoor sports facilities' }
        ],
        image: '/images/facilities.jpg'
      }),
      order: 4,
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
        mapEmbed: 'https://maps.google.com/maps?q=dps+rk+puram',
        workingHours: 'Monday - Saturday: 8:00 AM - 3:00 PM'
      }),
      order: 5,
      isVisible: true
    }
  ]

  for (const section of demoWebsiteSections) {
    await prisma.websiteSection.create({ data: section })
  }
  console.log('📄 Created demo website sections')

  // Create Demo Notices
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
      schoolId: createdSchools[0].id,
      title: 'School Annual Day 2024',
      content: 'The 52nd Annual Day celebration will be held on February 15, 2024. All students are required to attend.',
      isImportant: true,
      expiryDate: new Date('2024-02-16')
    },
    {
      schoolId: createdSchools[1].id,
      title: 'Admission Open 2024-25',
      content: 'Admissions are open for the academic session 2024-25. Forms available at school office and online.',
      isImportant: false,
      expiryDate: new Date('2024-03-31')
    },
    {
      schoolId: createdSchools[2].id,
      title: 'Winter Vacation Schedule',
      content: 'School will remain closed for winter vacation from December 25, 2023 to January 10, 2024.',
      isImportant: false,
      expiryDate: new Date('2024-01-11')
    }
  ]

  for (const notice of demoNotices) {
    await prisma.notice.create({ data: notice })
  }
  console.log('📢 Created demo notices')

  // Create Demo Galleries
  const demoGalleries = [
    {
      schoolId: createdSchools[0].id,
      title: 'Annual Sports Day 2023',
      description: 'Highlights from our annual sports day celebration with various athletic events and competitions.',
      eventDate: new Date('2023-12-15'),
      order: 1,
      isVisible: true
    },
    {
      schoolId: createdSchools[0].id,
      title: 'Science Exhibition 2023',
      description: 'Students showcasing their innovative science projects and experiments.',
      eventDate: new Date('2023-11-20'),
      order: 2,
      isVisible: true
    },
    {
      schoolId: createdSchools[0].id,
      title: 'Cultural Fest - Utsav 2023',
      description: 'Annual cultural festival showcasing music, dance, and drama performances.',
      eventDate: new Date('2023-10-25'),
      order: 3,
      isVisible: true
    },
    {
      schoolId: createdSchools[1].id,
      title: 'Independence Day Celebration',
      description: '77th Independence Day celebration with flag hoisting and cultural programs.',
      eventDate: new Date('2023-08-15'),
      order: 1,
      isVisible: true
    }
  ]

  const createdGalleries = []
  for (const gallery of demoGalleries) {
    const createdGallery = await prisma.gallery.create({ data: gallery })
    createdGalleries.push(createdGallery)
  }

  // Add images to galleries
  const galleryImages = [
    { galleryId: createdGalleries[0].id, url: '/gallery/sports-1.jpg', caption: 'Opening Ceremony', order: 1 },
    { galleryId: createdGalleries[0].id, url: '/gallery/sports-2.jpg', caption: '100m Race Finals', order: 2 },
    { galleryId: createdGalleries[0].id, url: '/gallery/sports-3.jpg', caption: 'Relay Race', order: 3 },
    { galleryId: createdGalleries[1].id, url: '/gallery/science-1.jpg', caption: 'Working Models', order: 1 },
    { galleryId: createdGalleries[1].id, url: '/gallery/science-2.jpg', caption: 'Chemistry Experiments', order: 2 },
    { galleryId: createdGalleries[2].id, url: '/gallery/cultural-1.jpg', caption: 'Dance Performance', order: 1 },
    { galleryId: createdGalleries[3].id, url: '/gallery/independence-1.jpg', caption: 'Flag Hoisting', order: 1 }
  ]

  for (const image of galleryImages) {
    await prisma.galleryImage.create({ data: image })
  }
  console.log('🖼️ Created demo galleries')

  // Create Demo Staff
  const demoStaff = [
    {
      schoolId: createdSchools[0].id,
      name: 'Mrs. Sunita Sinha',
      designation: 'Principal',
      department: 'Administration',
      subject: null,
      email: 'principal@dpsrkp.net',
      phone: '+91-11-26172479',
      photo: '/staff/principal.jpg',
      bio: 'Mrs. Sunita Sinha has been leading DPS R.K. Puram with distinction for the past 10 years.',
      isVisible: true,
      order: 1
    },
    {
      schoolId: createdSchools[0].id,
      name: 'Mrs. Priya Sharma',
      designation: 'Senior Teacher',
      department: 'Science',
      subject: 'Physics',
      email: 'priya.sharma@dpsrkp.net',
      phone: '+91-11-26172481',
      photo: '/staff/physics-teacher.jpg',
      bio: 'Mrs. Priya Sharma is an experienced Physics teacher with a passion for experimental learning.',
      isVisible: true,
      order: 2
    },
    {
      schoolId: createdSchools[0].id,
      name: 'Mr. Amit Singh',
      designation: 'Computer Science Teacher',
      department: 'Computer Science',
      subject: 'Computer Science',
      email: 'amit.singh@dpsrkp.net',
      phone: '+91-11-26172482',
      photo: '/staff/cs-teacher.jpg',
      bio: 'Mr. Amit Singh specializes in programming languages and computer applications.',
      isVisible: true,
      order: 3
    },
    {
      schoolId: createdSchools[1].id,
      name: 'Mr. Ashok Kumar',
      designation: 'Principal',
      department: 'Administration',
      subject: null,
      email: 'principal@kv1jnu.edu.in',
      phone: '+91-11-26714075',
      photo: '/staff/kv-principal.jpg',
      bio: 'Mr. Ashok Kumar has been serving as Principal of KV No.1 JNU for the past 8 years.',
      isVisible: true,
      order: 1
    }
  ]

  for (const staff of demoStaff) {
    await prisma.staff.create({ data: staff })
  }
  console.log('👨‍🏫 Created demo staff')

  // Create Demo Pages
  const demoPages = [
    {
      schoolId: createdSchools[0].id,
      title: 'Academic Calendar 2023-24',
      slug: 'academic-calendar-2023-24',
      content: JSON.stringify({
        content: '# Academic Calendar 2023-24\n\n## Important Dates\n\n### First Term\n- **Reopening**: April 3, 2023\n- **Unit Test 1**: April 25-30, 2023\n- **Mid-Term Break**: June 15-30, 2023\n\n### Second Term\n- **Reopening**: October 1, 2023\n- **Final Exam**: March 1-15, 2024'
      }),
      metaTitle: 'Academic Calendar 2023-24 - DPS R.K. Puram',
      metaDesc: 'Complete academic calendar for the session 2023-24 with exam dates and holidays.',
      isVisible: true,
      order: 1
    },
    {
      schoolId: createdSchools[0].id,
      title: 'Admission Procedure',
      slug: 'admission-procedure',
      content: JSON.stringify({
        content: '# Admission Procedure\n\n## Eligibility Criteria\n\n### Class 1\n- Age: 5+ years as on March 31, 2024\n- Documents required: Birth certificate, address proof, photographs\n\n## Admission Process\n\n1. **Registration**: Fill the registration form\n2. **Document Verification**: Submit required documents\n3. **Entrance Test**: If applicable\n4. **Interaction**: With admission committee\n5. **Fee Payment**: Complete admission formalities'
      }),
      metaTitle: 'Admission Procedure - DPS R.K. Puram',
      metaDesc: 'Complete admission procedure for all classes with eligibility criteria and required documents.',
      isVisible: true,
      order: 2
    },
    {
      schoolId: createdSchools[1].id,
      title: 'School Rules & Regulations',
      slug: 'school-rules-regulations',
      content: JSON.stringify({
        content: '# School Rules & Regulations\n\n## Attendance\n- Minimum 75% attendance is mandatory\n- Leave applications must be submitted in writing\n\n## Uniform\n- Students must wear proper school uniform\n- Clean and well-maintained uniform is expected\n\n## Discipline\n- Maintain discipline in classrooms and campus\n- Respect teachers and fellow students'
      }),
      metaTitle: 'School Rules & Regulations - KV No.1 JNU',
      metaDesc: 'Important school rules and regulations for students and parents.',
      isVisible: true,
      order: 1
    }
  ]

  for (const page of demoPages) {
    await prisma.page.create({ data: page })
  }
  console.log('📖 Created demo pages')

  // Create Demo Admissions
  const demoAdmissions = [
    {
      schoolId: createdSchools[0].id,
      session: '2024-25',
      isOpen: true,
      instructions: 'Please fill the admission form carefully and attach all required documents.',
      eligibility: 'For Class 1: 5+ years as on March 31, 2024. For other classes: Based on previous class performance.'
    },
    {
      schoolId: createdSchools[1].id,
      session: '2024-25',
      isOpen: true,
      instructions: 'Admission forms are available at school office and can be downloaded from website.',
      eligibility: 'As per KVS admission guidelines. Priority for transferable central government employees.'
    },
    {
      schoolId: createdSchools[2].id,
      session: '2024-25',
      isOpen: false,
      instructions: 'Admissions are currently closed. Please check back later.',
      eligibility: 'Based on government guidelines and seat availability.'
    }
  ]

  const createdAdmissions = []
  for (const admission of demoAdmissions) {
    const createdAdmission = await prisma.admission.create({ data: admission })
    createdAdmissions.push(createdAdmission)
  }

  // Create Demo Admission Enquiries
  const demoAdmissionEnquiries = [
    {
      admissionId: createdAdmissions[0].id,
      studentName: 'Rahul Sharma',
      parentName: 'Vikram Sharma',
      phone: '+91-9876543210',
      email: 'vikram.sharma@email.com',
      grade: 'Class 1',
      message: 'I would like to admit my son in Class 1 for the academic session 2024-25.',
      status: 'CONTACTED'
    },
    {
      admissionId: createdAdmissions[0].id,
      studentName: 'Priya Patel',
      parentName: 'Ramesh Patel',
      phone: '+91-9876543211',
      email: 'ramesh.patel@email.com',
      grade: 'Class 6',
      message: 'Please provide information about admission process for Class 6.',
      status: 'PENDING'
    },
    {
      admissionId: createdAdmissions[1].id,
      studentName: 'Anjali Singh',
      parentName: 'Rajendra Singh',
      phone: '+91-9876543213',
      email: 'rajendra.singh@email.com',
      grade: 'Class 1',
      message: 'We are central government employees, seeking admission in KV.',
      status: 'CONVERTED'
    }
  ]

  for (const enquiry of demoAdmissionEnquiries) {
    await prisma.admissionEnquiry.create({ data: enquiry })
  }
  console.log('📝 Created demo admissions')

  // Create Demo Achievements
  const demoAchievements = [
    {
      schoolId: createdSchools[0].id,
      title: 'National Science Exhibition Winner',
      description: 'Our students won first prize in the National Science Exhibition held at IIT Delhi.',
      imageUrl: '/achievements/science-expo-win.jpg',
      date: new Date('2023-12-10'),
      isVisible: true,
      order: 1
    },
    {
      schoolId: createdSchools[0].id,
      title: 'Inter-School Basketball Championship',
      description: 'Our basketball team won the Inter-School Basketball Championship 2023.',
      imageUrl: '/achievements/basketball-champs.jpg',
      date: new Date('2023-11-25'),
      isVisible: true,
      order: 2
    },
    {
      schoolId: createdSchools[0].id,
      title: 'CBSE Board Toppers',
      description: 'Our students secured top positions in CBSE Class 12 Board Examination 2023.',
      imageUrl: '/achievements/board-toppers.jpg',
      date: new Date('2023-05-15'),
      isVisible: true,
      order: 3
    },
    {
      schoolId: createdSchools[1].id,
      title: 'KVS National Level Quiz Competition',
      description: 'Our students won second prize in KVS National Level Quiz Competition.',
      imageUrl: '/achievements/quiz-winners.jpg',
      date: new Date('2023-09-15'),
      isVisible: true,
      order: 1
    }
  ]

  for (const achievement of demoAchievements) {
    await prisma.achievement.create({ data: achievement })
  }
  console.log('🏆 Created demo achievements')

  // Create Demo Contacts
  const demoContacts = [
    {
      schoolId: createdSchools[0].id,
      name: 'Sanjay Verma',
      email: 'sanjay.verma@email.com',
      phone: '+91-9876543215',
      subject: 'Admission Enquiry for Class 1',
      message: 'I would like to inquire about the admission procedure for my daughter for Class 1 for the academic session 2024-25.',
      status: 'REPLIED'
    },
    {
      schoolId: createdSchools[0].id,
      name: 'Meera Joshi',
      email: 'meera.joshi@email.com',
      phone: '+91-9876543216',
      subject: 'Fee Structure Enquiry',
      message: 'Could you please provide the detailed fee structure for Class 6 for the academic session 2024-25?',
      status: 'NEW'
    },
    {
      schoolId: createdSchools[1].id,
      name: 'Anita Sharma',
      email: 'anita.sharma@email.com',
      phone: '+91-9876543218',
      subject: 'Hostel Facility',
      message: 'Do you have hostel facilities for outstation students?',
      status: 'READ'
    }
  ]

  for (const contact of demoContacts) {
    await prisma.contact.create({ data: contact })
  }
  console.log('📞 Created demo contacts')

  // Create Demo Subscriptions
  const demoSubscriptions = [
    {
      schoolId: createdSchools[0].id,
      plan: 'PREMIUM',
      status: 'ACTIVE',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31'),
      amount: 9999,
      currency: 'INR',
      paymentMethod: 'razorpay',
      autoRenew: true,
      features: JSON.stringify(['website_builder', 'custom_domain', 'ssl_certificates', 'domain_transfers', 'dns_management', 'whois_privacy', 'hosting', 'priority_support', 'whatsapp_notices', 'online_fee_payment', 'results_upload', 'content_updates'])
    },
    {
      schoolId: createdSchools[1].id,
      plan: 'STANDARD',
      status: 'ACTIVE',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-05-31'),
      amount: 6999,
      currency: 'INR',
      paymentMethod: 'razorpay',
      autoRenew: true,
      features: JSON.stringify(['website_builder', 'custom_domain', 'ssl_certificates', 'domain_transfers', 'dns_management', 'whois_privacy', 'hosting', 'priority_support'])
    },
    {
      schoolId: createdSchools[2].id,
      plan: 'BASIC',
      status: 'ACTIVE',
      startDate: new Date('2023-07-01'),
      endDate: new Date('2024-06-30'),
      amount: 2999,
      currency: 'INR',
      paymentMethod: 'razorpay',
      autoRenew: false,
      features: JSON.stringify(['website_builder', 'free_subdomain', 'hosting', 'ssl_certificates'])
    }
  ]

  const createdSubscriptions = []
  for (const subscription of demoSubscriptions) {
    const createdSubscription = await prisma.subscription.create({ data: subscription })
    createdSubscriptions.push(createdSubscription)
  }
  console.log('💳 Created demo subscriptions')

  // Create Demo Payments
  const demoPayments = [
    {
      schoolId: createdSchools[0].id,
      subscriptionId: createdSubscriptions[0].id,
      amount: 9999,
      currency: 'INR',
      status: 'SUCCESS',
      method: 'razorpay',
      transactionId: 'txn_1234567890',
      razorpayOrderId: 'raz_order_1234567890',
      razorpayPaymentId: 'raz_pay_1234567890',
      description: 'Premium Plan - Yearly Subscription'
    },
    {
      schoolId: createdSchools[1].id,
      subscriptionId: createdSubscriptions[1].id,
      amount: 6999,
      currency: 'INR',
      status: 'SUCCESS',
      method: 'razorpay',
      transactionId: 'txn_2345678901',
      razorpayOrderId: 'raz_order_2345678901',
      razorpayPaymentId: 'raz_pay_2345678901',
      description: 'Standard Plan - Yearly Subscription'
    },
    {
      schoolId: createdSchools[2].id,
      subscriptionId: createdSubscriptions[2].id,
      amount: 2999,
      currency: 'INR',
      status: 'SUCCESS',
      method: 'razorpay',
      transactionId: 'txn_3456789012',
      razorpayOrderId: 'raz_order_3456789012',
      razorpayPaymentId: 'raz_pay_3456789012',
      description: 'Basic Plan - Yearly Subscription'
    }
  ]

  for (const payment of demoPayments) {
    await prisma.payment.create({ data: payment })
  }
  console.log('💰 Created demo payments')

  // Create Demo SSL Certificates
  const demoSslCertificates = [
    {
      schoolId: createdSchools[0].id,
      domain: 'dpsrkp.vidyawebbuilder.in',
      certificatePath: '/ssl/certs/dpsrkp.vidyawebbuilder.in.crt',
      privateKeyPath: '/ssl/private/dpsrkp.vidyawebbuilder.in.key',
      issuer: 'Let\'s Encrypt',
      issuedAt: new Date('2023-12-01'),
      expiresAt: new Date('2024-03-01'),
      status: 'ACTIVE',
      autoRenew: true,
      lastRenewedAt: new Date('2023-12-01')
    },
    {
      schoolId: createdSchools[1].id,
      domain: 'kv1jnu.vidyawebbuilder.in',
      certificatePath: '/ssl/certs/kv1jnu.vidyawebbuilder.in.crt',
      privateKeyPath: '/ssl/private/kv1jnu.vidyawebbuilder.in.key',
      issuer: 'Let\'s Encrypt',
      issuedAt: new Date('2023-11-15'),
      expiresAt: new Date('2024-02-15'),
      status: 'ACTIVE',
      autoRenew: true,
      lastRenewedAt: new Date('2023-11-15')
    },
    {
      schoolId: createdSchools[0].id,
      domain: 'www.dpsrkp.in',
      certificatePath: null,
      privateKeyPath: null,
      issuer: null,
      issuedAt: null,
      expiresAt: null,
      status: 'PENDING',
      autoRenew: true,
      lastRenewedAt: null
    }
  ]

  for (const ssl of demoSslCertificates) {
    await prisma.sslCertificate.create({ data: ssl })
  }
  console.log('🔒 Created demo SSL certificates')

  // Create Demo Uptime Monitors
  const demoUptimeMonitors = [
    {
      schoolId: createdSchools[0].id,
      url: 'https://dpsrkp.vidyawebbuilder.in',
      status: 'ACTIVE',
      checkInterval: 300,
      timeout: 30,
      lastChecked: new Date(),
      isUp: true,
      responseTime: 245,
      uptime: 99.8,
      totalChecks: 8640,
      successfulChecks: 8622
    },
    {
      schoolId: createdSchools[0].id,
      url: 'https://dpsrkp.vidyawebbuilder.in/api/health',
      status: 'ACTIVE',
      checkInterval: 300,
      timeout: 30,
      lastChecked: new Date(),
      isUp: true,
      responseTime: 156,
      uptime: 99.9,
      totalChecks: 8640,
      successfulChecks: 8631
    },
    {
      schoolId: createdSchools[1].id,
      url: 'https://kv1jnu.vidyawebbuilder.in',
      status: 'ACTIVE',
      checkInterval: 300,
      timeout: 30,
      lastChecked: new Date(),
      isUp: true,
      responseTime: 298,
      uptime: 99.5,
      totalChecks: 7200,
      successfulChecks: 7164
    },
    {
      schoolId: createdSchools[2].id,
      url: 'https://sarvodaya-bawana.vidyawebbuilder.in',
      status: 'ACTIVE',
      checkInterval: 300,
      timeout: 30,
      lastChecked: new Date(Date.now() - 15 * 60 * 1000),
      isUp: false,
      responseTime: null,
      uptime: 98.2,
      totalChecks: 5400,
      successfulChecks: 5303
    }
  ]

  const createdMonitors = []
  for (const monitor of demoUptimeMonitors) {
    const createdMonitor = await prisma.uptimeMonitor.create({ data: monitor })
    createdMonitors.push(createdMonitor)
  }
  console.log('📊 Created demo uptime monitors')

  // Create Demo Uptime Alerts
  const demoUptimeAlerts = [
    {
      monitorId: createdMonitors[3].id,
      type: 'DOWN',
      threshold: 5,
      consecutiveFails: 8,
      isTriggered: true,
      lastTriggeredAt: new Date(Date.now() - 15 * 60 * 1000),
      emailSent: true
    },
    {
      monitorId: createdMonitors[0].id,
      type: 'SLOW_RESPONSE',
      threshold: 2000,
      consecutiveFails: 3,
      isTriggered: false,
      lastTriggeredAt: new Date('2023-12-10'),
      resolvedAt: new Date('2023-12-10'),
      emailSent: false
    }
  ]

  for (const alert of demoUptimeAlerts) {
    await prisma.uptimeAlert.create({ data: alert })
  }
  console.log('🚨 Created demo uptime alerts')

  // Create Demo Renewal Reminders
  const demoRenewalReminders = [
    {
      schoolId: createdSchools[0].id,
      type: 'SUBSCRIPTION_EXPIRING',
      scheduledFor: new Date('2024-02-15'),
      email: 'principal@dps.edu.in',
      subject: 'Subscription Renewal Reminder - DPS R.K. Puram',
      content: 'Dear Admin, Your Premium Plan subscription is expiring on March 31, 2024. Please renew to continue enjoying all features.',
      status: 'PENDING'
    },
    {
      schoolId: createdSchools[0].id,
      type: 'SSL_EXPIRING',
      scheduledFor: new Date('2024-02-01'),
      email: 'admin@dpsrkp.net',
      subject: 'SSL Certificate Expiry Reminder - dpsrkp.vidyawebbuilder.in',
      content: 'Your SSL certificate for domain dpsrkp.vidyawebbuilder.in is expiring on March 1, 2024. Auto-renewal is enabled.',
      status: 'PENDING'
    },
    {
      schoolId: createdSchools[1].id,
      type: 'SUBSCRIPTION_EXPIRING',
      scheduledFor: new Date('2024-04-01'),
      email: 'principal@kv.edu.in',
      subject: 'Subscription Renewal Reminder - KV No.1 JNU',
      content: 'Dear Admin, Your Standard Plan subscription is expiring on May 31, 2024. Please renew to continue enjoying all features.',
      status: 'PENDING'
    },
    {
      schoolId: createdSchools[2].id,
      type: 'DOMAIN_EXPIRING',
      scheduledFor: new Date('2024-05-01'),
      email: 'manager@govt-school.edu.in',
      subject: 'Domain Renewal Reminder - sarvodaya-bawana.vidyawebbuilder.in',
      content: 'Your domain sarvodaya-bawana.vidyawebbuilder.in is expiring on June 30, 2024. Please renew to avoid service disruption.',
      status: 'PENDING'
    },
    {
      schoolId: createdSchools[0].id,
      type: 'SUBSCRIPTION_EXPIRING',
      scheduledFor: new Date('2024-01-20'),
      email: 'admin@dpsrkp.net',
      subject: 'Website Content Update Reminder',
      content: 'This is a reminder to update your website content for the new academic session 2024-25.',
      status: 'SENT',
      sentAt: new Date('2024-01-20')
    }
  ]

  for (const reminder of demoRenewalReminders) {
    await prisma.renewalReminder.create({ data: reminder })
  }
  console.log('📅 Created demo renewal reminders')

  // Create Demo Domain Transfers
  const demoDomainTransfers = [
    {
      schoolId: createdSchools[0].id,
      domain: 'dpsrkp.in',
      currentRegistrar: 'GoDaddy',
      authCode: 'ABC123DEF456',
      transferStatus: 'COMPLETED',
      initiatedAt: new Date('2023-12-01'),
      completedAt: new Date('2023-12-05'),
      expiryDate: new Date('2024-12-05'),
      autoRenew: true,
      privacyProtection: true,
      lockStatus: false,
      adminEmail: 'admin@dpsrkp.in',
      adminPhone: '+91-9876543210',
      transferNotes: 'Transfer completed successfully. DNS updated and pointing to VidyaWebBuilder nameservers.'
    },
    {
      schoolId: createdSchools[1].id,
      domain: 'kv1jnu.edu.in',
      currentRegistrar: 'BigRock',
      authCode: 'XYZ789ABC012',
      transferStatus: 'PENDING',
      initiatedAt: new Date('2024-01-10'),
      completedAt: null,
      expiryDate: null,
      autoRenew: true,
      privacyProtection: false,
      lockStatus: true,
      adminEmail: 'principal@kv1jnu.edu.in',
      adminPhone: '+91-9876543211',
      transferNotes: 'Waiting for admin approval from current registrar.'
    },
    {
      schoolId: createdSchools[0].id,
      domain: 'dpsdelhi.in',
      currentRegistrar: 'Namecheap',
      authCode: null,
      transferStatus: 'PROCESSING',
      initiatedAt: new Date('2024-01-15'),
      completedAt: null,
      expiryDate: null,
      autoRenew: false,
      privacyProtection: false,
      lockStatus: true,
      adminEmail: 'principal@dpsrkp.net',
      adminPhone: '+91-9876543212',
      transferNotes: 'Awaiting authorization code from domain owner.'
    }
  ]

  const createdTransfers = []
  for (const transfer of demoDomainTransfers) {
    const createdTransfer = await prisma.domainTransfer.create({ data: transfer })
    createdTransfers.push(createdTransfer)
  }
  console.log('🔄 Created demo domain transfers')

  // Create Demo DNS Records
  const demoDnsRecords = [
    {
      domainTransferId: createdTransfers[0].id,
      schoolId: createdSchools[0].id,
      type: 'A',
      name: '@',
      value: '192.168.1.100',
      ttl: 3600,
      priority: null,
      isActive: true
    },
    {
      domainTransferId: createdTransfers[0].id,
      schoolId: createdSchools[0].id,
      type: 'CNAME',
      name: 'www',
      value: 'dpsrkp.vidyawebbuilder.in',
      ttl: 3600,
      priority: null,
      isActive: true
    },
    {
      domainTransferId: createdTransfers[0].id,
      schoolId: createdSchools[0].id,
      type: 'MX',
      name: '@',
      value: 'mail.dpsrkp.vidyawebbuilder.in',
      ttl: 3600,
      priority: 10,
      isActive: true
    },
    {
      domainTransferId: createdTransfers[0].id,
      schoolId: createdSchools[0].id,
      type: 'TXT',
      name: '@',
      value: 'v=spf1 include:_spf.google.com ~all',
      ttl: 3600,
      priority: null,
      isActive: true
    },
    {
      domainTransferId: createdTransfers[0].id,
      schoolId: createdSchools[0].id,
      type: 'NS',
      name: '@',
      value: 'ns1.vidyawebbuilder.in',
      ttl: 3600,
      priority: null,
      isActive: true
    },
    {
      domainTransferId: createdTransfers[1].id,
      schoolId: createdSchools[1].id,
      type: 'A',
      name: '@',
      value: '192.168.1.101',
      ttl: 3600,
      priority: null,
      isActive: true
    },
    {
      domainTransferId: createdTransfers[1].id,
      schoolId: createdSchools[1].id,
      type: 'CNAME',
      name: 'mail',
      value: 'ghs.google.com',
      ttl: 3600,
      priority: null,
      isActive: true
    }
  ]

  for (const dns of demoDnsRecords) {
    await prisma.dnsRecord.create({ data: dns })
  }
  console.log('🌐 Created demo DNS records')

  // Create Demo WHOIS Privacy
  const demoWhoisPrivacy = [
    {
      schoolId: createdSchools[0].id,
      domain: 'dpsrkp.vidyawebbuilder.in',
      isEnabled: true,
      privacyProvider: 'VidyaWebBuilder Privacy',
      expiryDate: new Date('2024-03-01'),
      autoRenew: true,
      maskedEmail: 'privacy-12345@proxy.vidyawebbuilder.in',
      maskedPhone: '+91-XXXX-XXXX-12',
      maskedAddress: 'Private Address (Protected by WHOIS Privacy)',
      status: 'ACTIVE'
    },
    {
      schoolId: createdSchools[1].id,
      domain: 'kv1jnu.vidyawebbuilder.in',
      isEnabled: true,
      privacyProvider: 'VidyaWebBuilder Privacy',
      expiryDate: new Date('2024-02-15'),
      autoRenew: true,
      maskedEmail: 'privacy-67890@proxy.vidyawebbuilder.in',
      maskedPhone: '+91-XXXX-XXXX-34',
      maskedAddress: 'Private Address (Protected by WHOIS Privacy)',
      status: 'ACTIVE'
    },
    {
      schoolId: createdSchools[0].id,
      domain: 'dpsrkp.in',
      isEnabled: false,
      privacyProvider: null,
      expiryDate: null,
      autoRenew: true,
      maskedEmail: null,
      maskedPhone: null,
      maskedAddress: null,
      status: 'DISABLED'
    }
  ]

  for (const privacy of demoWhoisPrivacy) {
    await prisma.whoisPrivacy.create({ data: privacy })
  }
  console.log('🛡️ Created demo WHOIS privacy')

  console.log('✅ Demo data seeding completed successfully!')
  console.log('')
  console.log('🎯 Demo Users Created:')
  console.log('   Platform Admin: admin@vidyawebbuilder.in / admin123')
  console.log('   DPS Principal: principal@dps.edu.in / principal123')
  console.log('   DPS Teacher: teacher@dps.edu.in / teacher123')
  console.log('   DPS Staff: staff@dps.edu.in / staff123')
  console.log('   KV Principal: principal@kv.edu.in / principal123')
  console.log('   Govt School Manager: manager@govt-school.edu.in / manager123')
  console.log('')
  console.log('🏫 Demo Schools Created:')
  console.log('   1. Delhi Public School (Premium Plan)')
  console.log('   2. Kendriya Vidyalaya No.1 (Standard Plan)')
  console.log('   3. Sarvodaya Government School (Basic Plan)')
  console.log('')
  console.log('📊 Demo Data Summary:')
  console.log('   • 6 Users with different roles')
  console.log('   • 3 Schools with different plans')
  console.log('   • 3 Templates')
  console.log('   • 5 Website Sections')
  console.log('   • 5 Notices')
  console.log('   • 4 Photo Galleries with images')
  console.log('   • 4 Staff Members')
  console.log('   • 3 Custom Pages')
  console.log('   • 3 Admissions with enquiries')
  console.log('   • 4 Achievements')
  console.log('   • 3 Contact Messages')
  console.log('   • 3 Subscriptions')
  console.log('   • 3 Payments')
  console.log('   • 3 SSL Certificates')
  console.log('   • 4 Uptime Monitors')
  console.log('   • 2 Uptime Alerts')
  console.log('   • 5 Renewal Reminders')
  console.log('   • 3 Domain Transfers')
  console.log('   • 7 DNS Records')
  console.log('   • 3 WHOIS Privacy Records')
  console.log('   • Feature flags for all plans')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })