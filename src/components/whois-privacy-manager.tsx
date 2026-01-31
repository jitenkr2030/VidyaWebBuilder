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
  Eye,
  EyeOff,
  Calendar,
  CreditCard,
  Trash2,
  Mail,
  Phone,
  Home
} from 'lucide-react'

interface WhoisPrivacy {
  id: string
  domain: string
  isEnabled: boolean
  privacyProvider?: string
  expiryDate?: string
  autoRenew: boolean
  maskedEmail?: string
  maskedPhone?: string
  maskedAddress?: string
  status: 'ACTIVE' | 'DISABLED' | 'ACTIVATING' | 'RENEWING' | 'ERROR' | 'EXPIRED'
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

interface WhoisPrivacyManagerProps {
  school: any
}

export default function WhoisPrivacyManager({ school }: WhoisPrivacyManagerProps) {
  const [privacySettings, setPrivacySettings] = useState<WhoisPrivacy[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPrivacy, setNewPrivacy] = useState({
    domain: '',
    isEnabled: false,
    privacyProvider: '',
    autoRenew: false,
    maskedEmail: '',
    maskedPhone: '',
    maskedAddress: ''
  })

  useEffect(() => {
    fetchPrivacySettings()
  }, [])

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch('/api/domains/privacy')
      if (response.ok) {
        const data = await response.json()
        setPrivacySettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch WHOIS privacy settings:', error)
    }
  }

  const handleCreatePrivacy = async () => {
    if (!newPrivacy.domain) {
      alert('Please enter a domain name')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/domains/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrivacy)
      })

      if (response.ok) {
        const data = await response.json()
        alert('WHOIS privacy setting created successfully!')
        setNewPrivacy({
          domain: '',
          isEnabled: false,
          privacyProvider: '',
          autoRenew: false,
          maskedEmail: '',
          maskedPhone: '',
          maskedAddress: ''
        })
        setShowCreateForm(false)
        fetchPrivacySettings()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create WHOIS privacy setting')
      }
    } catch (error) {
      console.error('WHOIS privacy creation error:', error)
      alert('Failed to create WHOIS privacy setting')
    } finally {
      setLoading(false)
    }
  }

  const handlePrivacyAction = async (privacyId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/domains/privacy/${privacyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchPrivacySettings()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update privacy setting')
      }
    } catch (error) {
      console.error('Privacy action error:', error)
      alert('Failed to update privacy setting')
    }
  }

  const handleDeletePrivacy = async (privacyId: string) => {
    if (!confirm('Are you sure you want to delete this WHOIS privacy setting?')) {
      return
    }

    try {
      const response = await fetch(`/api/domains/privacy/${privacyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('WHOIS privacy setting deleted successfully!')
        fetchPrivacySettings()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete privacy setting')
      }
    } catch (error) {
      console.error('Privacy deletion error:', error)
      alert('Failed to delete privacy setting')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'DISABLED': return 'bg-gray-500'
      case 'ACTIVATING': return 'bg-blue-500'
      case 'RENEWING': return 'bg-yellow-500'
      case 'ERROR': return 'bg-red-500'
      case 'EXPIRED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />
      case 'DISABLED': return <EyeOff className="h-4 w-4" />
      case 'ACTIVATING': return <RefreshCw className="h-4 w-4" />
      case 'RENEWING': return <RefreshCw className="h-4 w-4" />
      case 'ERROR': return <AlertCircle className="h-4 w-4" />
      case 'EXPIRED': return <AlertCircle className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            WHOIS Privacy Protection
          </CardTitle>
          <CardDescription>
            Protect your personal information in public WHOIS records with privacy protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Privacy Protection
          </Button>
        </CardContent>
      </Card>

      {/* Create Privacy Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add WHOIS Privacy Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="domain">Domain Name *</Label>
                <Input
                  id="domain"
                  value={newPrivacy.domain}
                  onChange={(e) => setNewPrivacy({...newPrivacy, domain: e.target.value})}
                  placeholder="yourdomain.com"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="privacyProvider">Privacy Provider</Label>
                <Input
                  id="privacyProvider"
                  value={newPrivacy.privacyProvider}
                  onChange={(e) => setNewPrivacy({...newPrivacy, privacyProvider: e.target.value})}
                  placeholder="e.g., WhoisGuard, Domain Privacy"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="maskedEmail">Masked Email</Label>
                <Input
                  id="maskedEmail"
                  type="email"
                  value={newPrivacy.maskedEmail}
                  onChange={(e) => setNewPrivacy({...newPrivacy, maskedEmail: e.target.value})}
                  placeholder="privacy@yourdomain.com"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="maskedPhone">Masked Phone</Label>
                <Input
                  id="maskedPhone"
                  value={newPrivacy.maskedPhone}
                  onChange={(e) => setNewPrivacy({...newPrivacy, maskedPhone: e.target.value})}
                  placeholder="+1-555-0123"
                  disabled={loading}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="maskedAddress">Masked Address</Label>
                <Input
                  id="maskedAddress"
                  value={newPrivacy.maskedAddress}
                  onChange={(e) => setNewPrivacy({...newPrivacy, maskedAddress: e.target.value})}
                  placeholder="123 Privacy St, Suite 100, City, State 12345"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={newPrivacy.isEnabled}
                  onChange={(e) => setNewPrivacy({...newPrivacy, isEnabled: e.target.checked})}
                  disabled={loading}
                />
                <Label htmlFor="isEnabled">Enable privacy protection immediately</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={newPrivacy.autoRenew}
                  onChange={(e) => setNewPrivacy({...newPrivacy, autoRenew: e.target.checked})}
                  disabled={loading}
                />
                <Label htmlFor="autoRenew">Enable auto-renewal</Label>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button 
                onClick={handleCreatePrivacy}
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Privacy Protection
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Settings List */}
      <div className="grid gap-4">
        {privacySettings.map((privacy) => (
          <Card key={privacy.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getStatusColor(privacy.status)}`}>
                    {getStatusIcon(privacy.status)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{privacy.domain}</CardTitle>
                    <CardDescription>
                      {privacy.privacyProvider ? `Provider: ${privacy.privacyProvider}` : 'No provider specified'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={privacy.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {privacy.status}
                  </Badge>
                  {privacy.isEnabled ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-gray-500">Expiry Date</Label>
                  <div className={`text-sm ${isExpiringSoon(privacy.expiryDate) ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(privacy.expiryDate)}
                    {isExpiringSoon(privacy.expiryDate) && ' ⚠️'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Auto-Renew</Label>
                  <div className="text-sm">
                    <Badge variant={privacy.autoRenew ? 'default' : 'secondary'}>
                      {privacy.autoRenew ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Last Updated</Label>
                  <div className="text-sm">{formatDate(privacy.lastUpdated)}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="text-sm">{privacy.status}</div>
                </div>
              </div>

              {/* Masked Information Display */}
              {(privacy.maskedEmail || privacy.maskedPhone || privacy.maskedAddress) && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Masked Information</Label>
                  <div className="space-y-1 text-sm">
                    {privacy.maskedEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{privacy.maskedEmail}</span>
                      </div>
                    )}
                    {privacy.maskedPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{privacy.maskedPhone}</span>
                      </div>
                    )}
                    {privacy.maskedAddress && (
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <span>{privacy.maskedAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {privacy.status === 'DISABLED' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePrivacyAction(privacy.id, 'enable')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Enable Protection
                  </Button>
                )}
                
                {privacy.status === 'ACTIVE' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePrivacyAction(privacy.id, 'disable')}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Disable Protection
                  </Button>
                )}

                {privacy.status === 'ACTIVE' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePrivacyAction(privacy.id, 'renew')}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePrivacyAction(privacy.id, 'toggle_auto_renew')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {privacy.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://whois.com/whois/${privacy.domain}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Check WHOIS
                </Button>

                {!privacy.isEnabled && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeletePrivacy(privacy.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {privacySettings.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No WHOIS Privacy Protection</h3>
              <p className="text-gray-500 mb-4">
                Protect your personal information from being publicly visible
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Privacy Protection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}