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
  RefreshCw, 
  Plus,
  ExternalLink,
  Settings,
  Trash2,
  Edit,
  Server,
  Mail,
  Shield,
  FileText
} from 'lucide-react'

interface DnsRecord {
  id: string
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA' | 'PTR'
  name: string
  value: string
  ttl: number
  priority?: number
  isActive: boolean
  domainTransferId?: string
  domainTransfer?: {
    domain: string
    transferStatus: string
  }
  createdAt: string
  updatedAt: string
}

interface DnsManagementProps {
  school: any
}

const DNS_TYPES = [
  { value: 'A', label: 'A Record', description: 'IPv4 Address' },
  { value: 'AAAA', label: 'AAAA Record', description: 'IPv6 Address' },
  { value: 'CNAME', label: 'CNAME Record', description: 'Canonical Name' },
  { value: 'MX', label: 'MX Record', description: 'Mail Exchange' },
  { value: 'TXT', label: 'TXT Record', description: 'Text Record' },
  { value: 'NS', label: 'NS Record', description: 'Name Server' },
  { value: 'SRV', label: 'SRV Record', description: 'Service Record' },
  { value: 'CAA', label: 'CAA Record', description: 'Certificate Authority Authorization' },
  { value: 'PTR', label: 'PTR Record', description: 'Pointer Record' }
]

export default function DnsManagement({ school }: DnsManagementProps) {
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DnsRecord | null>(null)
  const [filterDomain, setFilterDomain] = useState('')
  const [newRecord, setNewRecord] = useState({
    type: 'A' as const,
    name: '',
    value: '',
    ttl: 3600,
    priority: 10
  })

  useEffect(() => {
    fetchDnsRecords()
  }, [])

  const fetchDnsRecords = async () => {
    try {
      const url = filterDomain ? `/api/domains/dns?domain=${filterDomain}` : '/api/domains/dns'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setDnsRecords(data)
      }
    } catch (error) {
      console.error('Failed to fetch DNS records:', error)
    }
  }

  const handleCreateRecord = async () => {
    if (!newRecord.type || !newRecord.name || !newRecord.value) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/domains/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      })

      if (response.ok) {
        const data = await response.json()
        alert('DNS record created successfully!')
        setNewRecord({
          type: 'A',
          name: '',
          value: '',
          ttl: 3600,
          priority: 10
        })
        setShowCreateForm(false)
        fetchDnsRecords()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create DNS record')
      }
    } catch (error) {
      console.error('DNS record creation error:', error)
      alert('Failed to create DNS record')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRecord = async (recordId: string) => {
    if (!editingRecord) return

    setLoading(true)
    try {
      const response = await fetch(`/api/domains/dns/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRecord)
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        setEditingRecord(null)
        fetchDnsRecords()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update DNS record')
      }
    } catch (error) {
      console.error('DNS record update error:', error)
      alert('Failed to update DNS record')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this DNS record?')) {
      return
    }

    try {
      const response = await fetch(`/api/domains/dns/${recordId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('DNS record deleted successfully!')
        fetchDnsRecords()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete DNS record')
      }
    } catch (error) {
      console.error('DNS record deletion error:', error)
      alert('Failed to delete DNS record')
    }
  }

  const handleToggleRecord = async (recordId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/domains/dns/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dnsRecords.find(r => r.id === recordId), isActive })
      })

      if (response.ok) {
        fetchDnsRecords()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update DNS record')
      }
    } catch (error) {
      console.error('DNS record toggle error:', error)
      alert('Failed to update DNS record')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'A':
      case 'AAAA':
        return <Server className="h-4 w-4" />
      case 'CNAME':
        return <Globe className="h-4 w-4" />
      case 'MX':
        return <Mail className="h-4 w-4" />
      case 'TXT':
        return <FileText className="h-4 w-4" />
      case 'NS':
        return <Shield className="h-4 w-4" />
      case 'SRV':
      case 'CAA':
      case 'PTR':
        return <Settings className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'A':
      case 'AAAA':
        return 'bg-blue-500'
      case 'CNAME':
        return 'bg-green-500'
      case 'MX':
        return 'bg-orange-500'
      case 'TXT':
        return 'bg-purple-500'
      case 'NS':
        return 'bg-red-500'
      case 'SRV':
        return 'bg-yellow-500'
      case 'CAA':
        return 'bg-indigo-500'
      case 'PTR':
        return 'bg-pink-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getUniqueDomains = () => {
    const domains = new Set<string>()
    dnsRecords.forEach(record => {
      if (record.domainTransfer?.domain) {
        domains.add(record.domainTransfer.domain)
      }
    })
    return Array.from(domains)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced DNS Management
          </CardTitle>
          <CardDescription>
            Manage DNS records for your domains with advanced record types and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add DNS Record
            </Button>
            <div className="flex items-center gap-2">
              <Label htmlFor="domainFilter">Filter by domain:</Label>
              <select
                id="domainFilter"
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All domains</option>
                {getUniqueDomains().map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit DNS Record Form */}
      {(showCreateForm || editingRecord) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRecord ? 'Edit DNS Record' : 'Create New DNS Record'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Record Type *</Label>
                <select
                  id="type"
                  value={editingRecord ? editingRecord.type : newRecord.type}
                  onChange={(e) => {
                    const type = e.target.value as any
                    if (editingRecord) {
                      setEditingRecord({...editingRecord, type})
                    } else {
                      setNewRecord({...newRecord, type})
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                >
                  {DNS_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={editingRecord ? editingRecord.name : newRecord.name}
                  onChange={(e) => {
                    if (editingRecord) {
                      setEditingRecord({...editingRecord, name: e.target.value})
                    } else {
                      setNewRecord({...newRecord, name: e.target.value})
                    }
                  }}
                  placeholder="@ (root) or subdomain"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="value">Value *</Label>
                <Input
                  id="value"
                  value={editingRecord ? editingRecord.value : newRecord.value}
                  onChange={(e) => {
                    if (editingRecord) {
                      setEditingRecord({...editingRecord, value: e.target.value})
                    } else {
                      setNewRecord({...newRecord, value: e.target.value})
                    }
                  }}
                  placeholder="IP address, domain, or text value"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="ttl">TTL (seconds)</Label>
                <Input
                  id="ttl"
                  type="number"
                  value={editingRecord ? editingRecord.ttl : newRecord.ttl}
                  onChange={(e) => {
                    const ttl = parseInt(e.target.value) || 3600
                    if (editingRecord) {
                      setEditingRecord({...editingRecord, ttl})
                    } else {
                      setNewRecord({...newRecord, ttl})
                    }
                  }}
                  min="60"
                  max="86400"
                  disabled={loading}
                />
              </div>
              {(editingRecord?.type === 'MX' || editingRecord?.type === 'SRV' || newRecord.type === 'MX' || newRecord.type === 'SRV') && (
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={editingRecord?.priority || newRecord.priority}
                    onChange={(e) => {
                      const priority = parseInt(e.target.value) || 10
                      if (editingRecord) {
                        setEditingRecord({...editingRecord, priority})
                      } else {
                        setNewRecord({...newRecord, priority})
                      }
                    }}
                    min="0"
                    max="65535"
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => {
                  if (editingRecord) {
                    handleUpdateRecord(editingRecord.id)
                  } else {
                    handleCreateRecord()
                  }
                }}
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                {editingRecord ? 'Update Record' : 'Create Record'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingRecord(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DNS Records List */}
      <div className="grid gap-4">
        {dnsRecords.map((record) => (
          <Card key={record.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getTypeColor(record.type)}`}>
                    {getTypeIcon(record.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {record.name} ({record.type})
                    </CardTitle>
                    <CardDescription>
                      {record.value}
                      {record.domainTransfer && ` • ${record.domainTransfer.domain}`}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={record.isActive ? 'default' : 'secondary'}>
                    {record.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRecord(record.id, !record.isActive)}
                  >
                    {record.isActive ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-gray-500">Type</Label>
                  <div className="text-sm font-medium">{record.type}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">TTL</Label>
                  <div className="text-sm">{record.ttl}s</div>
                </div>
                {record.priority && (
                  <div>
                    <Label className="text-xs text-gray-500">Priority</Label>
                    <div className="text-sm">{record.priority}</div>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-gray-500">Last Updated</Label>
                  <div className="text-sm">{formatDate(record.updatedAt)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingRecord(record)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://${record.domainTransfer?.domain || record.name}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test
                </Button>
                {record.type !== 'NS' && record.name !== '@' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteRecord(record.id)}
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
        
        {dnsRecords.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No DNS Records</h3>
              <p className="text-gray-500 mb-4">
                Create your first DNS record to configure your domain settings
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create DNS Record
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}