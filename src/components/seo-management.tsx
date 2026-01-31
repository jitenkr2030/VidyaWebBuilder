'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Globe, 
  Eye, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  FileText,
  Image
} from "lucide-react"

interface SEOSettings {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogTitle: string
  ogDescription: string
  ogImage?: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  favicon?: string
  googleAnalytics?: string
  googleSearchConsole?: string
  bingWebmasterTools?: string
}

interface SEOAnalysis {
  score: number
  issues: Array<{
    type: 'error' | 'warning' | 'success'
    message: string
    recommendation: string
  }>
  stats: {
    titleLength: number
    descriptionLength: number
    keywordDensity: number
    imageCount: number
    linkCount: number
  }
}

const mockSettings: SEOSettings = {
  metaTitle: "VidyaWebBuilder School - Best Education in New Delhi",
  metaDescription: "VidyaWebBuilder School provides quality education with modern facilities. Admissions open for 2024-25. CBSE affiliated school with excellent results.",
  metaKeywords: "school, education, cbse, new delhi, admissions, best school",
  ogTitle: "VidyaWebBuilder School - Excellence in Education",
  ogDescription: "Join VidyaWebBuilder School for a brighter future. Quality education with modern facilities and experienced faculty.",
  ogImage: "/images/og-image.jpg",
  twitterCard: "summary_large_image",
  twitterTitle: "VidyaWebBuilder School - New Delhi",
  twitterDescription: "Providing quality education and shaping future leaders since 1985.",
  googleAnalytics: "G-XXXXXXXXXX",
  googleSearchConsole: "https://search.google.com/search-console"
}

const mockAnalysis: SEOAnalysis = {
  score: 85,
  issues: [
    {
      type: 'success',
      message: 'Meta title is optimal length (55 characters)',
      recommendation: 'Good job! Your title is the right length for search results.'
    },
    {
      type: 'success',
      message: 'Meta description is within recommended range (155 characters)',
      recommendation: 'Your description will display properly in search results.'
    },
    {
      type: 'warning',
      message: 'Consider adding more alt text to images',
      recommendation: 'Add descriptive alt text to improve accessibility and SEO.'
    },
    {
      type: 'error',
      message: 'Google Analytics is not configured',
      recommendation: 'Add your Google Analytics tracking code to monitor website traffic.'
    }
  ],
  stats: {
    titleLength: 55,
    descriptionLength: 155,
    keywordDensity: 2.5,
    imageCount: 12,
    linkCount: 8
  }
}

export default function SEOManagement() {
  const [settings, setSettings] = useState<SEOSettings>(mockSettings)
  const [analysis, setAnalysis] = useState<SEOAnalysis>(mockAnalysis)
  const [activeTab, setActiveTab] = useState<'settings' | 'analysis' | 'preview'>('settings')
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('SEO settings saved successfully!')
    } catch (error) {
      console.error('Error saving SEO settings:', error)
      alert('Failed to save SEO settings')
    } finally {
      setSaving(false)
    }
  }

  const handleRunAnalysis = async () => {
    setAnalyzing(true)
    try {
      // Simulate SEO analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update analysis with some randomization for demo
      setAnalysis(prev => ({
        ...prev,
        score: Math.floor(Math.random() * 20) + 75,
        stats: {
          ...prev.stats,
          titleLength: settings.metaTitle.length,
          descriptionLength: settings.metaDescription.length
        }
      }))
      
      alert('SEO analysis completed!')
    } catch (error) {
      console.error('Error running SEO analysis:', error)
      alert('Failed to run SEO analysis')
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'warning': return AlertCircle
      case 'error': return AlertCircle
      default: return AlertCircle
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const generateSitemap = () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-school.vidyawebbuilder.edu.in/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://your-school.vidyawebbuilder.edu.in/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://your-school.vidyawebbuilder.edu.in/admissions</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://your-school.vidyawebbuilder.edu.in/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`

    navigator.clipboard.writeText(sitemap)
    alert('Sitemap XML copied to clipboard!')
  }

  const generateRobotsTxt = () => {
    const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://your-school.vidyawebbuilder.edu.in/sitemap.xml

# Popular crawlers
User-agent: Googlebot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /`

    navigator.clipboard.writeText(robots)
    alert('Robots.txt content copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Search className="h-8 w-8 text-blue-600" />
              SEO & Visibility
            </h1>
            <p className="text-gray-600 mt-2">
              Optimize your school website for search engines
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">SEO Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}/100
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRunAnalysis}
              disabled={analyzing}
            >
              {analyzing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Run Analysis
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">SEO Settings</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="preview">Preview & Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic SEO */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic SEO
                  </CardTitle>
                  <CardDescription>
                    Essential meta tags for search engines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta-title">Meta Title</Label>
                    <Input
                      id="meta-title"
                      value={settings.metaTitle}
                      onChange={(e) => setSettings(prev => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="Enter your page title (50-60 characters)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {settings.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <Textarea
                      id="meta-description"
                      value={settings.metaDescription}
                      onChange={(e) => setSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Describe your page (150-160 characters)"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {settings.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta-keywords">Meta Keywords</Label>
                    <Input
                      id="meta-keywords"
                      value={settings.metaKeywords}
                      onChange={(e) => setSettings(prev => ({ ...prev, metaKeywords: e.target.value }))}
                      placeholder="school, education, cbse, admissions"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social Media
                  </CardTitle>
                  <CardDescription>
                    Open Graph and Twitter Card settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="og-title">OG Title</Label>
                    <Input
                      id="og-title"
                      value={settings.ogTitle}
                      onChange={(e) => setSettings(prev => ({ ...prev, ogTitle: e.target.value }))}
                      placeholder="Title for social media sharing"
                    />
                  </div>

                  <div>
                    <Label htmlFor="og-description">OG Description</Label>
                    <Textarea
                      id="og-description"
                      value={settings.ogDescription}
                      onChange={(e) => setSettings(prev => ({ ...prev, ogDescription: e.target.value }))}
                      placeholder="Description for social media sharing"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="og-image">OG Image URL</Label>
                    <Input
                      id="og-image"
                      value={settings.ogImage || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, ogImage: e.target.value }))}
                      placeholder="/images/og-image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter-title">Twitter Title</Label>
                    <Input
                      id="twitter-title"
                      value={settings.twitterTitle}
                      onChange={(e) => setSettings(prev => ({ ...prev, twitterTitle: e.target.value }))}
                      placeholder="Title for Twitter cards"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics & Tracking
                  </CardTitle>
                  <CardDescription>
                    Connect analytics and webmaster tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="google-analytics">Google Analytics ID</Label>
                    <Input
                      id="google-analytics"
                      value={settings.googleAnalytics || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, googleAnalytics: e.target.value }))}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="google-search-console">Google Search Console URL</Label>
                    <Input
                      id="google-search-console"
                      value={settings.googleSearchConsole || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, googleSearchConsole: e.target.value }))}
                      placeholder="https://search.google.com/search-console"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bing-webmaster">Bing Webmaster Tools URL</Label>
                    <Input
                      id="bing-webmaster"
                      value={settings.bingWebmasterTools || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, bingWebmasterTools: e.target.value }))}
                      placeholder="https://www.bing.com/webmasters"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : 'Save SEO Settings'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SEO Issues */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Analysis Results</CardTitle>
                    <CardDescription>
                      Recommendations to improve your website's SEO
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.issues.map((issue, index) => {
                      const Icon = getIssueIcon(issue.type)
                      return (
                        <div key={index} className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}>
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium">{issue.message}</p>
                              <p className="text-sm mt-1 opacity-80">{issue.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* SEO Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Title Length</span>
                      <Badge variant={analysis.stats.titleLength > 60 ? 'destructive' : 'secondary'}>
                        {analysis.stats.titleLength} chars
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Description Length</span>
                      <Badge variant={analysis.stats.descriptionLength > 160 ? 'destructive' : 'secondary'}>
                        {analysis.stats.descriptionLength} chars
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Keyword Density</span>
                      <Badge variant="secondary">
                        {analysis.stats.keywordDensity}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Images</span>
                      <Badge variant="secondary">
                        {analysis.stats.imageCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Links</span>
                      <Badge variant="secondary">
                        {analysis.stats.linkCount}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Google PageSpeed Insights
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Search className="h-4 w-4 mr-2" />
                      Google Search Console
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Google Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Google Search Preview
                  </CardTitle>
                  <CardDescription>
                    See how your page appears in Google search results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="space-y-2">
                      <h3 className="text-blue-800 text-xl hover:underline cursor-pointer">
                        {settings.metaTitle || 'Your Page Title'}
                      </h3>
                      <p className="text-green-700 text-sm">
                        https://your-school.vidyawebbuilder.edu.in
                      </p>
                      <p className="text-gray-600 text-sm">
                        {settings.metaDescription || 'Your page description will appear here...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social Media Preview
                  </CardTitle>
                  <CardDescription>
                    See how your page appears when shared on social media
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                      {settings.ogImage ? (
                        <Image className="h-8 w-8 text-gray-400" />
                      ) : (
                        <Image className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm">
                        {settings.ogTitle || 'Your Social Media Title'}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        your-school.vidyawebbuilder.edu.in
                      </p>
                      <p className="text-xs text-gray-700 mt-2">
                        {settings.ogDescription || 'Your social media description...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Tools */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>SEO Tools</CardTitle>
                  <CardDescription>
                    Generate essential SEO files for your website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Sitemap.xml</h4>
                      <p className="text-sm text-gray-600">
                        Generate a sitemap to help search engines discover your pages
                      </p>
                      <Button variant="outline" size="sm" onClick={generateSitemap}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Sitemap XML
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Robots.txt</h4>
                      <p className="text-sm text-gray-600">
                        Control how search engines crawl and index your site
                      </p>
                      <Button variant="outline" size="sm" onClick={generateRobotsTxt}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Robots.txt
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}