import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      VIDYAWEB_DATABASE_URL: process.env.VIDYAWEB_DATABASE_URL ? 'SET' : 'NOT SET',
      VIDYAWEB__POSTGRES_URL_NON_POOLING: process.env.VIDYAWEB__POSTGRES_URL_NON_POOLING ? 'SET' : 'NOT SET',
      POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT SET',
      DIRECT_URL: process.env.DIRECT_URL ? 'SET' : 'NOT SET',
      VIDYAWEB_DIRECT_URL: process.env.VIDYAWEB_DIRECT_URL ? 'SET' : 'NOT SET',
      VIDYAWEB__POSTGRES_URL: process.env.VIDYAWEB__POSTGRES_URL ? 'SET' : 'NOT SET',
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    }

    const databaseUrl = process.env.DATABASE_URL || 
                       process.env.VIDYAWEB_DATABASE_URL || 
                       process.env.VIDYAWEB__POSTGRES_URL_NON_POOLING ||
                       process.env.POSTGRES_URL
    
    const connectionInfo = {
      hasDatabaseUrl: !!databaseUrl,
      databaseType: databaseUrl?.includes('postgresql') ? 'PostgreSQL' : 
                   databaseUrl?.includes('sqlite') ? 'SQLite' : 
                   databaseUrl?.includes('mysql') ? 'MySQL' : 'Unknown',
      urlStart: databaseUrl?.substring(0, 50) + '...',
      usingVariable: 
        process.env.DATABASE_URL ? 'DATABASE_URL' :
        process.env.VIDYAWEB_DATABASE_URL ? 'VIDYAWEB_DATABASE_URL' :
        process.env.VIDYAWEB__POSTGRES_URL_NON_POOLING ? 'VIDYAWEB__POSTGRES_URL_NON_POOLING' :
        process.env.POSTGRES_URL ? 'POSTGRES_URL' : 'NONE',
      envVars
    }

    return NextResponse.json({
      success: true,
      ...connectionInfo,
      recommendation: connectionInfo.hasDatabaseUrl ? 
        (connectionInfo.databaseType === 'PostgreSQL' ? 
          '✅ PostgreSQL configured correctly' : 
          `❌ Using ${connectionInfo.databaseType} instead of PostgreSQL - check environment variables`) :
        '❌ No database URL found - check Vercel environment variables',
      nextSteps: connectionInfo.hasDatabaseUrl && connectionInfo.databaseType === 'PostgreSQL' ?
        ['✅ Database ready', '🌱 Visit /api/seed-postgresql to create tables', '🧪 Test login with demo credentials'] :
        ['❌ Fix database configuration first', '🔍 Check environment variables above']
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}