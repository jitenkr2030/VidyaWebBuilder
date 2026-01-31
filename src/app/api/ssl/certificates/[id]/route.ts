import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { certificateId } = await request.json()
    
    if (!certificateId) {
      return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 })
    }

    const schoolId = session.user.schoolId as string

    // Get certificate
    const certificate = await db.sslCertificate.findFirst({
      where: { id: certificateId, schoolId }
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Verify SSL certificate
    const verificationResult = await verifySslCertificate(certificate.domain)

    // Update certificate status based on verification
    let newStatus = certificate.status
    if (verificationResult.isValid && verificationResult.daysUntilExpiry > 30) {
      newStatus = 'ACTIVE'
    } else if (verificationResult.isValid && verificationResult.daysUntilExpiry <= 30) {
      newStatus = 'EXPIRING'
    } else if (!verificationResult.isValid) {
      newStatus = 'EXPIRED'
    }

    await db.sslCertificate.update({
      where: { id: certificateId },
      data: { status: newStatus }
    })

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      status: newStatus
    })
  } catch (error) {
    console.error('SSL verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { certificateId } = await request.json()
    
    if (!certificateId) {
      return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 })
    }

    const schoolId = session.user.schoolId as string

    // Get certificate
    const certificate = await db.sslCertificate.findFirst({
      where: { id: certificateId, schoolId }
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Start renewal process
    await db.sslCertificate.update({
      where: { id: certificateId },
      data: { status: 'PENDING' }
    })

    // Trigger renewal in background
    renewSslCertificate(certificateId)

    return NextResponse.json({
      success: true,
      message: 'SSL certificate renewal started'
    })
  } catch (error) {
    console.error('SSL renewal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function verifySslCertificate(domain: string) {
  try {
    // In production, this would use node-forge or tls module to verify actual certificate
    // For demo, we'll simulate verification
    
    const mockCert = {
      isValid: true,
      issuer: 'Let\'s Encrypt Authority X3',
      issuedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      daysUntilExpiry: 30
    }

    // Calculate days until expiry
    const now = new Date()
    const daysUntilExpiry = Math.ceil((mockCert.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      ...mockCert,
      daysUntilExpiry,
      isValid: daysUntilExpiry > 0
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    }
  }
}

async function renewSslCertificate(certificateId: string) {
  try {
    // Simulate renewal process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const issuedAt = new Date()
    const expiresAt = new Date(issuedAt.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days

    await db.sslCertificate.update({
      where: { id: certificateId },
      data: {
        status: 'ACTIVE',
        issuer: 'Let\'s Encrypt Authority X3',
        issuedAt,
        expiresAt,
        lastRenewedAt: issuedAt,
        renewalError: null
      }
    })

    console.log(`SSL certificate renewed successfully for ${certificateId}`)
  } catch (error) {
    console.error('SSL certificate renewal error:', error)
    
    await db.sslCertificate.update({
      where: { id: certificateId },
      data: {
        status: 'ERROR',
        renewalError: error instanceof Error ? error.message : 'Renewal failed'
      }
    })
  }
}