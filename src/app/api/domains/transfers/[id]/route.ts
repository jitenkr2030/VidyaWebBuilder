import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transferId = params.id
    const schoolId = session.user.schoolId as string

    // Get domain transfer with DNS records
    const transfer = await db.domainTransfer.findFirst({
      where: { id: transferId, schoolId },
      include: {
        dnsRecords: true
      }
    })

    if (!transfer) {
      return NextResponse.json({ error: 'Domain transfer not found' }, { status: 404 })
    }

    return NextResponse.json(transfer)
  } catch (error) {
    console.error('Domain transfer fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transferId = params.id
    const { action, authCode, notes } = await request.json()
    const schoolId = session.user.schoolId as string

    // Get existing transfer
    const transfer = await db.domainTransfer.findFirst({
      where: { id: transferId, schoolId }
    })

    if (!transfer) {
      return NextResponse.json({ error: 'Domain transfer not found' }, { status: 404 })
    }

    let updateData: any = {}
    let message = ''

    switch (action) {
      case 'approve':
        updateData = {
          transferStatus: 'COMPLETED',
          completedAt: new Date(),
          transferNotes: notes || 'Transfer approved and completed'
        }
        message = 'Domain transfer approved successfully'
        break

      case 'reject':
        updateData = {
          transferStatus: 'FAILED',
          transferNotes: notes || 'Transfer rejected'
        }
        message = 'Domain transfer rejected'
        break

      case 'cancel':
        updateData = {
          transferStatus: 'CANCELLED',
          transferNotes: notes || 'Transfer cancelled'
        }
        message = 'Domain transfer cancelled'
        break

      case 'submit_auth_code':
        if (!authCode) {
          return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 })
        }
        updateData = {
          authCode,
          transferStatus: 'PROCESSING',
          transferNotes: 'Authorization code submitted, processing transfer'
        }
        message = 'Authorization code submitted successfully'
        // Restart transfer process with auth code
        processTransferWithAuthCode(transferId, authCode)
        break

      case 'unlock_domain':
        updateData = {
          lockStatus: false,
          transferNotes: notes || 'Domain unlocked for transfer'
        }
        message = 'Domain unlocked successfully'
        break

      case 'lock_domain':
        updateData = {
          lockStatus: true,
          transferNotes: notes || 'Domain locked'
        }
        message = 'Domain locked successfully'
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update transfer
    const updatedTransfer = await db.domainTransfer.update({
      where: { id: transferId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      transfer: updatedTransfer,
      message
    })
  } catch (error) {
    console.error('Domain transfer update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transferId = params.id
    const schoolId = session.user.schoolId as string

    // Check if transfer exists and belongs to school
    const transfer = await db.domainTransfer.findFirst({
      where: { id: transferId, schoolId }
    })

    if (!transfer) {
      return NextResponse.json({ error: 'Domain transfer not found' }, { status: 404 })
    }

    // Only allow deletion of pending or failed transfers
    if (!['PENDING', 'FAILED', 'CANCELLED'].includes(transfer.transferStatus)) {
      return NextResponse.json({ error: 'Cannot delete active transfer' }, { status: 400 })
    }

    // Delete transfer and related DNS records
    await db.domainTransfer.delete({
      where: { id: transferId }
    })

    return NextResponse.json({
      success: true,
      message: 'Domain transfer deleted successfully'
    })
  } catch (error) {
    console.error('Domain transfer deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processTransferWithAuthCode(transferId: string, authCode: string) {
  try {
    // Simulate processing with auth code
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Update to completed status
    await db.domainTransfer.update({
      where: { id: transferId },
      data: {
        transferStatus: 'COMPLETED',
        completedAt: new Date(),
        transferNotes: 'Transfer completed successfully with authorization code'
      }
    })

    console.log(`Domain transfer completed for ${transferId}`)
  } catch (error) {
    console.error('Transfer processing error:', error)
    
    await db.domainTransfer.update({
      where: { id: transferId },
      data: {
        transferStatus: 'FAILED',
        transferNotes: error instanceof Error ? error.message : 'Transfer failed'
      }
    })
  }
}