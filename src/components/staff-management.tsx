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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  User,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
  BookOpen,
  Building
} from 'lucide-react'

interface Staff {
  id: string
  name: string
  designation: string
  department?: string
  subject?: string
  email?: string
  phone?: string
  photo?: string
  bio?: string
  isVisible: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    subject: '',
    email: '',
    phone: '',
    photo: '',
    bio: '',
    isVisible: true
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data)
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        name: formData.name,
        designation: formData.designation,
        department: formData.department,
        subject: formData.subject,
        email: formData.email,
        phone: formData.phone,
        photo: formData.photo,
        bio: formData.bio,
        isVisible: formData.isVisible
      }

      let response
      if (editingStaff) {
        response = await fetch(`/api/staff/${editingStaff.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (response.ok) {
        await fetchStaff()
        resetForm()
        setIsCreateDialogOpen(false)
        setEditingStaff(null)
      } else {
        alert('Failed to save staff member')
      }
    } catch (error) {
      console.error('Failed to save staff member:', error)
      alert('Failed to save staff member')
    }
  }

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStaff(staff.filter(s => s.id !== staffId))
      } else {
        alert('Failed to delete staff member')
      }
    } catch (error) {
      console.error('Failed to delete staff member:', error)
      alert('Failed to delete staff member')
    }
  }

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setFormData({
      name: staffMember.name,
      designation: staffMember.designation,
      department: staffMember.department || '',
      subject: staffMember.subject || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      photo: staffMember.photo || '',
      bio: staffMember.bio || '',
      isVisible: staffMember.isVisible
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      designation: '',
      department: '',
      subject: '',
      email: '',
      phone: '',
      photo: '',
      bio: '',
      isVisible: true
    })
    setEditingStaff(null)
  }

  const moveStaff = async (staffId: string, direction: 'up' | 'down') => {
    const staffIndex = staff.findIndex(s => s.id === staffId)
    if (
      (direction === 'up' && staffIndex === 0) ||
      (direction === 'down' && staffIndex === staff.length - 1)
    ) {
      return
    }

    const newStaff = [...staff]
    const targetIndex = direction === 'up' ? staffIndex - 1 : staffIndex + 1
    
    // Swap staff
    const temp = newStaff[staffIndex]
    newStaff[staffIndex] = newStaff[targetIndex]
    newStaff[targetIndex] = temp
    
    // Update order values
    newStaff.forEach((staffMember, index) => {
      staffMember.order = index + 1
    })

    setStaff(newStaff)
    
    // Update in backend
    try {
      await fetch('/api/staff/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff: newStaff.map(s => ({ id: s.id, order: s.order }))
        })
      })
    } catch (error) {
      console.error('Failed to reorder staff:', error)
    }
  }

  const toggleStaffVisibility = async (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId)
    if (!staffMember) return

    const updatedStaff = { ...staffMember, isVisible: !staffMember.isVisible }
    setStaff(staff.map(s => s.id === staffId ? updatedStaff : s))

    try {
      await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: updatedStaff.isVisible })
      })
    } catch (error) {
      console.error('Failed to update staff:', error)
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
              <Users className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Staff & Faculty Management</h1>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStaff 
                      ? 'Update the staff member details.' 
                      : 'Add a new teacher or staff member to your school directory.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation *</Label>
                      <Input
                        id="designation"
                        value={formData.designation}
                        onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                        placeholder="Principal, Teacher, etc."
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="Science, Arts, etc."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Mathematics, Physics, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="photo">Photo URL</Label>
                    <Input
                      id="photo"
                      value={formData.photo}
                      onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Brief biography or professional summary..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isVisible"
                      checked={formData.isVisible}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                    />
                    <Label htmlFor="isVisible">
                      Visible on website
                    </Label>
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
                      <Save className="h-4 w-4 mr-2" />
                      {editingStaff ? 'Update Staff' : 'Add Staff'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold">{staff.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visible Staff</p>
                  <p className="text-2xl font-bold text-green-600">
                    {staff.filter(s => s.isVisible).length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(staff.map(s => s.department).filter(Boolean)).size}
                  </p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <div className="space-y-4">
          {staff.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members yet</h3>
                <p className="text-gray-500 mb-4">
                  Add your first staff member to start building your school directory.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Staff Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            staff.map((staffMember, index) => (
              <Card key={staffMember.id} className={`${!staffMember.isVisible ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {staffMember.photo ? (
                        <img 
                          src={staffMember.photo} 
                          alt={staffMember.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <CardTitle className="text-lg">{staffMember.name}</CardTitle>
                          {!staffMember.isVisible && (
                            <Badge variant="secondary">Hidden</Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm font-medium text-gray-700 mb-1">
                          {staffMember.designation}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          {staffMember.department && (
                            <span className="flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {staffMember.department}
                            </span>
                          )}
                          {staffMember.subject && (
                            <span className="flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {staffMember.subject}
                            </span>
                          )}
                          {staffMember.email && (
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {staffMember.email}
                            </span>
                          )}
                          {staffMember.phone && (
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {staffMember.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStaff(staffMember.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStaff(staffMember.id, 'down')}
                        disabled={index === staff.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStaffVisibility(staffMember.id)}
                      >
                        {staffMember.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(staffMember)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(staffMember.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {staffMember.bio && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm">{staffMember.bio}</p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}