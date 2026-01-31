'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  ExternalLink,
  User,
  Building,
  Globe
} from "lucide-react"

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED'
  createdAt: string
}

interface ContactSettings {
  email: string
  phone: string
  address: string
  whatsapp: string
  googleMapsUrl: string
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
}

const mockMessages: ContactMessage[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    phone: "+91 98765 43210",
    subject: "Admission Enquiry for Class 1",
    message: "I would like to inquire about the admission process for my child for Class 1 for the upcoming academic year. Please provide details about the admission criteria and fee structure.",
    status: "NEW",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    subject: "Fee Structure Details",
    message: "Can you please provide the detailed fee structure for Class 5? Also, are there any scholarships available for meritorious students?",
    status: "READ",
    createdAt: "2024-01-14T15:45:00Z"
  },
  {
    id: "3",
    name: "Amit Patel",
    email: "amit.patel@example.com",
    phone: "+91 87654 32109",
    subject: "School Visit Request",
    message: "We are planning to move to your area and would like to visit the school campus. Please let us know the visiting hours and procedure.",
    status: "REPLIED",
    createdAt: "2024-01-13T09:15:00Z"
  }
]

const mockSettings: ContactSettings = {
  email: "info@vidyawebbuilder.edu.in",
  phone: "+91 11 2345 6789",
  address: "123 Education Street, New Delhi - 110001, India",
  whatsapp: "+91 98765 43210",
  googleMapsUrl: "https://maps.google.com/?q=School+Location",
  facebookUrl: "https://facebook.com/school",
  twitterUrl: "https://twitter.com/school",
  instagramUrl: "https://instagram.com/school"
}

const statusColors = {
  NEW: "bg-red-100 text-red-800",
  READ: "bg-blue-100 text-blue-800", 
  REPLIED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800"
}

const statusIcons = {
  NEW: AlertCircle,
  READ: MessageSquare,
  REPLIED: CheckCircle,
  CLOSED: CheckCircle
}

export default function ContactManagement() {
  const [messages, setMessages] = useState<ContactMessage[]>(mockMessages)
  const [settings, setSettings] = useState<ContactSettings>(mockSettings)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [activeTab, setActiveTab] = useState<'messages' | 'settings' | 'embed'>('messages')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const handleStatusUpdate = async (messageId: string, newStatus: ContactMessage['status']) => {
    setUpdatingStatus(messageId)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: newStatus } : msg
      ))
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleSettingsUpdate = async (field: keyof ContactSettings, value: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSettings(prev => ({ ...prev, [field]: value }))
      alert('Settings updated successfully!')
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Failed to update settings')
    }
  }

  const getEmbedCode = () => {
    return `<!-- VidyaWebBuilder Contact Form -->
<iframe 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/contact-embed" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
</iframe>`
  }

  const filteredMessages = messages.filter(msg => msg.status !== 'CLOSED')
  const messageCount = messages.length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              Contact & Communication
            </h1>
            <p className="text-gray-600 mt-2">
              Manage contact messages and communication settings
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm">
              {messageCount} Total Messages
            </Badge>
            <Badge variant="outline" className="text-sm">
              {messages.filter(m => m.status === 'NEW').length} New
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'settings', label: 'Contact Settings', icon: Settings },
            { id: 'embed', label: 'Embed Form', icon: Globe }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Messages</CardTitle>
                  <CardDescription>
                    Manage and respond to parent and student enquiries
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages</h3>
                      <p className="text-gray-500">
                        No contact messages received yet.
                      </p>
                    </div>
                  ) : (
                    filteredMessages.map(message => {
                      const StatusIcon = statusIcons[message.status]
                      return (
                        <Card 
                          key={message.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => setSelectedMessage(message)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{message.name}</h4>
                                  <Badge className={statusColors[message.status]}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {message.status}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium text-blue-600 mb-1">{message.subject}</p>
                                <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {message.email}
                                  </span>
                                  {message.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {message.phone}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(message.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Message Details */}
            <div className="space-y-4">
              {selectedMessage ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Message Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">From</Label>
                      <p className="font-semibold">{selectedMessage.name}</p>
                      <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                      {selectedMessage.phone && (
                        <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <p className="font-medium">{selectedMessage.subject}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Message</Label>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Received</Label>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Select 
                        value={selectedMessage.status} 
                        onValueChange={(value) => handleStatusUpdate(selectedMessage.id, value as any)}
                        disabled={updatingStatus === selectedMessage.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="READ">Read</SelectItem>
                          <SelectItem value="REPLIED">Replied</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Mail className="h-4 w-4 mr-2" />
                        Reply via Email
                      </Button>
                      {selectedMessage.phone && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Message</h3>
                    <p className="text-gray-500">
                      Click on a message to view details and take action.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Update your school's contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    onBlur={() => handleSettingsUpdate('email', settings.email)}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    onBlur={() => handleSettingsUpdate('phone', settings.phone)}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsapp}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                    onBlur={() => handleSettingsUpdate('whatsapp', settings.whatsapp)}
                  />
                </div>

                <div>
                  <Label htmlFor="address">School Address</Label>
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    onBlur={() => handleSettingsUpdate('address', settings.address)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="maps">Google Maps URL</Label>
                  <Input
                    id="maps"
                    value={settings.googleMapsUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                    onBlur={() => handleSettingsUpdate('googleMapsUrl', settings.googleMapsUrl)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media Links
                </CardTitle>
                <CardDescription>
                  Connect your social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    value={settings.facebookUrl || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
                    onBlur={() => handleSettingsUpdate('facebookUrl', settings.facebookUrl || '')}
                    placeholder="https://facebook.com/your-school"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input
                    id="twitter"
                    value={settings.twitterUrl || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, twitterUrl: e.target.value }))}
                    onBlur={() => handleSettingsUpdate('twitterUrl', settings.twitterUrl || '')}
                    placeholder="https://twitter.com/your-school"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    value={settings.instagramUrl || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    onBlur={() => handleSettingsUpdate('instagramUrl', settings.instagramUrl || '')}
                    placeholder="https://instagram.com/your-school"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={settings.linkedinUrl || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    onBlur={() => handleSettingsUpdate('linkedinUrl', settings.linkedinUrl || '')}
                    placeholder="https://linkedin.com/school/your-school"
                  />
                </div>

                <div className="pt-4">
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save All Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'embed' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Embed Contact Form
                </CardTitle>
                <CardDescription>
                  Add this contact form to any website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="embed-code">Embed Code</Label>
                  <Textarea
                    id="embed-code"
                    value={getEmbedCode()}
                    readOnly
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <Button 
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(getEmbedCode())
                    alert('Embed code copied to clipboard!')
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Embed Code
                </Button>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Copy the embed code above</li>
                    <li>Paste it into your website's HTML</li>
                    <li>The contact form will appear automatically</li>
                    <li>All messages will appear in your dashboard</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  This is how your contact form will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <div className="h-10 bg-gray-100 rounded-md"></div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <div className="h-10 bg-gray-100 rounded-md"></div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone (Optional)</Label>
                      <div className="h-10 bg-gray-100 rounded-md"></div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <div className="h-10 bg-gray-100 rounded-md"></div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Message</Label>
                      <div className="h-24 bg-gray-100 rounded-md"></div>
                    </div>
                    <Button className="w-full" disabled>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}