'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Edit, 
  Save, 
  X, 
  Plus,
  Layout,
  Type,
  Image,
  Settings,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'

interface WebsiteSection {
  id: string
  type: string
  title: string
  content?: string
  imageUrl?: string
  order: number
  isVisible: boolean
}

interface School {
  id: string
  name: string
  subdomain: string
  primaryColor: string
  secondaryColor: string
  template: string
  status: string
}

export default function WebsiteBuilder() {
  const [sections, setSections] = useState<WebsiteSection[]>([])
  const [school, setSchool] = useState<School | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'settings'>('builder')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSchoolData()
  }, [])

  const fetchSchoolData = async () => {
    try {
      // Fetch school and sections data
      const [schoolResponse, sectionsResponse] = await Promise.all([
        fetch('/api/school'),
        fetch('/api/sections')
      ])

      if (schoolResponse.ok && sectionsResponse.ok) {
        const schoolData = await schoolResponse.json()
        const sectionsData = await sectionsResponse.json()
        
        setSchool(schoolData)
        setSections(sectionsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const moveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId)
    if (
      (direction === 'up' && sectionIndex === 0) ||
      (direction === 'down' && sectionIndex === sections.length - 1)
    ) {
      return
    }

    const newSections = [...sections]
    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1
    
    // Swap sections
    const temp = newSections[sectionIndex]
    newSections[sectionIndex] = newSections[targetIndex]
    newSections[targetIndex] = temp
    
    // Update order values
    newSections.forEach((section, index) => {
      section.order = index + 1
    })

    setSections(newSections)
    
    // Update in backend
    try {
      await fetch('/api/sections/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: newSections.map(s => ({ id: s.id, order: s.order }))
        })
      })
    } catch (error) {
      console.error('Failed to reorder sections:', error)
    }
  }

  const toggleSectionVisibility = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const updatedSection = { ...section, isVisible: !section.isVisible }
    setSections(sections.map(s => s.id === sectionId ? updatedSection : s))

    try {
      await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: updatedSection.isVisible })
      })
    } catch (error) {
      console.error('Failed to update section:', error)
    }
  }

  const updateSection = async (sectionId: string, updates: Partial<WebsiteSection>) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s))

    try {
      await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
    } catch (error) {
      console.error('Failed to update section:', error)
    }
  }

  const addNewSection = async (type: string) => {
    const newSection: WebsiteSection = {
      id: `temp-${Date.now()}`,
      type,
      title: `New ${type} Section`,
      order: sections.length + 1,
      isVisible: true
    }

    setSections([...sections, newSection])

    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSection)
      })

      if (response.ok) {
        const createdSection = await response.json()
        setSections(sections.map(s => s.id === newSection.id ? createdSection : s))
      }
    } catch (error) {
      console.error('Failed to add section:', error)
    }
  }

  const publishWebsite = async () => {
    if (!school) return

    try {
      const response = await fetch('/api/school/publish', {
        method: 'PUT'
      })

      if (response.ok) {
        setSchool({ ...school, status: 'PUBLISHED' })
        alert('Website published successfully!')
      }
    } catch (error) {
      console.error('Failed to publish website:', error)
      alert('Failed to publish website')
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
              <h1 className="text-xl font-semibold">Website Builder</h1>
              {school && (
                <Badge variant={school.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {school.status}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 border rounded-lg p-1">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <Button variant="outline" onClick={() => setActiveTab('settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button onClick={publishWebsite}>
                <Globe className="h-4 w-4 mr-2" />
                Publish Website
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Builder Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Section</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['HERO', 'ABOUT', 'ACADEMICS', 'FACILITIES', 'GALLERY', 'STAFF', 'ACHIEVEMENTS', 'CONTACT'].map(type => (
                  <Button
                    key={type}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addNewSection(type)}
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Sections List */}
            <Card>
              <CardHeader>
                <CardTitle>Website Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sections.map((section, index) => (
                  <div key={section.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Layout className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">{section.title}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={index === sections.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSectionVisibility(section.id)}
                        >
                          {section.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingSection === section.id && (
                      <div className="space-y-3 pt-2 border-t">
                        <div>
                          <Label htmlFor={`title-${section.id}`}>Title</Label>
                          <Input
                            id={`title-${section.id}`}
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`content-${section.id}`}>Content</Label>
                          <Textarea
                            id={`content-${section.id}`}
                            value={section.content || ''}
                            onChange={(e) => updateSection(section.id, { content: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`image-${section.id}`}>Image URL</Label>
                          <Input
                            id={`image-${section.id}`}
                            value={section.imageUrl || ''}
                            onChange={(e) => updateSection(section.id, { imageUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`border rounded-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-md mx-auto' : ''}`}>
                  {/* Preview Content */}
                  <div className="bg-white min-h-screen">
                    {school && (
                      <header className="bg-blue-600 text-white p-6">
                        <h1 className="text-2xl font-bold">{school.name}</h1>
                        <p className="text-blue-100">Excellence in Education</p>
                      </header>
                    )}
                    
                    <main className="p-6 space-y-12">
                      {sections.filter(s => s.isVisible).map(section => (
                        <section key={section.id} className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                          {section.imageUrl && (
                            <img 
                              src={section.imageUrl} 
                              alt={section.title}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          )}
                          {section.content && (
                            <div className="prose max-w-none">
                              <p className="text-gray-600 whitespace-pre-wrap">{section.content}</p>
                            </div>
                          )}
                        </section>
                      ))}
                    </main>
                    
                    {school && (
                      <footer className="bg-gray-100 p-6 text-center text-gray-600">
                        <p>&copy; 2024 {school.name}. All rights reserved.</p>
                        <p className="text-sm mt-2">Powered by VidyaWebBuilder</p>
                      </footer>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}