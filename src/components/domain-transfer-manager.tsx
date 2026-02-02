"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Plus,
  ExternalLink,
  Calendar,
  FileText,
  Lock,
  Unlock,
  Trash2,
  Key,
  Mail,
  Phone
} from 'lucide-react'

interface DomainTransfer {
  id: string
  domain: string
  currentRegistrar: string
  authCode?: string
  transferStatus: 'PENDING' | 'PROCESSING' | 'AWAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  initiatedAt: string
  completedAt?: string
  expiryDate?: string
  autoRenew: boolean
  privacyProtection: boolean
  lockStatus: boolean
  adminEmail: string
  adminPhone?: string
  transferNotes?: string
  dnsRecords: any[]
  createdAt: string
  updatedAt: string
}

interface DomainTransferManagerProps {
  school: any
}

export default function DomainTransferManager({ school }: DomainTransferManagerProps) {
  const [transfers, setTransfers] = useState<DomainTransfer[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTransfer, setNewTransfer] = useState({
    domain: '',
    currentRegistrar: '',
    authCode: '',
    adminEmail: school?.email || '',
    adminPhone: '',
    expiryDate: '',
    autoRenew: false,
    privacyProtection: false
  })

  useEffect(() => {
    fetchTransfers()
  }, [])

  const fetchTransfers = async () => {
    try {
      const response = await fetch('/api/domains/transfers')
      if (response.ok) {
        const data = await response.json()
        setTransfers(data)
      }
    } catch (error) {
      console.error('Failed to fetch domain transfers:', error)
    }
  }

  const handleCreateTransfer = async () => {
    if (!newTransfer.domain || !newTransfer.currentRegistrar || !newTransfer.adminEmail) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/domains/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransfer)
      })

      if (response.ok) {
        const data = await response.json()
        alert('Domain transfer initiated successfully!')
        setNewTransfer({
          domain: '',
          currentRegistrar: '',
          authCode: '',
          adminEmail: school?.email || '',
          adminPhone: '',
          expiryDate: '',
          autoRenew: false,
          privacyProtection: false
        })
        setShowCreateForm(false)
        fetchTransfers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to initiate domain transfer')
      }
    } catch (error) {
      console.error('Domain transfer creation error:', error)
      alert('Failed to initiate domain transfer')
    } finally {
      setLoading(false)
    }
  }

  const handleTransferAction = async (transferId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/domains/transfers/${transferId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchTransfers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update transfer')
      }
    } catch (error) {
      console.error('Transfer action error:', error)
      alert('Failed to update transfer')
    }
  }

  const handleDeleteTransfer = async (transferId: string) => {
    if (!confirm('Are you sure you want to delete this domain transfer?')) {
      return
    }

    try {
      const response = await fetch(`/api/domains/transfers/${transferId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Domain transfer deleted successfully!')
        fetchTransfers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete transfer')
      }
    } catch (error) {
      console.error('Transfer deletion error:', error)
      alert('Failed to delete transfer')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500'
      case 'PENDING': return 'bg-blue-500'
      case 'PROCESSING': return 'bg-yellow-500'
      case 'AWAITING_APPROVAL': return 'bg-orange-500'
      case 'FAILED': return 'bg-red-500'
      case 'CANCELLED': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'PROCESSING': return <RefreshCw className="h-4 w-4" />
      case 'AWAITING_APPROVAL': return <AlertCircle className="h-4 w-4" />
      case 'FAILED': return <AlertCircle className="h-4 w-4" />
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
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
            <Globe className="h-5 w-5" />
            Domain Transfer Management
          </CardTitle>
          <CardDescription>
            Transfer your existing domains to VidyaWebBuilder for unified management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Initiate Domain Transfer
          </Button>
        </CardContent>
      </Card>

      {/* Create Transfer Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Initiate New Domain Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="domain">Domain Name *</Label>
                <Input
                  id="domain"
                  value={newTransfer.domain}
                  onChange={(e) => setNewTransfer({...newTransfer, domain: e.target.value})}
                  placeholder="yourdomain.com"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="currentRegistrar">Current Registrar *</Label>
                <Input
                  id="currentRegistrar"
                  value={newTransfer.currentRegistrar}
                  onChange={(e) => setNewTransfer({...newTransfer, currentRegistrar: e.target.value})}
                  placeholder="GoDaddy, Namecheap, etc."
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="authCode">Authorization Code (EPP Code)</Label>
                <Input
                  id="authCode"
                  value={newTransfer.authCode}
                  onChange={(e) => setNewTransfer({...newTransfer, authCode: e.target.value})}
                  placeholder="Optional - can be provided later"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={newTransfer.adminEmail}
                  onChange={(e) => setNewTransfer({...newTransfer, adminEmail: e.target.value})}
                  placeholder="admin@yourdomain.com"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="adminPhone">Admin Phone</Label>
                <Input
                  id="adminPhone"
                  value={newTransfer.adminPhone}
                  onChange={(e) => setNewTransfer({...newTransfer, adminPhone: e.target.value})}
                  placeholder="+1-555-0123"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Domain Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newTransfer.expiryDate}
                  onChange={(e) => setNewTransfer({...newTransfer, expiryDate: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={newTransfer.autoRenew}
                  onChange={(e) => setNewTransfer({...newTransfer, autoRenew: e.target.checked})}
                  disabled={loading}
                />
                <Label htmlFor="autoRenew">Enable auto-renewal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="privacyProtection"
                  checked={newTransfer.privacyProtection}
                  onChange={(e) => setNewTransfer({...newTransfer, privacyProtection: e.target.checked})}
                  disabled={loading}
                />
                <Label htmlFor="privacyProtection">Enable WHOIS privacy protection</Label>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button 
                onClick={handleCreateTransfer}
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Initiate Transfer
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

      {/* Transfers List */}
      <div className="grid gap-4">
        {transfers.map((transfer) => (
          <Card key={transfer.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getStatusColor(transfer.transferStatus)}`}>
                    {getStatusIcon(transfer.transferStatus)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{transfer.domain}</CardTitle>
                    <CardDescription>
                      From: {transfer.currentRegistrar} • Admin: {transfer.adminEmail}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {transfer.lockStatus && <Lock className="h-4 w-4 text-gray-500" />}
                  <Badge variant={transfer.transferStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                    {transfer.transferStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-gray-500">Initiated</Label>
                  <div className="text-sm">{formatDate(transfer.initiatedAt)}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Completed</Label>
                  <div className="text-sm">{formatDate(transfer.completedAt)}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Expiry Date</Label>
                  <div className={`text-sm ${isExpiringSoon(transfer.expiryDate) ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(transfer.expiryDate)}
                    {isExpiringSoon(transfer.expiryDate) && ' ⚠️'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">DNS Records</Label>
                  <div className="text-sm">{transfer.dnsRecords.length} records</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {transfer.autoRenew && <Badge variant="outline">Auto-Renew</Badge>}
                {transfer.privacyProtection && <Badge variant="outline">Privacy Protection</Badge>}
                {transfer.authCode && <Badge variant="outline">Auth Code Provided</Badge>}
              </div>

              {transfer.transferNotes && (
                <Alert className="mb-4">
                  <FileText className="h-4 w-4" />
                  <AlertDescription>{transfer.transferNotes}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                {transfer.transferStatus === 'AWAITING_APPROVAL' && !transfer.authCode && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const authCode = prompt('Enter authorization code (EPP code):')
                      if (authCode) {
                        handleTransferAction(transfer.id, 'submit_auth_code', { authCode })
                      }
                    }}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Submit Auth Code
                  </Button>
                )}
                
                {transfer.transferStatus === 'PROCESSING' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTransferAction(transfer.id, 'approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Transfer
                  </Button>
                )}

                {transfer.lockStatus ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTransferAction(transfer.id, 'unlock_domain')}
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlock Domain
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTransferAction(transfer.id, 'lock_domain')}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Lock Domain
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://${transfer.domain}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Site
                </Button>

                {['PENDING', 'FAILED', 'CANCELLED'].includes(transfer.transferStatus) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteTransfer(transfer.id)}
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
        
        {transfers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Domain Transfers</h3>
              <p className="text-gray-500 mb-4">
                Transfer your existing domains to manage them in one place
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Initiate Your First Transfer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}