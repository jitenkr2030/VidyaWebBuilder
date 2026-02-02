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
  Image as ImageIcon,
  Upload,
  Calendar,
  Eye,
  EyeOff,
  Save,
  X,
  Camera,
  Grid,
  List,
  ArrowUp,
  ArrowDown,
  Download
} from 'lucide-react'
import { format } from 'date-fns'

interface Gallery {
  id: string
  title: string
  description?: string
  eventDate?: string
  order: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
  _count: {
    images: number
  }
}

interface GalleryImage {
  id: string
  url: string
  caption?: string
  order: number
  createdAt: string
}

export default function PhotoGallery() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: undefined as Date | undefined,
    isVisible: true
  })
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadCaption, setUploadCaption] = useState('')

  useEffect(() => {
    fetchGalleries()
  }, [])

  useEffect(() => {
    if (selectedGallery) {
      fetchGalleryImages(selectedGallery.id)
    }
  }, [selectedGallery])

  const fetchGalleries = async () => {
    try {
      const response = await fetch('/api/galleries')
      if (response.ok) {
        const data = await response.json()
        setGalleries(data)
      }
    } catch (error) {
      console.error('Failed to fetch galleries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGalleryImages = async (galleryId: string) => {
    try {
      const response = await fetch(`/api/galleries/${galleryId}/images`)
      if (response.ok) {
        const data = await response.json()
        setGalleryImages(data)
      }
    } catch (error) {
      console.error('Failed to fetch gallery images:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        eventDate: formData.eventDate?.toISOString(),
        isVisible: formData.isVisible
      }

      let response
      if (editingGallery) {
        response = await fetch(`/api/galleries/${editingGallery.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('/api/galleries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (response.ok) {
        await fetchGalleries()
        resetForm()
        setIsCreateDialogOpen(false)
        setEditingGallery(null)
      } else {
        alert('Failed to save gallery')
      }
    } catch (error) {
      console.error('Failed to save gallery:', error)
      alert('Failed to save gallery')
    }
  }

  const handleDelete = async (galleryId: string) => {
    if (!confirm('Are you sure you want to delete this gallery and all its images?')) {
      return
    }

    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGalleries(galleries.filter(g => g.id !== galleryId))
        if (selectedGallery?.id === galleryId) {
          setSelectedGallery(null)
          setGalleryImages([])
        }
      } else {
        alert('Failed to delete gallery')
      }
    } catch (error) {
      console.error('Failed to delete gallery:', error)
      alert('Failed to delete gallery')
    }
  }

  const handleEdit = (gallery: Gallery) => {
    setEditingGallery(gallery)
    setFormData({
      title: gallery.title,
      description: gallery.description || '',
      eventDate: gallery.eventDate ? new Date(gallery.eventDate) : undefined,
      isVisible: gallery.isVisible
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: undefined,
      isVisible: true
    })
    setEditingGallery(null)
  }

  const handleImageUpload = async () => {
    if (!uploadUrl || !selectedGallery) return

    try {
      const response = await fetch(`/api/galleries/${selectedGallery.id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadUrl,
          caption: uploadCaption
        })
      })

      if (response.ok) {
        await fetchGalleryImages(selectedGallery.id)
        setUploadUrl('')
        setUploadCaption('')
      } else {
        alert('Failed to add image')
      }
    } catch (error) {
      console.error('Failed to add image:', error)
      alert('Failed to add image')
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return
    }

    try {
      const response = await fetch(`/api/galleries/images/${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGalleryImages(galleryImages.filter(img => img.id !== imageId))
      } else {
        alert('Failed to delete image')
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
      alert('Failed to delete image')
    }
  }

  const moveGallery = async (galleryId: string, direction: 'up' | 'down') => {
    const galleryIndex = galleries.findIndex(g => g.id === galleryId)
    if (
      (direction === 'up' && galleryIndex === 0) ||
      (direction === 'down' && galleryIndex === galleries.length - 1)
    ) {
      return
    }

    const newGalleries = [...galleries]
    const targetIndex = direction === 'up' ? galleryIndex - 1 : galleryIndex + 1
    
    // Swap galleries
    const temp = newGalleries[galleryIndex]
    newGalleries[galleryIndex] = newGalleries[targetIndex]
    newGalleries[targetIndex] = temp
    
    // Update order values
    newGalleries.forEach((gallery, index) => {
      gallery.order = index + 1
    })

    setGalleries(newGalleries)
    
    // Update in backend
    try {
      await fetch('/api/galleries/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleries: newGalleries.map(g => ({ id: g.id, order: g.order }))
        })
      })
    } catch (error) {
      console.error('Failed to reorder galleries:', error)
    }
  }

  const toggleGalleryVisibility = async (galleryId: string) => {
    const gallery = galleries.find(g => g.id === galleryId)
    if (!gallery) return

    const updatedGallery = { ...gallery, isVisible: !gallery.isVisible }
    setGalleries(galleries.map(g => g.id === galleryId ? updatedGallery : g))

    try {
      await fetch(`/api/galleries/${galleryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: updatedGallery.isVisible })
      })
    } catch (error) {
      console.error('Failed to update gallery:', error)
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
              <Camera className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Photo Gallery & Events</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Gallery
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingGallery ? 'Edit Gallery' : 'Create New Gallery'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingGallery 
                        ? 'Update the gallery details.' 
                        : 'Create a new photo gallery for school events and activities.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Gallery Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Annual Day 2024"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the event or activity..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Event Date</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate ? format(formData.eventDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          eventDate: e.target.value ? new Date(e.target.value) : undefined 
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isVisible"
                        checked={formData.isVisible}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                      />
                      <Label htmlFor="isVisible">
                        Gallery is visible on website
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
                        {editingGallery ? 'Update Gallery' : 'Create Gallery'}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Galleries List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Galleries</p>
                      <p className="text-2xl font-bold">{galleries.length}</p>
                    </div>
                    <Camera className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Photos</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {galleries.reduce((sum, g) => sum + g._count.images, 0)}
                      </p>
                    </div>
                    <ImageIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Galleries */}
            <div className="space-y-4">
              {galleries.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No galleries yet</h3>
                    <p className="text-gray-500 mb-4">
                      Create your first gallery to start showcasing school events.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Gallery
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                galleries.map((gallery, index) => (
                  <Card 
                    key={gallery.id} 
                    className={`cursor-pointer transition-all ${
                      selectedGallery?.id === gallery.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-lg'
                    } ${!gallery.isVisible ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedGallery(gallery)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-sm">{gallery.title}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {gallery._count.images} photos
                            </Badge>
                          </div>
                          {gallery.eventDate && (
                            <CardDescription className="text-xs">
                              {format(new Date(gallery.eventDate), 'PPP')}
                            </CardDescription>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveGallery(gallery.id, 'up')
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveGallery(gallery.id, 'down')
                            }}
                            disabled={index === galleries.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleGalleryVisibility(gallery.id)
                            }}
                          >
                            {gallery.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(gallery)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(gallery.id)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {gallery.description && (
                      <CardContent className="pt-0">
                        <p className="text-xs text-gray-600 line-clamp-2">{gallery.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Gallery Images */}
          <div className="lg:col-span-2">
            {selectedGallery ? (
              <div className="space-y-6">
                {/* Gallery Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedGallery.title}</CardTitle>
                        {selectedGallery.description && (
                          <CardDescription>{selectedGallery.description}</CardDescription>
                        )}
                        {selectedGallery.eventDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            Event Date: {format(new Date(selectedGallery.eventDate), 'PPP')}
                          </p>
                        )}
                      </div>
                      <Badge variant={selectedGallery.isVisible ? 'default' : 'secondary'}>
                        {selectedGallery.isVisible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Image Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Photo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL *</Label>
                      <Input
                        id="imageUrl"
                        value={uploadUrl}
                        onChange={(e) => setUploadUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageCaption">Caption (Optional)</Label>
                      <Input
                        id="imageCaption"
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        placeholder="Describe this photo..."
                      />
                    </div>
                    <Button onClick={handleImageUpload} disabled={!uploadUrl}>
                      <Upload className="h-4 w-4 mr-2" />
                      Add Photo
                    </Button>
                  </CardContent>
                </Card>

                {/* Images Grid */}
                {galleryImages.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
                      <p className="text-gray-500">
                        Add your first photo to start building this gallery.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                      : 'space-y-4'
                  }>
                    {galleryImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="relative">
                          <img 
                            src={image.url} 
                            alt={image.caption || 'Gallery photo'}
                            className="w-full h-48 object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {image.caption && (
                          <CardContent className="p-3">
                            <p className="text-sm text-gray-600">{image.caption}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Gallery</h3>
                  <p className="text-gray-500">
                    Choose a gallery from the left to view and manage its photos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}