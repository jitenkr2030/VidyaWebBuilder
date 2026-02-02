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
  BookOpen,
  FileText,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Globe,
  Settings,
  Upload
} from 'lucide-react'

interface Page {
  id: string
  title: string
  slug: string
  content?: string
  metaTitle?: string
  metaDesc?: string
  isVisible: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function AcademicsManagement() {
  const [pages, setPages] = useState<Page[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDesc: '',
    isVisible: true
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages')
      if (response.ok) {
        const data = await response.json()
        setPages(data)
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        content: formData.content,
        metaTitle: formData.metaTitle,
        metaDesc: formData.metaDesc,
        isVisible: formData.isVisible
      }

      let response
      if (editingPage) {
        response = await fetch(`/api/pages/${editingPage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (response.ok) {
        await fetchPages()
        resetForm()
        setIsCreateDialogOpen(false)
        setEditingPage(null)
      } else {
        alert('Failed to save page')
      }
    } catch (error) {
      console.error('Failed to save page:', error)
      alert('Failed to save page')
    }
  }

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) {
      return
    }

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPages(pages.filter(p => p.id !== pageId))
      } else {
        alert('Failed to delete page')
      }
    } catch (error) {
      console.error('Failed to delete page:', error)
      alert('Failed to delete page')
    }
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      metaTitle: page.metaTitle || '',
      metaDesc: page.metaDesc || '',
      isVisible: page.isVisible
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDesc: '',
      isVisible: true
    })
    setEditingPage(null)
  }

  const movePage = async (pageId: string, direction: 'up' | 'down') => {
    const pageIndex = pages.findIndex(p => p.id === pageId)
    if (
      (direction === 'up' && pageIndex === 0) ||
      (direction === 'down' && pageIndex === pages.length - 1)
    ) {
      return
    }

    const newPages = [...pages]
    const targetIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1
    
    // Swap pages
    const temp = newPages[pageIndex]
    newPages[pageIndex] = newPages[targetIndex]
    newPages[targetIndex] = temp
    
    // Update order values
    newPages.forEach((page, index) => {
      page.order = index + 1
    })

    setPages(newPages)
    
    // Update in backend
    try {
      await fetch('/api/pages/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: newPages.map(p => ({ id: p.id, order: p.order }))
        })
      })
    } catch (error) {
      console.error('Failed to reorder pages:', error)
    }
  }

  const togglePageVisibility = async (pageId: string) => {
    const page = pages.find(p => p.id === pageId)
    if (!page) return

    const updatedPage = { ...page, isVisible: !page.isVisible }
    setPages(pages.map(p => p.id === pageId ? updatedPage : p))

    try {
      await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: updatedPage.isVisible })
      })
    } catch (error) {
      console.error('Failed to update page:', error)
    }
  }

  const createDefaultPages = async () => {
    const defaultPages = [
      {
        title: 'Academics',
        slug: 'academics',
        content: '# Academics\n\nOur school offers a comprehensive academic program designed to foster intellectual growth and critical thinking skills.',
        metaTitle: 'Academics - Our School',
        metaDesc: 'Learn about our academic programs, curriculum, and educational approach.'
      },
      {
        title: 'Rules & Regulations',
        slug: 'rules',
        content: '# School Rules & Regulations\n\n## General Rules\n- Students must arrive on time for all classes\n- Proper school uniform must be worn at all times\n- Respect for teachers and fellow students is essential\n\n## Attendance\n- Minimum 75% attendance is required\n- Leave applications must be submitted in advance',
        metaTitle: 'School Rules & Regulations',
        metaDesc: 'Important school rules, regulations, and guidelines for students and parents.'
      },
      {
        title: 'Facilities',
        slug: 'facilities',
        content: '# School Facilities\n\n## Infrastructure\n- Spacious classrooms with modern teaching aids\n- Well-equipped science laboratories\n- Computer lab with internet access\n- Library with thousands of books\n\n## Sports Facilities\n- Large playground for outdoor sports\n- Indoor sports hall\n- Separate courts for basketball and volleyball',
        metaTitle: 'School Facilities & Infrastructure',
        metaDesc: 'Explore our world-class facilities including classrooms, labs, library, and sports infrastructure.'
      }
    ]

    try {
      for (const pageData of defaultPages) {
        await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageData)
        })
      }
      await fetchPages()
    } catch (error) {
      console.error('Failed to create default pages:', error)
      alert('Failed to create default pages')
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
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Academics & Information Pages</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {pages.length === 0 && (
                <Button variant="outline" onClick={createDefaultPages}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Default Pages
                </Button>
              )}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPage ? 'Edit Page' : 'Create New Page'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPage 
                        ? 'Update the page content and settings.' 
                        : 'Create a new information page for academics, rules, facilities, etc.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Page Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            title: e.target.value,
                            slug: prev.slug || generateSlug(e.target.value)
                          }))}
                          placeholder="e.g., Academics"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug *</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="academics"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Page Content (Markdown supported)</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="# Page Title\n\nWrite your page content here. You can use **markdown** for formatting."
                        rows={10}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="metaTitle">SEO Title</Label>
                        <Input
                          id="metaTitle"
                          value={formData.metaTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                          placeholder="SEO title (optional)"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="metaDesc">SEO Description</Label>
                        <Input
                          id="metaDesc"
                          value={formData.metaDesc}
                          onChange={(e) => setFormData(prev => ({ ...prev, metaDesc: e.target.value }))}
                          placeholder="SEO description (optional)"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isVisible"
                        checked={formData.isVisible}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                      />
                      <Label htmlFor="isVisible">
                        Page is visible on website
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
                        {editingPage ? 'Update Page' : 'Create Page'}
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pages</p>
                  <p className="text-2xl font-bold">{pages.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published Pages</p>
                  <p className="text-2xl font-bold text-green-600">
                    {pages.filter(p => p.isVisible).length}
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
                  <p className="text-sm font-medium text-gray-600">Draft Pages</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {pages.filter(p => !p.isVisible).length}
                  </p>
                </div>
                <EyeOff className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pages List */}
        <div className="space-y-4">
          {pages.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pages yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first information page or start with our default pages.
                </p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" onClick={createDefaultPages}>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Default Pages
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            pages.map((page, index) => (
              <Card key={page.id} className={`${!page.isVisible ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{page.title}</CardTitle>
                        <Badge variant="outline">
                          /{page.slug}
                        </Badge>
                        {!page.isVisible && (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {page.metaDesc || 'No meta description provided'}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => movePage(page.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => movePage(page.id, 'down')}
                        disabled={index === pages.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePageVisibility(page.id)}
                      >
                        {page.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(page)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {page.content && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {page.content.replace(/[#*`]/g, '').substring(0, 200)}...
                    </p>
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