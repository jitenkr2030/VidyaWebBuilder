import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// PRIORITY: Neon PostgreSQL URLs first, then fallback to SQLite for local development
let databaseUrl = process.env.VIDYAWEB__POSTGRES_URL_NON_POOLING ||
                   process.env.VIDYAWEB__POSTGRES_URL ||
                   process.env.POSTGRES_URL

// Check if we have a PostgreSQL URL
if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
  console.log('🗄️ Using PostgreSQL database (Neon)')
  console.log('🗄️ Database URL (first 50 chars):', databaseUrl.substring(0, 50) + '...')
} else {
  // Fallback to SQLite for local development
  databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'
  console.log('🗄️ Using SQLite for local development')
  console.log('🗄️ Database URL (first 50 chars):', databaseUrl.substring(0, 50) + '...')
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

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}