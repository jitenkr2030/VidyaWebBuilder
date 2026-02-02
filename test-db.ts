import { db } from './src/lib/db'

async function testDatabase() {
  console.log('Testing database connection...')
  try {
    const userCount = await db.user.count()
    console.log('✅ Database connected successfully')
    console.log('📊 User count:', userCount)
    
    if (userCount > 0) {
      const users = await db.user.findMany({ take: 3 })
      console.log('👥 Sample users:')
      users.forEach(user => {
        console.log('  -', user.email, 'Role:', user.role)
      })
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testDatabase()