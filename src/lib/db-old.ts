import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// PRIORITY: Neon PostgreSQL URLs first, then fallback to others
let databaseUrl = process.env.VIDYAWEB__POSTGRES_URL_NON_POOLING ||
                   process.env.VIDYAWEB__POSTGRES_URL ||
                   process.env.POSTGRES_URL ||
                   process.env.DATABASE_URL

// Debug: Log which database URL we're using
if (process.env.NODE_ENV === 'development') {
  console.log('🗄️ Database URL source:', 
    process.env.VIDYAWEB__POSTGRES_URL_NON_POOLING ? 'VIDYAWEB__POSTGRES_URL_NON_POOLING' :
    process.env.VIDYAWEB__POSTGRES_URL ? 'VIDYAWEB__POSTGRES_URL' :
    process.env.POSTGRES_URL ? 'POSTGRES_URL' :
    process.env.DATABASE_URL ? 'DATABASE_URL' : 'DEFAULT'
  )
  console.log('🗄️ Database URL (first 50 chars):', databaseUrl?.substring(0, 50) + '...')
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  })

// Debug: Log the database URL in development
if (process.env.NODE_ENV === 'development') {
  console.log('🗄️ Database URL:', databaseUrl)
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}