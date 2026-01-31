'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Edit, 
  Trash2, 
  GraduationCap,
  Users,
  FileText,
  Download,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface Admission {
  id: string
  session: string
  isOpen: boolean
  instructions?: string
  eligibility?: string
  createdAt: string
  updatedAt: string
  _count: {
    enquiries: number
  }
}

interface AdmissionEnquiry {
  id: string
  studentName: string
  parentName: string
  phone: string
  email?: string
  grade?: string
  message?: string
  status: 'PENDING' | 'CONTACTED' | 'CONVERTED' | 'CLOSED'
  createdAt: string
  admission: {
    session: string
  }
}

export default function AdmissionManagement() {
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAdmission, setEditingAdmission] = useState<Admission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    session: '',
    isOpen: true,
    instructions: '',
    eligibility: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [admissionsResponse, enquiriesResponse] = await Promise.all([
        fetch('/api/admissions'),
        fetch('/api/admissions/enquiries')
      ])

      if (admissionsResponse.ok && enquiriesResponse.ok) {
        const admissionsData = await admissionsResponse.json()
        const enquiriesData = await enquiriesResponse.json()
        
        setAdmissions(admissionsData)
        setEnquiries(enquiriesData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        session: formData.session,
        isOpen: formData.isOpen,
        instructions: formData.instructions,
        eligibility: formData.eligibility
      }

      let response
      if (editingAdmission) {
        response = await fetch(`/api/admissions/${editingAdmission.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('/api/admissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (response.ok) {
        await fetchData()
        resetForm()
        setIsCreateDialogOpen(false)
        setEditingAdmission(null)
      } else {
        alert('Failed to save admission settings')
      }
    } catch (error) {
      console.error('Failed to save admission settings:', error)
      alert('Failed to save admission settings')
    }
  }

  const handleDelete = async (admissionId: string) => {
    if (!confirm('Are you sure you want to delete this admission session?')) {
      return
    }

    try {
      const response = await fetch(`/api/admissions/${admissionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAdmissions(admissions.filter(a => a.id !== admissionId))
      } else {
        alert('Failed to delete admission session')
      }
    } catch (error) {
      console.error('Failed to delete admission session:', error)
      alert('Failed to delete admission session')
    }
  }

  const handleEdit = (admission: Admission) => {
    setEditingAdmission(admission)
    setFormData({
      session: admission.session,
      isOpen: admission.isOpen,
      instructions: admission.instructions || '',
      eligibility: admission.eligibility || ''
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      session: '',
      isOpen: true,
      instructions: '',
      eligibility: ''
    })
    setEditingAdmission(null)
  }

  const updateEnquiryStatus = async (enquiryId: string, status: string) => {
    try {
      const response = await fetch(`/api/admissions/enquiries/${enquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setEnquiries(enquiries.map(e => 
          e.id === enquiryId ? { ...e, status: status as any } : e
        ))
      } else {
        alert('Failed to update enquiry status')
      }
    } catch (error) {
      console.error('Failed to update enquiry status:', error)
      alert('Failed to update enquiry status')
    }
  }

  const exportEnquiries = async () => {
    try {
      const response = await fetch('/api/admissions/enquiries/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'admission-enquiries.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to export enquiries:', error)
      alert('Failed to export enquiries')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONTACTED': return 'bg-blue-100 text-blue-800'
      case 'CONVERTED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />
      case 'CONTACTED': return <Mail className="h-3 w-3" />
      case 'CONVERTED': return <CheckCircle className="h-3 w-3" />
      case 'CLOSED': return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.history.back()}>
                ← Back
              </Button>
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Admission Management</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={exportEnquiries}>
                <Download className="h-4 w-4 mr-2" />
                Export Enquiries
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAdmission ? 'Edit Admission Session' : 'Create New Admission Session'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAdmission 
                        ? 'Update the admission session details.' 
                        : 'Create a new admission session to start collecting enquiries.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="session">Academic Session *</Label>
                      <Input
                        id="session"
                        value={formData.session}
                        onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value }))}
                        placeholder="e.g., 2024-2025"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isOpen"
                        checked={formData.isOpen}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOpen: checked }))}
                      />
                      <Label htmlFor="isOpen">
                        Admissions are currently open
                      </Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="eligibility">Eligibility Criteria</Label>
                      <Textarea
                        id="eligibility"
                        value={formData.eligibility}
                        onChange={(e) => setFormData(prev => ({ ...prev, eligibility: e.target.value }))}
                        placeholder="Enter eligibility requirements..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="instructions">Admission Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={formData.instructions}
                        onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Enter admission process instructions..."
                        rows={6}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsCreateDialogOpen(false)
                          resetForm()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingAdmission ? 'Update Session' : 'Create Session'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sessions">Admission Sessions</TabsTrigger>
            <TabsTrigger value="enquiries">Student Enquiries ({enquiries.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold">{admissions.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Open Sessions</p>
                      <p className="text-2xl font-bold text-green-600">
                        {admissions.filter(a => a.isOpen).length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {admissions.reduce((sum, a) => sum + a._count.enquiries, 0)}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              {admissions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No admission sessions yet</h3>
                    <p className="text-gray-500 mb-4">
                      Create your first admission session to start collecting student enquiries.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Session
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                admissions.map((admission) => (
                  <Card key={admission.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg">{admission.session}</CardTitle>
                            <Badge variant={admission.isOpen ? 'default' : 'secondary'}>
                              {admission.isOpen ? 'Open' : 'Closed'}
                            </Badge>
                            <Badge variant="outline">
                              {admission._count.enquiries} enquiries
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            Created on {format(new Date(admission.createdAt), 'PPP')}
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(admission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(admission.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {(admission.eligibility || admission.instructions) && (
                      <CardContent className="pt-0">
                        {admission.eligibility && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Eligibility Criteria</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{admission.eligibility}</p>
                          </div>
                        )}
                        {admission.instructions && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Admission Instructions</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{admission.instructions}</p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="enquiries" className="space-y-6">
            <div className="space-y-4">
              {enquiries.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No admission enquiries yet</h3>
                    <p className="text-gray-500">
                      Student enquiries will appear here once parents submit admission forms.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                enquiries.map((enquiry) => (
                  <Card key={enquiry.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg">{enquiry.studentName}</CardTitle>
                            <Badge className={getStatusColor(enquiry.status)}>
                              {getStatusIcon(enquiry.status)}
                              <span className="ml-1">{enquiry.status}</span>
                            </Badge>
                          </div>
                          <CardDescription className="text-sm space-y-1">
                            <div>Parent: {enquiry.parentName}</div>
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {enquiry.phone}
                              </span>
                              {enquiry.email && (
                                <span className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {enquiry.email}
                                </span>
                              )}
                            </div>
                            <div>
                              Session: {enquiry.admission.session} • 
                              Applied on {format(new Date(enquiry.createdAt), 'PPP')}
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {enquiry.grade && (
                        <div className="mb-2">
                          <span className="font-medium">Grade:</span> {enquiry.grade}
                        </div>
                      )}
                      {enquiry.message && (
                        <div className="mb-4">
                          <span className="font-medium">Message:</span>
                          <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{enquiry.message}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Update Status:</span>
                        <select
                          value={enquiry.status}
                          onChange={(e) => updateEnquiryStatus(enquiry.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="CONVERTED">Converted</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}