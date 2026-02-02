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
    
    // Get renewal reminders for the school
    const reminders = await db.renewalReminder.findMany({
      where: { schoolId },
      orderBy: { scheduledFor: 'asc' }
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Renewal reminders fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, scheduledFor, email, subject, content } = await request.json()
    
    if (!type || !scheduledFor || !email || !subject || !content) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const schoolId = session.user.schoolId as string

    // Create renewal reminder
    const reminder = await db.renewalReminder.create({
      data: {
        schoolId,
        type,
        scheduledFor: new Date(scheduledFor),
        email,
        subject,
        content,
        status: 'PENDING'
      }
    })

    // Schedule the reminder
    scheduleReminder(reminder.id)

    return NextResponse.json({
      success: true,
      reminder,
      message: 'Renewal reminder created successfully'
    })
  } catch (error) {
    console.error('Renewal reminder creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Generate automatic renewal reminders for subscriptions
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const schoolId = session.user.schoolId as string

    // Get school information
    const school = await db.school.findUnique({
      where: { id: schoolId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { endDate: 'asc' }
        },
        sslCertificates: {
          where: { status: 'ACTIVE' },
          orderBy: { expiresAt: 'asc' }
        }
      }
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const createdReminders = []

    // Generate subscription expiry reminders
    for (const subscription of school.subscriptions) {
      const daysUntilExpiry = Math.ceil((subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        // Check if reminder already exists
        const existingReminder = await db.renewalReminder.findFirst({
          where: {
            schoolId,
            type: 'SUBSCRIPTION_EXPIRING',
            status: 'PENDING'
          }
        })

        if (!existingReminder) {
          const reminder = await db.renewalReminder.create({
            data: {
              schoolId,
              type: 'SUBSCRIPTION_EXPIRING',
              scheduledFor: new Date(),
              email: school.email || 'admin@school.com',
              subject: `Subscription Expiring Soon - ${school.name}`,
              content: `Your ${subscription.plan} subscription will expire in ${daysUntilExpiry} days on ${subscription.endDate.toLocaleDateString()}. Please renew to continue using our services.`,
              status: 'PENDING'
            }
          })
          
          createdReminders.push(reminder)
          scheduleReminder(reminder.id)
        }
      }
    }

    // Generate SSL certificate expiry reminders
    for (const cert of school.sslCertificates) {
      if (cert.expiresAt) {
        const daysUntilExpiry = Math.ceil((cert.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          const existingReminder = await db.renewalReminder.findFirst({
            where: {
              schoolId,
              type: 'SSL_EXPIRING',
              status: 'PENDING'
            }
          })

          if (!existingReminder) {
            const reminder = await db.renewalReminder.create({
              data: {
                schoolId,
                type: 'SSL_EXPIRING',
                scheduledFor: new Date(),
                email: school.email || 'admin@school.com',
                subject: `SSL Certificate Expiring Soon - ${cert.domain}`,
                content: `Your SSL certificate for ${cert.domain} will expire in ${daysUntilExpiry} days on ${cert.expiresAt.toLocaleDateString()}. Please renew to avoid security warnings.`,
                status: 'PENDING'
              }
            })
            
            createdReminders.push(reminder)
            scheduleReminder(reminder.id)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      reminders: createdReminders,
      message: `Generated ${createdReminders.length} renewal reminders`
    })
  } catch (error) {
    console.error('Auto renewal reminders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function scheduleReminder(reminderId: string) {
  const reminder = await db.renewalReminder.findUnique({
    where: { id: reminderId }
  })

  if (!reminder || reminder.status !== 'PENDING') return

  const delay = reminder.scheduledFor.getTime() - new Date().getTime()
  
  if (delay <= 0) {
    // Send immediately
    await sendReminderEmail(reminderId)
  } else {
    // Schedule for later
    setTimeout(() => sendReminderEmail(reminderId), delay)
  }
}

async function sendReminderEmail(reminderId: string) {
  const reminder = await db.renewalReminder.findUnique({
    where: { id: reminderId }
  })

  if (!reminder || reminder.status !== 'PENDING') return

  try {
    // Update attempt count
    await db.renewalReminder.update({
      where: { id: reminderId },
      data: {
        sendAttempts: { increment: 1 },
        lastAttemptAt: new Date()
      }
    })

    // In production, this would send actual email using nodemailer or similar
    console.log(`Sending reminder email to ${reminder.email}: ${reminder.subject}`)
    console.log(`Content: ${reminder.content}`)

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mark as sent
    await db.renewalReminder.update({
      where: { id: reminderId },
      data: {
        status: 'SENT',
        sentAt: new Date()
      }
    })

    console.log(`Reminder email sent successfully for ${reminderId}`)
  } catch (error) {
    console.error('Failed to send reminder email:', error)
    
    // Mark as failed
    await db.renewalReminder.update({
      where: { id: reminderId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}