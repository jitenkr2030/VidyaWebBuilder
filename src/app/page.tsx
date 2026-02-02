'use client'

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LanguageProvider, useLanguage } from '@/contexts/language-context'
import { LanguageSwitcher } from '@/components/language-switcher'
import { 
  School, 
  Globe, 
  Users, 
  Settings, 
  FileText, 
  Image, 
  Calendar,
  Award,
  Phone,
  Palette,
  Layout,
  Megaphone,
  BookOpen,
  GraduationCap,
  Shield,
  Zap,
  CheckCircle,
  Eye,
  Search,
  CreditCard,
  Activity,
  Bell
} from "lucide-react"
import dynamic from "next/dynamic"

const WebsiteBuilder = dynamic(() => import("@/components/website-builder"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const NoticeBoard = dynamic(() => import("@/components/notice-board"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const AdmissionManagement = dynamic(() => import("@/components/admission-management"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const PhotoGallery = dynamic(() => import("@/components/photo-gallery"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const StaffManagement = dynamic(() => import("@/components/staff-management"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const AcademicsManagement = dynamic(() => import("@/components/academics-management"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const UserManagement = dynamic(() => import("@/components/user-management"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const TemplatesManagement = dynamic(() => import("@/components/templates-management"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const ContactManagement = dynamic(() => import("@/components/contact-management"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const SEOManagement = dynamic(() => import("@/components/seo-management"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const SubscriptionManager = dynamic(() => import("@/components/subscription-manager"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const CustomDomainManager = dynamic(() => import("@/components/custom-domain-manager"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const SslCertificateManager = dynamic(() => import("@/components/ssl-certificate-manager"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const UptimeMonitoring = dynamic(() => import("@/components/uptime-monitoring"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const RenewalReminders = dynamic(() => import("@/components/renewal-reminders"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const DomainTransferManager = dynamic(() => import("@/components/domain-transfer-manager"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const DnsManagement = dynamic(() => import("@/components/dns-management"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

const WhoisPrivacyManager = dynamic(() => import("@/components/whois-privacy-manager"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>
})

function HomeContent() {
  const { t } = useLanguage()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [school, setSchool] = useState<any>(null)
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder' | 'notices' | 'admissions' | 'gallery' | 'staff' | 'academics' | 'users' | 'templates' | 'contact' | 'seo' | 'subscription' | 'domain' | 'ssl' | 'monitoring' | 'reminders' | 'transfers' | 'dns' | 'privacy'>('dashboard')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  useEffect(() => {
    // Initialize database and check authentication
    const initializeAndCheckAuth = async () => {
      try {
        // First, initialize database if needed
        console.log('🔍 Checking database initialization...')
        const initResponse = await fetch('/api/init-db', { method: 'POST' })
        const initData = await initResponse.json()
        console.log('📊 Database status:', initData)
        
        // Then check if user is already authenticated
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        if (session.user) {
          setIsAuthenticated(true)
          // Fetch school data
          const schoolResponse = await fetch('/api/school/current')
          if (schoolResponse.ok) {
            const schoolData = await schoolResponse.json()
            setSchool(schoolData)
          }
        }
      } catch (error) {
        console.error('Initialization failed:', error)
      }
    }
    initializeAndCheckAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      if (result?.ok) {
        // Login successful, check auth status again
        const authResponse = await fetch('/api/auth/session')
        const session = await authResponse.json()
        if (session.user) {
          setIsAuthenticated(true)
          // Fetch school data
          const schoolResponse = await fetch('/api/school/current')
          if (schoolResponse.ok) {
            const schoolData = await schoolResponse.json()
            setSchool(schoolData)
          }
        }
      } else {
        alert('Invalid credentials')
      }
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: schoolName,
          email: signupEmail,
          password: signupPassword,
        }),
      })
      
      if (response.ok) {
        alert('School registered successfully! Please login.')
        // Reset form and switch to login
        setSchoolName('')
        setSignupEmail('')
        setSignupPassword('')
        const loginTab = document.querySelector('[value="login"]') as HTMLButtonElement
        loginTab?.click()
      } else {
        alert('Registration failed')
      }
    } catch (error) {
      console.error('Signup failed:', error)
      alert('Registration failed')
    }
  }

  if (isAuthenticated) {
    if (currentView === 'builder') {
      return <WebsiteBuilder />
    }
    
    if (currentView === 'notices') {
      return <NoticeBoard />
    }
    
    if (currentView === 'admissions') {
      return <AdmissionManagement />
    }
    
    if (currentView === 'gallery') {
      return <PhotoGallery />
    }
    
    if (currentView === 'staff') {
      return <StaffManagement />
    }
    
    if (currentView === 'academics') {
      return <AcademicsManagement />
    }
    
    if (currentView === 'users') {
      return <UserManagement />
    }
    
    if (currentView === 'templates') {
      return <TemplatesManagement />
    }
    
    if (currentView === 'contact') {
      return <ContactManagement />
    }
    
    if (currentView === 'seo') {
      return <SEOManagement />
    }
    
    if (currentView === 'subscription') {
      return <SubscriptionManager school={school} onSubscriptionChange={() => {
        // Refetch school data after subscription change
        const fetchSchool = async () => {
          const schoolResponse = await fetch('/api/school/current')
          if (schoolResponse.ok) {
            const schoolData = await schoolResponse.json()
            setSchool(schoolData)
          }
        }
        fetchSchool()
      }} />
    }
    
    if (currentView === 'domain') {
      return <CustomDomainManager school={school} onDomainUpdate={() => {
        // Refetch school data after domain change
        const fetchSchool = async () => {
          const schoolResponse = await fetch('/api/school/current')
          if (schoolResponse.ok) {
            const schoolData = await schoolResponse.json()
            setSchool(schoolData)
          }
        }
        fetchSchool()
      }} />
    }
    
    if (currentView === 'ssl') {
      return <SslCertificateManager school={school} />
    }
    
    if (currentView === 'monitoring') {
      return <UptimeMonitoring school={school} />
    }
    
    if (currentView === 'reminders') {
      return <RenewalReminders school={school} />
    }

    if (currentView === 'transfers') {
      return <DomainTransferManager school={school} />
    }

    if (currentView === 'dns') {
      return <DnsManagement school={school} />
    }

    if (currentView === 'privacy') {
      return <WhoisPrivacyManager school={school} />
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <School className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">VidyaWebBuilder</h1>
                <Badge variant="secondary" className="hidden sm:inline-flex">Dashboard</Badge>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <LanguageSwitcher />
                <div className="hidden sm:flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">Settings</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
                {/* Mobile menu button */}
                <Button variant="outline" size="sm" className="sm:hidden">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {t('welcomeTitle')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {t('welcomeSubtitle')}
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Layout className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <CardTitle className="text-base sm:text-lg">Website Builder</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Design and customize your school website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('builder')}>
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Open Builder</span>
                  <span className="sm:hidden">Builder</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  <CardTitle className="text-base sm:text-lg">Notice Board</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Publish important notices and announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('notices')}>
                  <span className="hidden sm:inline">Manage Notices</span>
                  <span className="sm:hidden">Notices</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  <CardTitle className="text-base sm:text-lg">Admissions</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Handle admission enquiries and applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('admissions')}>
                  <span className="hidden sm:inline">View Enquiries</span>
                  <span className="sm:hidden">Enquiries</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Image className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  <CardTitle className="text-base sm:text-lg">Photo Gallery</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Showcase school events and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('gallery')}>
                  <span className="hidden sm:inline">Manage Gallery</span>
                  <span className="sm:hidden">Gallery</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  <CardTitle className="text-base sm:text-lg">Staff Directory</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Manage teacher profiles and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('staff')}>
                  <span className="hidden sm:inline">Manage Staff</span>
                  <span className="sm:hidden">Staff</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                  <CardTitle className="text-base sm:text-lg">Academics</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Create academic pages and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('academics')}>
                  <span className="hidden sm:inline">Manage Pages</span>
                  <span className="sm:hidden">Pages</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
                  <CardTitle className="text-base sm:text-lg">Templates</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Choose from school-specific templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('templates')}>
                  <span className="hidden sm:inline">Browse Templates</span>
                  <span className="sm:hidden">Templates</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Additional Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  <CardTitle className="text-base sm:text-lg">Contact & Messages</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Manage parent enquiries and communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('contact')}>
                  <span className="hidden sm:inline">View Messages</span>
                  <span className="sm:hidden">Messages</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <CardTitle className="text-base sm:text-lg">Public Website</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  View your school's public website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Visit Site</span>
                  <span className="sm:hidden">Site</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  <CardTitle className="text-base sm:text-lg">SEO & Visibility</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Optimize for search engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('seo')}>
                  <span className="hidden sm:inline">Manage SEO</span>
                  <span className="sm:hidden">SEO</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <CardTitle className="text-base sm:text-lg">Subscription Plans</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Upgrade to unlock premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full h-9 sm:h-10 text-sm bg-blue-600 hover:bg-blue-700" onClick={() => setCurrentView('subscription')}>
                  <span className="hidden sm:inline">View Plans</span>
                  <span className="sm:hidden">Plans</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  <CardTitle className="text-base sm:text-lg">Custom Domain</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Configure your professional domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('domain')}>
                  <span className="hidden sm:inline">Manage Domain</span>
                  <span className="sm:hidden">Domain</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  <CardTitle className="text-base sm:text-lg">SSL Certificates</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Manage SSL certificates for secure connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('ssl')}>
                  <span className="hidden sm:inline">Manage SSL</span>
                  <span className="sm:hidden">SSL</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  <CardTitle className="text-base sm:text-lg">Uptime Monitoring</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Monitor website availability and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('monitoring')}>
                  <span className="hidden sm:inline">View Monitors</span>
                  <span className="sm:hidden">Monitors</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  <CardTitle className="text-base sm:text-lg">Renewal Reminders</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Automated notifications for renewals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('reminders')}>
                  <span className="hidden sm:inline">Manage Reminders</span>
                  <span className="sm:hidden">Reminders</span>
                </Button>
              </CardContent>
            </Card>

            {/* Domain Transfer Manager */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  <CardTitle className="text-base sm:text-lg">Domain Transfers</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Transfer existing domains to VidyaWebBuilder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('transfers')}>
                  <span className="hidden sm:inline">Manage Transfers</span>
                  <span className="sm:hidden">Transfers</span>
                </Button>
              </CardContent>
            </Card>

            {/* DNS Management */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  <CardTitle className="text-base sm:text-lg">DNS Management</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Advanced DNS record management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('dns')}>
                  <span className="hidden sm:inline">Manage DNS</span>
                  <span className="sm:hidden">DNS</span>
                </Button>
              </CardContent>
            </Card>

            {/* WHOIS Privacy Protection */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
                  <CardTitle className="text-base sm:text-lg">WHOIS Privacy</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Protect your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('privacy')}>
                  <span className="hidden sm:inline">Manage Privacy</span>
                  <span className="sm:hidden">Privacy</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Admin Panel */}
          <div className="mb-6 sm:mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-200 bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="text-base sm:text-lg">Admin Panel</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Manage users and system settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm" onClick={() => setCurrentView('users')}>
                  <span className="hidden sm:inline">Manage Users</span>
                  <span className="sm:hidden">Users</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Website Status</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">Published</p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Active Notices</p>
                    <p className="text-xl sm:text-2xl font-bold">5</p>
                  </div>
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Admission Enquiries</p>
                    <p className="text-xl sm:text-2xl font-bold">12</p>
                  </div>
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Gallery Photos</p>
                    <p className="text-xl sm:text-2xl font-bold">48</p>
                  </div>
                  <Image className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <School className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">VidyaWebBuilder</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            School-Only Website Builder for Indian Schools
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Create a professional school website in minutes with our easy-to-use builder. 
            No technical skills required - designed specifically for Indian schools.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login/Signup Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Get Started</CardTitle>
              <CardDescription className="text-center">
                Login or create your school website account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="school@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Login to Dashboard
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="school-name">School Name</Label>
                      <Input
                        id="school-name"
                        type="text"
                        placeholder="Your School Name"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="school@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create School Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Demo Accounts Information */}
          <Card className="shadow-xl border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Shield className="h-5 w-5" />
                <span>Demo Accounts for Testing</span>
              </CardTitle>
              <CardDescription className="text-blue-700">
                Use these credentials to explore the platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-blue-800">🎓 School Admin</span>
                    <Badge variant="default" className="bg-blue-600">Full Access</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Complete school management</p>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                    principal@dps.edu.in / principal123
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Test: Website builder, staff management, admissions</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-green-800">👩‍🏫 Teacher/Editor</span>
                    <Badge variant="default" className="bg-green-600">Content Access</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Content creation and editing</p>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                    teacher@dps.edu.in / teacher123
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Test: Notice creation, gallery management, page editing</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">👨‍💼 Staff/Viewer</span>
                    <Badge variant="secondary">Read-only</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">View-only access to content</p>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                    staff@dps.edu.in / staff123
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Test: View notices, galleries, school information</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-700 text-center">
                  💡 <strong>Tip:</strong> Use the School Admin account to experience all features
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Quick Start Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Section-based Builder</p>
                    <p className="text-sm text-gray-600">No drag-and-drop chaos - just clean sections</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Digital Notice Board</p>
                    <p className="text-sm text-gray-600">Publish notices instantly on your homepage</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Admission Management</p>
                    <p className="text-sm text-gray-600">Handle enquiries and applications online</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Mobile-First Design</p>
                    <p className="text-sm text-gray-600">Looks great on all devices</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>Trusted by Indian Schools</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Built specifically for the Indian education system with features like:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">CBSE/ICSE Ready</Badge>
                  <Badge variant="secondary">Hindi/English Support</Badge>
                  <Badge variant="secondary">Indian Templates</Badge>
                  <Badge variant="secondary">WhatsApp Integration</Badge>
                  <Badge variant="secondary">Secure Hosting</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  )
}