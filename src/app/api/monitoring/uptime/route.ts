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
    
    // Get uptime monitors for the school
    const monitors = await db.uptimeMonitor.findMany({
      where: { schoolId },
      include: {
        alerts: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(monitors)
  } catch (error) {
    console.error('Uptime monitors fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, checkInterval = 300, timeout = 30 } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const schoolId = session.user.schoolId as string

    // Create uptime monitor
    const monitor = await db.uptimeMonitor.create({
      data: {
        schoolId,
        url,
        checkInterval,
        timeout,
        status: 'ACTIVE'
      }
    })

    // Create default alerts
    await db.uptimeAlert.createMany({
      data: [
        {
          monitorId: monitor.id,
          type: 'DOWN',
          threshold: 5 // 5 consecutive failures
        },
        {
          monitorId: monitor.id,
          type: 'SLOW_RESPONSE',
          threshold: 5000 // 5 seconds
        }
      ]
    })

    // Start monitoring in background
    startMonitoring(monitor.id)

    return NextResponse.json({
      success: true,
      monitor,
      message: 'Uptime monitor created successfully'
    })
  } catch (error) {
    console.error('Uptime monitor creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function startMonitoring(monitorId: string) {
  const monitor = await db.uptimeMonitor.findUnique({
    where: { id: monitorId },
    include: { alerts: true }
  })

  if (!monitor || monitor.status !== 'ACTIVE') return

  // Run monitoring check
  await performHealthCheck(monitor)

  // Schedule next check
  setTimeout(() => startMonitoring(monitorId), monitor.checkInterval * 1000)
}

async function performHealthCheck(monitor: any) {
  try {
    const startTime = Date.now()
    
    // Perform HTTP request to check uptime
    const response = await fetch(monitor.url, {
      method: 'GET',
      timeout: monitor.timeout * 1000
    })
    
    const responseTime = Date.now() - startTime
    const isUp = response.ok

    // Update monitor stats
    const totalChecks = monitor.totalChecks + 1
    const successfulChecks = monitor.successfulChecks + (isUp ? 1 : 0)
    const uptime = (successfulChecks / totalChecks) * 100

    await db.uptimeMonitor.update({
      where: { id: monitor.id },
      data: {
        lastChecked: new Date(),
        isUp,
        responseTime,
        totalChecks,
        successfulChecks,
        uptime
      }
    })

    // Check alerts
    await checkAlerts(monitor, isUp, responseTime)

  } catch (error) {
    console.error(`Health check failed for ${monitor.url}:`, error)
    
    // Update monitor with failure
    const totalChecks = monitor.totalChecks + 1
    const uptime = (monitor.successfulChecks / totalChecks) * 100

    await db.uptimeMonitor.update({
      where: { id: monitor.id },
      data: {
        lastChecked: new Date(),
        isUp: false,
        totalChecks,
        uptime
      }
    })

    // Check down alert
    await checkAlerts(monitor, false, 0)
  }
}

async function checkAlerts(monitor: any, isUp: boolean, responseTime: number) {
  for (const alert of monitor.alerts) {
    if (alert.type === 'DOWN' && !isUp) {
      const consecutiveFails = alert.consecutiveFails + 1
      
      await db.uptimeAlert.update({
        where: { id: alert.id },
        data: {
          consecutiveFails,
          isTriggered: consecutiveFails >= (alert.threshold || 5),
          lastTriggeredAt: consecutiveFails >= (alert.threshold || 5) ? new Date() : alert.lastTriggeredAt
        }
      })

      // Send email alert if threshold reached and not already sent
      if (consecutiveFails >= (alert.threshold || 5) && !alert.emailSent) {
        await sendAlertEmail(monitor, alert)
      }
    } else if (alert.type === 'SLOW_RESPONSE' && responseTime > (alert.threshold || 5000)) {
      if (!alert.isTriggered) {
        await db.uptimeAlert.update({
          where: { id: alert.id },
          data: {
            isTriggered: true,
            lastTriggeredAt: new Date()
          }
        })
        
        await sendAlertEmail(monitor, alert)
      }
    } else if (alert.type === 'DOWN' && isUp) {
      // Reset consecutive failures on success
      await db.uptimeAlert.update({
        where: { id: alert.id },
        data: {
          consecutiveFails: 0,
          isTriggered: false,
          resolvedAt: new Date(),
          emailSent: false
        }
      })
    } else if (alert.type === 'SLOW_RESPONSE' && responseTime <= (alert.threshold || 5000)) {
      await db.uptimeAlert.update({
        where: { id: alert.id },
        data: {
          isTriggered: false,
          resolvedAt: new Date(),
          emailSent: false
        }
      })
    }
  }
}

async function sendAlertEmail(monitor: any, alert: any) {
  try {
    // In production, this would send actual email using nodemailer or similar
    console.log(`ALERT: ${alert.type} for ${monitor.url}`)
    
    // Mark email as sent
    await db.uptimeAlert.update({
      where: { id: alert.id },
      data: { emailSent: true }
    })
  } catch (error) {
    console.error('Failed to send alert email:', error)
  }
}