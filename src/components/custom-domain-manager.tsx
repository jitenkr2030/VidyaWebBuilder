"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Globe, CheckCircle, AlertCircle, ExternalLink, Settings, RefreshCw } from 'lucide-react'
import { useFeatureFlags } from '@/hooks/use-feature-flags'

interface CustomDomainManagerProps {
  school: any
  onDomainUpdate: () => void
}

export default function CustomDomainManager({ school, onDomainUpdate }: CustomDomainManagerProps) {
  const [customDomain, setCustomDomain] = useState(school.customDomain || '')
  const [loading, setLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [dnsRecords, setDnsRecords] = useState<any>(null)
  const { hasFeature } = useFeatureFlags()

  const currentDomain = school.subdomain ? `${school.subdomain}.vidyawebbuilder.in` : ''

  if (!hasFeature('custom_domain')) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Custom domain is available in Standard and Premium plans. 
          <Button variant="link" className="p-0 h-auto ml-2" onClick={() => window.location.href = '/subscription'}>
            Upgrade Plan →
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const handleAddDomain = async () => {
    if (!customDomain.trim()) {
      alert('Please enter a valid domain name')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/domains/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setDnsRecords(data.dnsRecords)
        setVerificationStatus('success')
        onDomainUpdate()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add custom domain')
        setVerificationStatus('error')
      }
    } catch (error) {
      console.error('Domain addition error:', error)
      alert('Failed to add custom domain')
      setVerificationStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDomain = async () => {
    if (!customDomain) return

    setVerificationStatus('verifying')
    try {
      const response = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.verified) {
          setVerificationStatus('success')
          onDomainUpdate()
        } else {
          setVerificationStatus('error')
        }
      }
    } catch (error) {
      console.error('Domain verification error:', error)
      setVerificationStatus('error')
    }
  }

  const handleRemoveDomain = async () => {
    if (!confirm('Are you sure you want to remove the custom domain? Your website will revert to the free subdomain.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/domains/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        setCustomDomain('')
        setDnsRecords(null)
        setVerificationStatus('idle')
        onDomainUpdate()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove custom domain')
      }
    } catch (error) {
      console.error('Domain removal error:', error)
      alert('Failed to remove custom domain')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Domain Status */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Domain Configuration
            </CardTitle>
            <CardDescription>
              Manage your school's custom domain for professional branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Free Subdomain</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input value={currentDomain} readOnly className="bg-gray-50" />
                  <Button variant="outline" size="sm" onClick={() => window.open(`http://${currentDomain}`, '_blank')}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Custom Domain</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input 
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="yourdomain.com"
                    disabled={loading}
                  />
                  {school.customDomain && (
                    <Badge variant={verificationStatus === 'success' ? 'default' : 'secondary'}>
                      {verificationStatus === 'success' ? 'Active' : 'Pending'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!school.customDomain ? (
                <Button onClick={handleAddDomain} disabled={loading || !customDomain.trim()}>
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />}
                  Add Custom Domain
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleVerifyDomain} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Verify Domain
                  </Button>
                  <Button variant="destructive" onClick={handleRemoveDomain} disabled={loading}>
                    Remove Domain
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* DNS Configuration */}
        {dnsRecords && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                DNS Configuration
              </CardTitle>
              <CardDescription>
                Add these DNS records to your domain provider to complete setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dnsRecords.map((record: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-gray-500">Type</Label>
                        <div className="font-mono text-sm">{record.type}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">Name</Label>
                        <div className="font-mono text-sm">{record.name}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">Value</Label>
                        <div className="font-mono text-sm break-all">{record.value}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">TTL</Label>
                        <div className="font-mono text-sm">{record.ttl || '1h'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  DNS changes may take 24-48 hours to propagate. Click "Verify Domain" after updating your DNS records.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>
              Follow these steps to configure your custom domain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li>1. Purchase a domain from any domain provider (GoDaddy, Namecheap, etc.)</li>
              <li>2. Enter your domain name above and click "Add Custom Domain"</li>
              <li>3. Copy the DNS records provided and add them to your domain provider</li>
              <li>4. Wait for DNS propagation (usually 24-48 hours)</li>
              <li>5. Click "Verify Domain" to complete the setup</li>
              <li>6. Once verified, your website will be accessible via your custom domain</li>
            </ol>
            
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Need help? Contact our support team for assistance with domain configuration.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
    </div>
  )
}