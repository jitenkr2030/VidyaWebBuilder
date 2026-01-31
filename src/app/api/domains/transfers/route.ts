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
    
    // Get domain transfers for the school
    const transfers = await db.domainTransfer.findMany({
      where: { schoolId },
      include: {
        dnsRecords: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(transfers)
  } catch (error) {
    console.error('Domain transfers fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      domain, 
      currentRegistrar, 
      authCode, 
      adminEmail, 
      adminPhone,
      expiryDate,
      autoRenew = false,
      privacyProtection = false
    } = await request.json()
    
    if (!domain || !currentRegistrar || !adminEmail) {
      return NextResponse.json({ error: 'Domain, current registrar, and admin email are required' }, { status: 400 })
    }

    const schoolId = session.user.schoolId as string

    // Check if domain transfer already exists
    const existingTransfer = await db.domainTransfer.findFirst({
      where: { schoolId, domain }
    })

    if (existingTransfer) {
      return NextResponse.json({ error: 'Domain transfer already exists for this domain' }, { status: 409 })
    }

    // Create domain transfer record
    const transfer = await db.domainTransfer.create({
      data: {
        schoolId,
        domain,
        currentRegistrar,
        authCode,
        adminEmail,
        adminPhone,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        autoRenew,
        privacyProtection,
        transferStatus: 'PENDING'
      }
    })

    // Start domain transfer process
    initiateDomainTransfer(transfer.id)

    return NextResponse.json({
      success: true,
      transfer,
      message: 'Domain transfer initiated successfully'
    })
  } catch (error) {
    console.error('Domain transfer creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function initiateDomainTransfer(transferId: string) {
  try {
    // Update status to processing
    await db.domainTransfer.update({
      where: { id: transferId },
      data: { transferStatus: 'PROCESSING' }
    })

    // Simulate domain transfer process
    // In production, this would integrate with domain registrar APIs
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Generate initial DNS records for the transfer
    const transfer = await db.domainTransfer.findUnique({
      where: { id: transferId }
    })

    if (transfer) {
      await db.dnsRecord.createMany({
        data: [
          {
            domainTransferId: transferId,
            schoolId: transfer.schoolId,
            type: 'A',
            name: '@',
            value: '192.168.1.1', // This would be your actual server IP
            ttl: 3600
          },
          {
            domainTransferId: transferId,
            schoolId: transfer.schoolId,
            type: 'CNAME',
            name: 'www',
            value: transfer.domain,
            ttl: 3600
          },
          {
            domainTransferId: transferId,
            schoolId: transfer.schoolId,
            type: 'MX',
            name: '@',
            value: 'mail.' + transfer.domain,
            ttl: 3600,
            priority: 10
          }
        ]
      })
    }

    // Update status to awaiting approval
    await db.domainTransfer.update({
      where: { id: transferId },
      data: { transferStatus: 'AWAITING_APPROVAL' }
    })

    console.log(`Domain transfer initiated for ${transferId}`)
  } catch (error) {
    console.error('Domain transfer initiation error:', error)
    
    await db.domainTransfer.update({
      where: { id: transferId },
      data: {
        transferStatus: 'FAILED',
        transferNotes: error instanceof Error ? error.message : 'Transfer failed'
      }
    })
  }
}