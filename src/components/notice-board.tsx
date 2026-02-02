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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon,
  AlertTriangle,
  Megaphone,
  Eye,
  EyeOff,
  Save,
  X,
  Bell
} from 'lucide-react'
import { format } from 'date-fns'

interface Notice {
  id: string
  title: string
  content: string
  isImportant: boolean
  expiryDate?: string
  createdAt: string
  updatedAt: string
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isImportant: false,
    expiryDate: undefined as Date | undefined
  })

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices')
      if (response.ok) {
        const data = await response.json()
        setNotices(data)
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        isImportant: formData.isImportant,
        expiryDate: formData.expiryDate?.toISOString()
      }

      let response
      if (editingNotice) {
        response = await fetch(`/api/notices/${editingNotice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('/api/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (response.ok) {
        await fetchNotices()
        resetForm()
        setIsCreateDialogOpen(false)
        setEditingNotice(null)
      } else {
        alert('Failed to save notice')
      }
    } catch (error) {
      console.error('Failed to save notice:', error)
      alert('Failed to save notice')
    }
  }

  const handleDelete = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) {
      return
    }

    try {
      const response = await fetch(`/api/notices/${noticeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotices(notices.filter(n => n.id !== noticeId))
      } else {
        alert('Failed to delete notice')
      }
    } catch (error) {
      console.error('Failed to delete notice:', error)
      alert('Failed to delete notice')
    }
  }

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice)
    setFormData({
      title: notice.title,
      content: notice.content,
      isImportant: notice.isImportant,
      expiryDate: notice.expiryDate ? new Date(notice.expiryDate) : undefined
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      isImportant: false,
      expiryDate: undefined
    })
    setEditingNotice(null)
  }

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
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
              <Megaphone className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Digital Notice Board</h1>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Notice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingNotice ? 'Edit Notice' : 'Create New Notice'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingNotice 
                      ? 'Update the notice details below.' 
                      : 'Fill in the details to create a new notice.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Notice Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter notice title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Notice Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter detailed notice content"
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="important"
                      checked={formData.isImportant}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isImportant: checked }))}
                    />
                    <Label htmlFor="important" className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>Mark as Important Notice</span>
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Expiry Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.expiryDate ? (
                            format(formData.expiryDate, "PPP")
                          ) : (
                            "Pick a date"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.expiryDate}
                          onSelect={(date) => setFormData(prev => ({ ...prev, expiryDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                      {editingNotice ? 'Update Notice' : 'Create Notice'}
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
                  <p className="text-sm font-medium text-gray-600">Total Notices</p>
                  <p className="text-2xl font-bold">{notices.length}</p>
                </div>
                <Megaphone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Important Notices</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {notices.filter(n => n.isImportant).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired Notices</p>
                  <p className="text-2xl font-bold text-red-600">
                    {notices.filter(n => isExpired(n.expiryDate)).length}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notices List */}
        <div className="space-y-4">
          {notices.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notices yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first notice to start communicating with students and parents.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Notice
                </Button>
              </CardContent>
            </Card>
          ) : (
            notices.map((notice) => (
              <Card 
                key={notice.id} 
                className={`${
                  isExpired(notice.expiryDate) 
                    ? 'border-red-200 bg-red-50' 
                    : notice.isImportant 
                    ? 'border-orange-200 bg-orange-50' 
                    : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{notice.title}</CardTitle>
                        {notice.isImportant && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Important
                          </Badge>
                        )}
                        {isExpired(notice.expiryDate) && (
                          <Badge variant="secondary" className="text-xs">
                            <X className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        Posted on {format(new Date(notice.createdAt), 'PPP')}
                        {notice.expiryDate && (
                          <span className="ml-4">
                            Expires on {format(new Date(notice.expiryDate), 'PPP')}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(notice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notice.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}