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
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Copy,
  Power,
  PowerOff
} from 'lucide-react'

interface DnsRecord {
  id: string
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA' | 'PTR'
  name: string
  value: string
  ttl: number
  priority?: number
  isActive: boolean
  domainTransfer?: {
    domain: string
    currentRegistrar: string
  }
  createdAt: string
  updatedAt: string
}

interface AdvancedDnsManagerProps {
  school: any
}

export default function AdvancedDnsManager({ school }: AdvancedDnsManagerProps) {
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
    priority: 10,
    isActive: true
  })

  useEffect(() => {
    fetchDnsRecords()
  }, [filterDomain])

  const fetchDnsRecords = async () => {
    try {
      const url = filterDomain 
        ? `/api/domains/dns?domain=${encodeURIComponent(filterDomain)}`
        : '/api/domains/dns'
      
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
          priority: 10,
          isActive: true
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

  const handleUpdateRecord = async (recordId: string, updates: Partial<DnsRecord>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/domains/dns/[id]', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, ...updates })
      })

      if (response.ok) {
        const data = await response.json()
        alert('DNS record updated successfully!')
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

    setLoading(true)
    try {
      const response = await fetch(`/api/domains/dns/[id]?id=${recordId}`, {
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
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRecord = async (record: DnsRecord) => {
    await handleUpdateRecord(record.id, { isActive: !record.isActive })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const getRecordTypeColor = (type: string) => {
    const colors = {
      'A': 'bg-blue-500',
      'AAAA': 'bg-purple-500',
      'CNAME': 'bg-green-500',
      'MX': 'bg-orange-500',
      'TXT': 'bg-pink-500',
      'NS': 'bg-indigo-500',
      'SRV': 'bg-red-500',
      'CAA': 'bg-yellow-500',
      'PTR': 'bg-gray-500'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-500'
  }

  const getRecordDescription = (type: string) => {
    const descriptions = {
      'A': 'IPv4 Address - Maps domain to an IPv4 address',
      'AAAA': 'IPv6 Address - Maps domain to an IPv6 address',
      'CNAME': 'Canonical Name - Maps domain to another domain',
      'MX': 'Mail Exchange - Routes email to mail servers',
      'TXT': 'Text - Stores text information for verification',
      'NS': 'Name Server - Delegates domain to name servers',
      'SRV': 'Service - Specifies location of services',
      'CAA': 'Certificate Authority - Restricts CAs that can issue certificates',
      'PTR': 'Pointer - Maps IP address to domain name'
    }
    return descriptions[type as keyof typeof descriptions] || ''
  }

  const uniqueDomains = [...new Set(dnsRecords.map(record => record.domainTransfer?.domain).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Advanced DNS Management
          </CardTitle>
          <CardDescription>
            Manage DNS records for your domains with support for all major record types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add DNS Record
            </Button>
            
            {uniqueDomains.length > 1 && (
              <select
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Domains</option>
                {uniqueDomains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Record Form */}
      {(showCreateForm || editingRecord) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRecord ? 'Edit DNS Record' : 'Create DNS Record'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Record Type</Label>
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
                  <option value="A">A - IPv4 Address</option>
                  <option value="AAAA">AAAA - IPv6 Address</option>
                  <option value="CNAME">CNAME - Canonical Name</option>
                  <option value="MX">MX - Mail Exchange</option>
                  <option value="TXT">TXT - Text Record</option>
                  <option value="NS">NS - Name Server</option>
                  <option value="SRV">SRV - Service Record</option>
                  <option value="CAA">CAA - Certificate Authority</option>
                  <option value="PTR">PTR - Pointer Record</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getRecordDescription(editingRecord ? editingRecord.type : newRecord.type)}
                </p>
              </div>
              
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingRecord ? editingRecord.name : newRecord.name}
                  onChange={(e) => {
                    const name = e.target.value
                    if (editingRecord) {
                      setEditingRecord({...editingRecord, name})
                    } else {
                      setNewRecord({...newRecord, name})
                    }
                  }}
                  placeholder="@ (root) or subdomain"
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={editingRecord ? editingRecord.value : newRecord.value}
                  onChange={(e) => {
                    const value = e.target.value
                    if (editingRecord) {
                      setEditingRecord({...editingRecord, value})
                    } else {
                      setNewRecord({...newRecord, value})
                    }
                  }}
                  placeholder="Record value"
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="ttl">TTL (Time to Live)</Label>
                <select
                  id="ttl"
                  value={editingRecord ? editingRecord.ttl : newRecord.ttl}
                  onChange={(e) => {
                    const ttl = parseInt(e.target.value)
                    if (editingRecord) {
                      setEditingRecord({...editingRecord, ttl})
                    } else {
                      setNewRecord({...newRecord, ttl})
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                >
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="900">15 minutes</option>
                  <option value="1800">30 minutes</option>
                  <option value="3600">1 hour</option>
                  <option value="7200">2 hours</option>
                  <option value="86400">1 day</option>
                </select>
              </div>
              
              {((editingRecord && editingRecord.type === 'MX') || (!editingRecord && newRecord.type === 'MX')) && (
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={editingRecord ? editingRecord.priority || 10 : newRecord.priority}
                    onChange={(e) => {
                      const priority = parseInt(e.target.value)
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
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingRecord ? editingRecord.isActive : newRecord.isActive}
                  onChange={(e) => {
                    const isActive = e.target.checked
                    if (editingRecord) {
                      setEditingRecord({...editingRecord, isActive})
                    } else {
                      setNewRecord({...newRecord, isActive})
                    }
                  }}
                  disabled={loading}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => {
                  if (editingRecord) {
                    handleUpdateRecord(editingRecord.id, editingRecord)
                  } else {
                    handleCreateRecord()
                  }
                }}
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
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
                  <div className={`p-2 rounded-full ${getRecordTypeColor(record.type)}`}>
                    <span className="text-white text-xs font-bold">{record.type}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {record.name} → {record.value}
                    </CardTitle>
                    <CardDescription>
                      TTL: {record.ttl}s • {record.isActive ? 'Active' : 'Inactive'}
                      {record.domainTransfer && ` • Domain: ${record.domainTransfer.domain}`}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRecord(record)}
                    disabled={loading}
                  >
                    {record.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(record.value)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRecord(record)}
                    disabled={loading}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRecord(record.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Type</Label>
                  <div className="text-sm font-medium">{record.type}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Name</Label>
                  <div className="text-sm font-mono">{record.name}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Value</Label>
                  <div className="text-sm font-mono break-all">{record.value}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Priority</Label>
                  <div className="text-sm">{record.priority || '-'}</div>
                </div>
              </div>
              
              {record.domainTransfer && (
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">
                    Associated with transfer from {record.domainTransfer.currentRegistrar}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {dnsRecords.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No DNS Records</h3>
              <p className="text-gray-500 mb-4">
                Create your first DNS record to manage your domain's DNS settings
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create DNS Record
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* DNS Record Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Record Types Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries({
              'A': 'IPv4 address mapping',
              'AAAA': 'IPv6 address mapping',
              'CNAME': 'Domain alias mapping',
              'MX': 'Mail server routing',
              'TXT': 'Text verification',
              'NS': 'Name server delegation',
              'SRV': 'Service location',
              'CAA': 'Certificate authority restriction',
              'PTR': 'IP to domain mapping'
            }).map(([type, description]) => (
              <div key={type} className="p-3 border rounded-lg">
                <div className="font-semibold text-sm">{type}</div>
                <div className="text-xs text-gray-600 mt-1">{description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}