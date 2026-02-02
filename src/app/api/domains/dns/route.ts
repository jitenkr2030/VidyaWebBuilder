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
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    let whereClause: any = { schoolId }
    if (domain) {
      whereClause.domain = domain
    }
    
    // Get DNS records for the school
    const dnsRecords = await db.dnsRecord.findMany({
      where: whereClause,
      include: {
        domainTransfer: {
          select: {
            domain: true,
            transferStatus: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(dnsRecords)
  } catch (error) {
    console.error('DNS records fetch error:', error)
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
      type, 
      name, 
      value, 
      ttl = 3600, 
      priority,
      domainTransferId,
      domain
    } = await request.json()
    
    if (!type || !name || !value) {
      return NextResponse.json({ error: 'Type, name, and value are required' }, { status: 400 })
    }

    const schoolId = session.user.schoolId as string

    // Validate DNS record based on type
    const validationResult = validateDnsRecord(type, name, value, priority)
    if (!validationResult.isValid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 })
    }

    // Create DNS record
    const dnsRecord = await db.dnsRecord.create({
      data: {
        schoolId,
        type,
        name,
        value,
        ttl,
        priority: priority || null,
        domainTransferId: domainTransferId || null
      }
    })

    // Propagate DNS changes (in production, this would update actual DNS servers)
    propagateDnsChanges(dnsRecord.id, 'CREATE')

    return NextResponse.json({
      success: true,
      dnsRecord,
      message: 'DNS record created successfully'
    })
  } catch (error) {
    console.error('DNS record creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function validateDnsRecord(type: string, name: string, value: string, priority?: number) {
  switch (type) {
    case 'A':
      // Validate IPv4 address
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
      if (!ipv4Regex.test(value)) {
        return { isValid: false, error: 'Invalid IPv4 address format' }
      }
      break

    case 'AAAA':
      // Validate IPv6 address
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
      if (!ipv6Regex.test(value)) {
        return { isValid: false, error: 'Invalid IPv6 address format' }
      }
      break

    case 'CNAME':
      // Validate domain name
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
      if (!domainRegex.test(value)) {
        return { isValid: false, error: 'Invalid domain name format for CNAME' }
      }
      break

    case 'MX':
      // Validate MX record (requires priority)
      if (!priority || priority < 0 || priority > 65535) {
        return { isValid: false, error: 'MX records require a valid priority (0-65535)' }
      }
      const mxDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
      if (!mxDomainRegex.test(value)) {
        return { isValid: false, error: 'Invalid mail server domain format' }
      }
      break

    case 'TXT':
      // TXT records can contain any text
      if (value.length > 255) {
        return { isValid: false, error: 'TXT record value too long (max 255 characters)' }
      }
      break

    case 'NS':
      // Validate nameserver
      const nsRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
      if (!nsRegex.test(value)) {
        return { isValid: false, error: 'Invalid nameserver format' }
      }
      break

    case 'SRV':
      // SRV records require priority
      if (!priority || priority < 0 || priority > 65535) {
        return { isValid: false, error: 'SRV records require a valid priority (0-65535)' }
      }
      break

    case 'CAA':
      // CAA records for certificate authority authorization
      if (!value.startsWith('issue ') && !value.startsWith('issuewild ') && !value.startsWith('iodef ')) {
        return { isValid: false, error: 'CAA record must start with issue, issuewild, or iodef' }
      }
      break

    case 'PTR':
      // Pointer records for reverse DNS lookups
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
    // In production, this would integrate with DNS provider APIs
    // For demo, we'll simulate the propagation
    console.log(`DNS ${action} operation for record ${recordId}`)
    
    // Simulate DNS propagation delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log(`DNS changes propagated for record ${recordId}`)
  } catch (error) {
    console.error('DNS propagation error:', error)
  }
}