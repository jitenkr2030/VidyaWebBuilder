import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create subdomain from school name
    const subdomain = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20)

    // Create school
    const school = await db.school.create({
      data: {
        name,
        subdomain,
        status: 'DRAFT',
        plan: 'FREE'
      }
    })

    // Create user with admin role
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        schoolId: school.id
      }
    })

    // Create default website sections
    const defaultSections = [
      { type: 'HERO', title: 'Welcome to Our School', order: 1 },
      { type: 'ABOUT', title: 'About Us', order: 2 },
      { type: 'ACADEMICS', title: 'Academics', order: 3 },
      { type: 'FACILITIES', title: 'Facilities', order: 4 },
      { type: 'CONTACT', title: 'Contact Us', order: 5 }
    ]

    await Promise.all(
      defaultSections.map(section =>
        db.websiteSection.create({
          data: {
            schoolId: school.id,
            type: section.type as any,
            title: section.title,
            order: section.order
          }
        })
      )
    )

    return NextResponse.json(
      { 
        message: 'School registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        school: {
          id: school.id,
          name: school.name,
          subdomain: school.subdomain
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}