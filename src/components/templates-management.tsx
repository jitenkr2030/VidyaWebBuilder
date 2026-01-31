'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Palette, 
  School, 
  Crown, 
  Eye, 
  Check,
  Star,
  Building,
  BookOpen,
  Trees,
  GraduationCap
} from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  category: string
  previewUrl?: string
  isPremium: boolean
  isApplied?: boolean
}

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Modern Academy",
    description: "Clean, professional design perfect for private schools with modern amenities",
    category: "PRIVATE",
    previewUrl: "/templates/modern-academy.jpg",
    isPremium: false,
    isApplied: true
  },
  {
    id: "2", 
    name: "Government Excellence",
    description: "Traditional layout optimized for government schools with official branding",
    category: "GOVERNMENT",
    previewUrl: "/templates/government-excellence.jpg",
    isPremium: false
  },
  {
    id: "3",
    name: "CBSE Premier",
    description: "Specialized template for CBSE schools with curriculum focus",
    category: "CBSE",
    previewUrl: "/templates/cbse-premier.jpg",
    isPremium: true
  },
  {
    id: "4",
    name: "ICSE Elite",
    description: "Elegant design for ICSE schools emphasizing holistic education",
    category: "ICSE", 
    previewUrl: "/templates/icse-elite.jpg",
    isPremium: true
  },
  {
    id: "5",
    name: "Rural Pride",
    description: "Simple, accessible template perfect for rural schools with limited bandwidth",
    category: "RURAL",
    previewUrl: "/templates/rural-pride.jpg",
    isPremium: false
  },
  {
    id: "6",
    name: "Coaching Plus",
    description: "Integrated template for schools with coaching centers",
    category: "COACHING",
    previewUrl: "/templates/coaching-plus.jpg", 
    isPremium: true
  }
]

const categoryIcons = {
  PRIVATE: Building,
  GOVERNMENT: School,
  CBSE: BookOpen,
  ICSE: GraduationCap,
  RURAL: Trees,
  COACHING: Star
}

const categoryColors = {
  PRIVATE: "text-blue-600 bg-blue-50",
  GOVERNMENT: "text-green-600 bg-green-50", 
  CBSE: "text-purple-600 bg-purple-50",
  ICSE: "text-orange-600 bg-orange-50",
  RURAL: "text-yellow-600 bg-yellow-50",
  COACHING: "text-red-600 bg-red-50"
}

export default function TemplatesManagement() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null)

  const categories = ["ALL", "PRIVATE", "GOVERNMENT", "CBSE", "ICSE", "RURAL", "COACHING"]
  
  const filteredTemplates = selectedCategory === "ALL" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  const handleApplyTemplate = async (templateId: string) => {
    setApplyingTemplate(templateId)
    
    try {
      const response = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId }),
      })

      if (response.ok) {
        // Update local state to show template as applied
        setTemplates(prev => prev.map(template => ({
          ...template,
          isApplied: template.id === templateId
        })))
        
        alert('Template applied successfully! Your website has been updated.')
      } else {
        alert('Failed to apply template')
      }
    } catch (error) {
      console.error('Error applying template:', error)
      alert('Error applying template')
    } finally {
      setApplyingTemplate(null)
    }
  }

  const handlePreviewTemplate = (template: Template) => {
    // In a real app, this would open a preview modal or new tab
    alert(`Previewing ${template.name} template\n\nIn production, this would show a full preview of the template with sample content.`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Palette className="h-8 w-8 text-blue-600" />
              School Templates & Themes
            </h1>
            <p className="text-gray-600 mt-2">
              Choose from our professionally designed templates specifically for Indian schools
            </p>
          </div>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Current Site
          </Button>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-7">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="text-sm">
                {category === "ALL" ? "All Templates" : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const CategoryIcon = categoryIcons[template.category as keyof typeof categoryIcons]
            const categoryColor = categoryColors[template.category as keyof typeof categoryColors]
            
            return (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Template Preview */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <School className="h-16 w-16 text-blue-600 opacity-50" />
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`flex items-center gap-1 ${categoryColor}`}>
                      <CategoryIcon className="h-3 w-3" />
                      {template.category}
                    </Badge>
                  </div>

                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-500 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}

                  {/* Applied Badge */}
                  {template.isApplied && (
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-green-600 text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Applied
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    {template.isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    
                    <Button 
                      size="sm" 
                      className="flex-1"
                      disabled={template.isApplied || applyingTemplate === template.id}
                      onClick={() => handleApplyTemplate(template.id)}
                    >
                      {applyingTemplate === template.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : template.isApplied ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Palette className="h-4 w-4 mr-2" />
                      )}
                      {template.isApplied ? 'Applied' : 'Apply'}
                    </Button>
                  </div>

                  {template.isPremium && !template.isApplied && (
                    <p className="text-xs text-gray-500 text-center">
                      Premium template - Requires subscription
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">
              No templates available in the {selectedCategory} category.
            </p>
          </div>
        )}

        {/* Tips Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Template Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>• <strong>Free Templates:</strong> Available for all schools with essential features</li>
              <li>• <strong>Premium Templates:</strong> Advanced designs with additional customization options</li>
              <li>• <strong>Easy Switching:</strong> Change templates anytime - your content is preserved</li>
              <li>• <strong>Mobile Optimized:</strong> All templates work perfectly on phones and tablets</li>
              <li>• <strong>Indian School Focus:</strong> Designed specifically for Indian education system</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}