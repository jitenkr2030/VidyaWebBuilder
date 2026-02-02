import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAuth() {
  try {
    const email = 'principal@dps.edu.in'
    const password = 'principal123'
    
    console.log('Testing authentication for:', email)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: true }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ User found:', user.name, user.role)
    
    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isPasswordValid ? '✅' : '❌')
    
    // Show password hash for debugging
    console.log('Password hash:', user.password.substring(0, 20) + '...')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()