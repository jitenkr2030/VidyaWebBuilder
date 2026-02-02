import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🧪 Testing login for:', email)
    
    // Test database connection
    const userCount = await db.user.count()
    console.log('📊 Total users in DB:', userCount)
    
    // Find user
    const user = await db.user.findUnique({
      where: { email },
      include: { school: true }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('✅ User found:', user.name)
    
    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('🔑 Password valid:', isPasswordValid)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
        school: user.school
      }
    })
    
  } catch (error) {
    console.error('❌ Test login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}