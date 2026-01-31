import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const schoolId = session.user.schoolId as string
    
    // Get SSL certificates for the school
    const certificates = await db.sslCertificate.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(certificates)
  } catch (error) {
    console.error('SSL certificates fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domain } = await request.json()
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    const schoolId = session.user.schoolId as string

    // Check if certificate already exists for this domain
    const existingCert = await db.sslCertificate.findFirst({
      where: { schoolId, domain }
    })

    if (existingCert) {
      return NextResponse.json({ error: 'Certificate already exists for this domain' }, { status: 409 })
    }

    // Create SSL certificate record
    const certificate = await db.sslCertificate.create({
      data: {
        schoolId,
        domain,
        status: 'PENDING'
      }
    })

    // Start SSL certificate generation process
    // In production, this would trigger a background job
    generateSslCertificate(certificate.id)

    return NextResponse.json({
      success: true,
      certificate,
      message: 'SSL certificate generation started'
    })
  } catch (error) {
    console.error('SSL certificate creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateSslCertificate(certificateId: string) {
  try {
    // Update status to processing
    await db.sslCertificate.update({
      where: { id: certificateId },
      data: { status: 'PENDING' }
    })

    // Simulate SSL certificate generation with Let's Encrypt
    // In production, this would use acme-client or similar library
    await new Promise(resolve => setTimeout(resolve, 5000)) // Simulate processing time

    // Generate mock certificate data
    const issuedAt = new Date()
    const expiresAt = new Date(issuedAt.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days

    await db.sslCertificate.update({
      where: { id: certificateId },
      data: {
        status: 'ACTIVE',
        issuer: 'Let\'s Encrypt Authority X3',
        issuedAt,
        expiresAt,
        certificatePath: `/etc/ssl/certs/${certificateId}.pem`,
        privateKeyPath: `/etc/ssl/private/${certificateId}.key`,
        lastRenewedAt: issuedAt
      }
    })

    console.log(`SSL certificate generated successfully for ${certificateId}`)
  } catch (error) {
    console.error('SSL certificate generation error:', error)
    
    await db.sslCertificate.update({
      where: { id: certificateId },
      data: {
        status: 'ERROR',
        renewalError: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}