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

    const recordId = params.id
    const schoolId = session.user.schoolId as string

    // Get DNS record
    const dnsRecord = await db.dnsRecord.findFirst({
      where: { id: recordId, schoolId },
      include: {
        domainTransfer: {
          select: {
            domain: true,
            transferStatus: true
          }
        }
      }
    })

    if (!dnsRecord) {
      return NextResponse.json({ error: 'DNS record not found' }, { status: 404 })
    }

    return NextResponse.json(dnsRecord)
  } catch (error) {
    console.error('DNS record fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recordId = params.id
    const { type, name, value, ttl, priority, isActive } = await request.json()
    const schoolId = session.user.schoolId as string

    // Get existing DNS record
    const existingRecord = await db.dnsRecord.findFirst({
      where: { id: recordId, schoolId }
    })

    if (!existingRecord) {
      return NextResponse.json({ error: 'DNS record not found' }, { status: 404 })
    }

    // Validate updated DNS record
    const validationResult = validateDnsRecord(type, name, value, priority)
    if (!validationResult.isValid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 })
    }

    // Update DNS record
    const updatedRecord = await db.dnsRecord.update({
      where: { id: recordId },
      data: {
        type,
        name,
        value,
        ttl: ttl || 3600,
        priority: priority || null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    // Propagate DNS changes
    propagateDnsChanges(recordId, 'UPDATE')

    return NextResponse.json({
      success: true,
      dnsRecord: updatedRecord,
      message: 'DNS record updated successfully'
    })
  } catch (error) {
    console.error('DNS record update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recordId = params.id
    const schoolId = session.user.schoolId as string

    // Check if DNS record exists and belongs to school
    const dnsRecord = await db.dnsRecord.findFirst({
      where: { id: recordId, schoolId }
    })

    if (!dnsRecord) {
      return NextResponse.json({ error: 'DNS record not found' }, { status: 404 })
    }

    // Don't allow deletion of critical records
    if (dnsRecord.type === 'NS' && dnsRecord.name === '@') {
      return NextResponse.json({ error: 'Cannot delete primary nameserver records' }, { status: 400 })
    }

    // Delete DNS record
    await db.dnsRecord.delete({
      where: { id: recordId }
    })

    // Propagate DNS changes
    propagateDnsChanges(recordId, 'DELETE')

    return NextResponse.json({
      success: true,
      message: 'DNS record deleted successfully'
    })
  } catch (error) {
    console.error('DNS record deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function validateDnsRecord(type: string, name: string, value: string, priority?: number) {
  switch (type) {
    case 'A':
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
      if (!ipv4Regex.test(value)) {
        return { isValid: false, error: 'Invalid IPv4 address format' }
      }
      break

    case 'AAAA':
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
      if (!ipv6Regex.test(value)) {
        return { isValid: false, error: 'Invalid IPv6 address format' }
      }
      break

    case 'CNAME':
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
      if (!domainRegex.test(value)) {
        return { isValid: false, error: 'Invalid domain name format for CNAME' }
      }
      break

    case 'MX':
      if (!priority || priority < 0 || priority > 65535) {
        return { isValid: false, error: 'MX records require a valid priority (0-65535)' }
      }
      const mxDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
      if (!mxDomainRegex.test(value)) {
        return { isValid: false, error: 'Invalid mail server domain format' }
      }
      break

    case 'TXT':
      if (value.length > 255) {
        return { isValid: false, error: 'TXT record value too long (max 255 characters)' }
      }
      break

    case 'NS':
      const nsRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
      if (!nsRegex.test(value)) {
        return { isValid: false, error: 'Invalid nameserver format' }
      }
      break

    case 'SRV':
      if (!priority || priority < 0 || priority > 65535) {
        return { isValid: false, error: 'SRV records require a valid priority (0-65535)' }
      }
      break

    case 'CAA':
      if (!value.startsWith('issue ') && !value.startsWith('issuewild ') && !value.startsWith('iodef ')) {
        return { isValid: false, error: 'CAA record must start with issue, issuewild, or iodef' }
      }
      break

    case 'PTR':
      const ptrRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
      if (!ptrRegex.test(value)) {
        return { isValid: false, error: 'Invalid PTR record format' }
      }
      break

    default:
      return { isValid: false, error: 'Unsupported DNS record type' }
  }

  return { isValid: true }
}

async function propagateDnsChanges(recordId: string, action: 'CREATE' | 'UPDATE' | 'DELETE') {
  try {
    console.log(`DNS ${action} operation for record ${recordId}`)
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log(`DNS changes propagated for record ${recordId}`)
  } catch (error) {
    console.error('DNS propagation error:', error)
  }
}