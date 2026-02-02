"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Plus,
  ExternalLink,
  Calendar,
  FileText
} from 'lucide-react'

interface SslCertificate {
  id: string
  domain: string
  status: 'PENDING' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'ERROR' | 'REVOKED'
  issuer?: string
  issuedAt?: string
  expiresAt?: string
  autoRenew: boolean
  lastRenewedAt?: string
  renewalError?: string
  createdAt: string
  updatedAt: string
}

interface SslManagerProps {
  school: any
}

export default function SslCertificateManager({ school }: SslManagerProps) {
  const [certificates, setCertificates] = useState<SslCertificate[]>([])
  const [loading, setLoading] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [refreshing, setRefreshing] = useState<string | null>(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/ssl/certificates')
      if (response.ok) {
        const data = await response.json()
        setCertificates(data)
      }
    } catch (error) {
      console.error('Failed to fetch SSL certificates:', error)
    }
  }

  const handleCreateCertificate = async () => {
    if (!newDomain.trim()) {
      alert('Please enter a domain name')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ssl/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        alert('SSL certificate generation started!')
        setNewDomain('')
        fetchCertificates()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create SSL certificate')
      }
    } catch (error) {
      console.error('SSL certificate creation error:', error)
      alert('Failed to create SSL certificate')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCertificate = async (certificateId: string) => {
    setRefreshing(certificateId)
    try {
      const response = await fetch('/api/ssl/certificates/[id]', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId })
      })

      if (response.ok) {
        const data = await response.json()
        fetchCertificates()
        alert(`Certificate verified: ${data.verification.isValid ? 'Valid' : 'Invalid'}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to verify certificate')
      }
    } catch (error) {
      console.error('SSL verification error:', error)
      alert('Failed to verify certificate')
    } finally {
      setRefreshing(null)
    }
  }

  const handleRenewCertificate = async (certificateId: string) => {
    if (!confirm('Are you sure you want to renew this SSL certificate?')) {
      return
    }

    setRefreshing(certificateId)
    try {
      const response = await fetch('/api/ssl/certificates/[id]', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId })
      })

      if (response.ok) {
        alert('SSL certificate renewal started!')
        fetchCertificates()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to renew certificate')
      }
    } catch (error) {
      console.error('SSL renewal error:', error)
      alert('Failed to renew certificate')
    } finally {
      setRefreshing(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'EXPIRING': return 'bg-yellow-500'
      case 'EXPIRED': return 'bg-red-500'
      case 'PENDING': return 'bg-blue-500'
      case 'ERROR': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />
      case 'EXPIRING': return <Clock className="h-4 w-4" />
      case 'EXPIRED': return <AlertCircle className="h-4 w-4" />
      case 'PENDING': return <RefreshCw className="h-4 w-4" />
      case 'ERROR': return <AlertCircle className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null
    const days = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      {/* Create New Certificate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SSL Certificate Management
          </CardTitle>
          <CardDescription>
            Manage SSL certificates for your domains to ensure secure connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="yourdomain.com"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCreateCertificate} 
                disabled={loading || !newDomain.trim()}
              >
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Generate Certificate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <div className="grid gap-4">
        {certificates.map((cert) => {
          const daysUntilExpiry = getDaysUntilExpiry(cert.expiresAt)
          
          return (
            <Card key={cert.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(cert.status)}`}>
                      {getStatusIcon(cert.status)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cert.domain}</CardTitle>
                      <CardDescription>
                        Issued by {cert.issuer || 'Unknown'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={cert.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {cert.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-gray-500">Issued On</Label>
                    <div className="text-sm">
                      {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Expires On</Label>
                    <div className="text-sm">
                      {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Days Until Expiry</Label>
                    <div className="text-sm font-medium">
                      {daysUntilExpiry !== null ? (
                        <span className={daysUntilExpiry <= 30 ? 'text-red-600' : 'text-green-600'}>
                          {daysUntilExpiry} days
                        </span>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Auto Renew</Label>
                    <div className="text-sm">
                      <Badge variant={cert.autoRenew ? 'default' : 'secondary'}>
                        {cert.autoRenew ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {cert.renewalError && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{cert.renewalError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVerifyCertificate(cert.id)}
                    disabled={refreshing === cert.id}
                  >
                    {refreshing === cert.id ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Verify
                  </Button>
                  
                  {(cert.status === 'EXPIRING' || cert.status === 'EXPIRED') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRenewCertificate(cert.id)}
                      disabled={refreshing === cert.id}
                    >
                      {refreshing === cert.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Renew
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://${cert.domain}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Site
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {certificates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SSL Certificates</h3>
              <p className="text-gray-500 mb-4">
                Generate your first SSL certificate to secure your domain
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}