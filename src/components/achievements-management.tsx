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
  Award,
  Trophy,
  Star,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Calendar,
  Target,
  Medal
} from 'lucide-react'
import { format } from 'date-fns'

interface Achievement {
  id: string
  title: string
  description?: string
  imageUrl?: string
  date?: string
  isVisible: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function AchievementsManagement() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    date: '',
    isVisible: true
  })

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      if (response.ok) {
        const data = await response.json()
        setAchievements(data)
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        isVisible: formData.isVisible
      }

      let response
      if (editingAchievement) {
        response = await fetch(`/api/achievements/${editingAchievement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (response.ok) {
        await fetchAchievements()
        resetForm()
        setIsCreateDialogOpen(false)
        setEditingAchievement(null)
      } else {
        alert('Failed to save achievement')
      }
    } catch (error) {
      console.error('Failed to save achievement:', error)
      alert('Failed to save achievement')
    }
  }

  const handleDelete = async (achievementId: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) {
      return
    }

    try {
      const response = await fetch(`/api/achievements/${achievementId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAchievements(achievements.filter(a => a.id !== achievementId))
      } else {
        alert('Failed to delete achievement')
      }
    } catch (error) {
      console.error('Failed to delete achievement:', error)
      alert('Failed to delete achievement')
    }
  }

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement)
    setFormData({
      title: achievement.title,
      description: achievement.description || '',
      imageUrl: achievement.imageUrl || '',
      date: achievement.date ? format(new Date(achievement.date), 'yyyy-MM-dd') : '',
      isVisible: achievement.isVisible
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      date: '',
      isVisible: true
    })
    setEditingAchievement(null)
  }

  const moveAchievement = async (achievementId: string, direction: 'up' | 'down') => {
    const achievementIndex = achievements.findIndex(a => a.id === achievementId)
    if (
      (direction === 'up' && achievementIndex === 0) ||
      (direction === 'down' && achievementIndex === achievements.length - 1)
    ) {
      return
    }

    const newAchievements = [...achievements]
    const targetIndex = direction === 'up' ? achievementIndex - 1 : achievementIndex + 1
    
    // Swap achievements
    const temp = newAchievements[achievementIndex]
    newAchievements[achievementIndex] = newAchievements[targetIndex]
    newAchievements[targetIndex] = temp
    
    // Update order values
    newAchievements.forEach((achievement, index) => {
      achievement.order = index + 1
    })

    setAchievements(newAchievements)
    
    // Update in backend
    try {
      await fetch('/api/achievements/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          achievements: newAchievements.map(a => ({ id: a.id, order: a.order }))
        })
      })
    } catch (error) {
      console.error('Failed to reorder achievements:', error)
    }
  }

  const toggleAchievementVisibility = async (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId)
    if (!achievement) return

    const updatedAchievement = { ...achievement, isVisible: !achievement.isVisible }
    setAchievements(achievements.map(a => a.id === achievementId ? updatedAchievement : a))

    try {
      await fetch(`/api/achievements/${achievementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: updatedAchievement.isVisible })
      })
    } catch (error) {
      console.error('Failed to update achievement:', error)
    }
  }

  const createSampleAchievements = async () => {
    const sampleAchievements = [
      {
        title: '100% Board Results - Class 12',
        description: 'Our students achieved outstanding results with 100% pass percentage in CBSE Class 12 examinations.',
        imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400',
        date: new Date().toISOString()
      },
      {
        title: 'State Level Science Exhibition Winner',
        description: 'Our school team won first prize in the State Level Science Exhibition for their innovative project.',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
        date: new Date().toISOString()
      },
      {
        title: 'National Sports Meet Participation',
        description: 'Our athletes represented the school at the National Sports Meet and brought home multiple medals.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        date: new Date().toISOString()
      }
    ]

    try {
      for (const achievementData of sampleAchievements) {
        await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(achievementData)
        })
      }
      await fetchAchievements()
    } catch (error) {
      console.error('Failed to create sample achievements:', error)
      alert('Failed to create sample achievements')
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
              <Trophy className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Results & Achievements</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {achievements.length === 0 && (
                <Button variant="outline" onClick={createSampleAchievements}>
                  <Star className="h-4 w-4 mr-2" />
                  Add Sample Achievements
                </Button>
              )}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Achievement
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAchievement 
                        ? 'Update the achievement details.' 
                        : 'Showcase your school\'s accomplishments and student successes.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Achievement Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., 100% Board Results"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this achievement in detail..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/achievement-image.jpg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">Achievement Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
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
                        {editingAchievement ? 'Update Achievement' : 'Add Achievement'}
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
                  <p className="text-sm font-medium text-gray-600">Total Achievements</p>
                  <p className="text-2xl font-bold">{achievements.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {achievements.filter(a => a.isVisible).length}
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
                  <p className="text-sm font-medium text-gray-600">This Year</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {achievements.filter(a => {
                      if (!a.date) return false
                      return new Date(a.date).getFullYear() === new Date().getFullYear()
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="space-y-4">
          {achievements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                <p className="text-gray-500 mb-4">
                  Start showcasing your school\'s accomplishments and student successes.
                </p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" onClick={createSampleAchievements}>
                    <Star className="h-4 w-4 mr-2" />
                    Add Sample Achievements
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Achievement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={achievement.id} className={`overflow-hidden ${!achievement.isVisible ? 'opacity-60' : ''}`}>
                  <div className="relative">
                    {achievement.imageUrl ? (
                      <img 
                        src={achievement.imageUrl} 
                        alt={achievement.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Award className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveAchievement(achievement.id, 'up')}
                        disabled={index === 0}
                        className="bg-white/80 hover:bg-white"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveAchievement(achievement.id, 'down')}
                        disabled={index === achievements.length - 1}
                        className="bg-white/80 hover:bg-white"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAchievementVisibility(achievement.id)}
                        className="bg-white/80 hover:bg-white"
                      >
                        {achievement.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(achievement)}
                        className="bg-white/80 hover:bg-white"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(achievement.id)}
                        className="bg-red-500/80 hover:bg-red-500 text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {achievement.date && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {format(new Date(achievement.date), 'MMM yyyy')}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Medal className="h-4 w-4 text-yellow-500" />
                      <h3 className="font-semibold text-lg">{achievement.title}</h3>
                    </div>
                    {achievement.description && (
                      <p className="text-gray-600 text-sm line-clamp-3">{achievement.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}