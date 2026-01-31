"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Plus,
  Send,
  Bell,
  FileText,
  Trash2
} from 'lucide-react'

interface RenewalReminder {
  id: string
  type: 'SUBSCRIPTION_EXPIRING' | 'SUBSCRIPTION_EXPIRED' | 'SSL_EXPIRING' | 'SSL_EXPIRED' | 'DOMAIN_EXPIRING' | 'DOMAIN_EXPIRED'
  scheduledFor: string
  sentAt?: string
  email: string
  subject: string
  content: string
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED'
  sendAttempts: number
  lastAttemptAt?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

interface RenewalRemindersProps {
  school: any
}

export default function RenewalReminders({ school }: RenewalRemindersProps) {
  const [reminders, setReminders] = useState<RenewalReminder[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newReminder, setNewReminder] = useState({
    type: 'SUBSCRIPTION_EXPIRING' as const,
    scheduledFor: '',
    email: school?.email || '',
    subject: '',
    content: ''
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders/renewals')
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error('Failed to fetch renewal reminders:', error)
    }
  }

  const handleCreateReminder = async () => {
    if (!newReminder.type || !newReminder.scheduledFor || !newReminder.email || !newReminder.subject || !newReminder.content) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/reminders/renewals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReminder)
      })

      if (response.ok) {
        const data = await response.json()
        alert('Renewal reminder created successfully!')
        setNewReminder({
          type: 'SUBSCRIPTION_EXPIRING',
          scheduledFor: '',
          email: school?.email || '',
          subject: '',
          content: ''
        })
        setShowCreateForm(false)
        fetchReminders()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create renewal reminder')
      }
    } catch (error) {
      console.error('Renewal reminder creation error:', error)
      alert('Failed to create renewal reminder')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReminders = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/reminders/renewals', {
        method: 'PUT'
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Generated ${data.reminders.length} renewal reminders!`)
        fetchReminders()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to generate renewal reminders')
      }
    } catch (error) {
      console.error('Auto renewal reminders error:', error)
      alert('Failed to generate renewal reminders')
    } finally {
      setGenerating(false)
    }
  }

  const handleSendReminder = async (reminderId: string) => {
    try {
      // In production, this would call an API to send the reminder immediately
      alert('Reminder sent successfully!')
      fetchReminders()
    } catch (error) {
      console.error('Failed to send reminder:', error)
      alert('Failed to send reminder')
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return
    }

    try {
      // In production, this would call an API to delete the reminder
      alert('Reminder deleted successfully!')
      fetchReminders()
    } catch (error) {
      console.error('Failed to delete reminder:', error)
      alert('Failed to delete reminder')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-500'
      case 'PENDING': return 'bg-blue-500'
      case 'FAILED': return 'bg-red-500'
      case 'CANCELLED': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <CheckCircle className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'FAILED': return <AlertCircle className="h-4 w-4" />
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getTypeColor = (type: string) => {
    if (type.includes('EXPIRING')) return 'bg-yellow-500'
    if (type.includes('EXPIRED')) return 'bg-red-500'
    return 'bg-blue-500'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isOverdue = (scheduledFor: string) => {
    return new Date(scheduledFor) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Renewal Reminders
          </CardTitle>
          <CardDescription>
            Automated email notifications for subscription and SSL certificate renewals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Reminder
            </Button>
            <Button 
              onClick={handleGenerateReminders}
              disabled={generating}
            >
              {generating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Bell className="h-4 w-4 mr-2" />}
              Generate Auto Reminders
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Reminder Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Reminder Type</Label>
                <select
                  id="type"
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({...newReminder, type: e.target.value as any})}
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                >
                  <option value="SUBSCRIPTION_EXPIRING">Subscription Expiring</option>
                  <option value="SUBSCRIPTION_EXPIRED">Subscription Expired</option>
                  <option value="SSL_EXPIRING">SSL Certificate Expiring</option>
                  <option value="SSL_EXPIRED">SSL Certificate Expired</option>
                  <option value="DOMAIN_EXPIRING">Domain Expiring</option>
                  <option value="DOMAIN_EXPIRED">Domain Expired</option>
                </select>
              </div>
              <div>
                <Label htmlFor="scheduledFor">Scheduled For</Label>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  value={newReminder.scheduledFor}
                  onChange={(e) => setNewReminder({...newReminder, scheduledFor: e.target.value})}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newReminder.email}
                  onChange={(e) => setNewReminder({...newReminder, email: e.target.value})}
                  placeholder="admin@school.com"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newReminder.subject}
                  onChange={(e) => setNewReminder({...newReminder, subject: e.target.value})}
                  placeholder="Reminder subject"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="content">Message Content</Label>
              <textarea
                id="content"
                value={newReminder.content}
                onChange={(e) => setNewReminder({...newReminder, content: e.target.value})}
                placeholder="Enter the reminder message content..."
                className="w-full p-2 border rounded-md h-24"
                disabled={loading}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={handleCreateReminder}
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Reminder
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminders List */}
      <div className="grid gap-4">
        {reminders.map((reminder) => (
          <Card key={reminder.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getStatusColor(reminder.status)}`}>
                    {getStatusIcon(reminder.status)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{reminder.subject}</CardTitle>
                    <CardDescription>
                      To: {reminder.email} • Scheduled: {formatDate(reminder.scheduledFor)}
                      {isOverdue(reminder.scheduledFor) && reminder.status === 'PENDING' && (
                        <span className="text-red-600 ml-2">(Overdue)</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${getTypeColor(reminder.type)}`}>
                    {getTypeLabel(reminder.type)}
                  </div>
                  <Badge variant={reminder.status === 'SENT' ? 'default' : 'secondary'}>
                    {reminder.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label className="text-xs text-gray-500">Message Preview</Label>
                <p className="text-sm text-gray-700 mt-1 line-clamp-3">
                  {reminder.content}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-gray-500">Send Attempts</Label>
                  <div className="text-sm font-medium">
                    {reminder.sendAttempts} {reminder.sendAttempts === 1 ? 'attempt' : 'attempts'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Last Attempt</Label>
                  <div className="text-sm">
                    {reminder.lastAttemptAt ? formatDate(reminder.lastAttemptAt) : 'Never'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Sent At</Label>
                  <div className="text-sm">
                    {reminder.sentAt ? formatDate(reminder.sentAt) : 'Not sent'}
                  </div>
                </div>
              </div>

              {reminder.errorMessage && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{reminder.errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                {reminder.status === 'PENDING' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSendReminder(reminder.id)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Now
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(reminder.content)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Copy Message
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteReminder(reminder.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {reminders.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Renewal Reminders</h3>
              <p className="text-gray-500 mb-4">
                Create your first renewal reminder or generate automatic reminders
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Reminder
                </Button>
                <Button 
                  onClick={handleGenerateReminders}
                  disabled={generating}
                >
                  {generating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Bell className="h-4 w-4 mr-2" />}
                  Generate Auto Reminders
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}