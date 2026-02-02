"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Plus,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  Settings
} from 'lucide-react'

interface UptimeAlert {
  id: string
  type: 'DOWN' | 'SLOW_RESPONSE' | 'UPTIME_LOW' | 'ERROR'
  threshold?: number
  consecutiveFails: number
  isTriggered: boolean
  lastTriggeredAt?: string
  resolvedAt?: string
  emailSent: boolean
}

interface UptimeMonitor {
  id: string
  url: string
  status: 'ACTIVE' | 'PAUSED' | 'DISABLED'
  checkInterval: number
  timeout: number
  lastChecked?: string
  isUp?: boolean
  responseTime?: number
  uptime: number
  totalChecks: number
  successfulChecks: number
  alerts: UptimeAlert[]
  createdAt: string
  updatedAt: string
}

interface UptimeMonitoringProps {
  school: any
}

export default function UptimeMonitoring({ school }: UptimeMonitoringProps) {
  const [monitors, setMonitors] = useState<UptimeMonitor[]>([])
  const [loading, setLoading] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [checkInterval, setCheckInterval] = useState(300)
  const [timeout, setTimeout] = useState(30)

  useEffect(() => {
    fetchMonitors()
    // Set up real-time updates
    const interval = setInterval(fetchMonitors, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMonitors = async () => {
    try {
      const response = await fetch('/api/monitoring/uptime')
      if (response.ok) {
        const data = await response.json()
        setMonitors(data)
      }
    } catch (error) {
      console.error('Failed to fetch uptime monitors:', error)
    }
  }

  const handleCreateMonitor = async () => {
    if (!newUrl.trim()) {
      alert('Please enter a URL to monitor')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/monitoring/uptime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: newUrl.trim(), 
          checkInterval, 
          timeout 
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert('Uptime monitor created successfully!')
        setNewUrl('')
        fetchMonitors()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create uptime monitor')
      }
    } catch (error) {
      console.error('Uptime monitor creation error:', error)
      alert('Failed to create uptime monitor')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMonitor = async (monitorId: string, currentStatus: string) => {
    try {
      // In production, this would call an API to toggle monitor status
      const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      alert(`Monitor ${newStatus === 'ACTIVE' ? 'resumed' : 'paused'}`)
      fetchMonitors()
    } catch (error) {
      console.error('Failed to toggle monitor:', error)
      alert('Failed to toggle monitor')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'PAUSED': return 'bg-yellow-500'
      case 'DISABLED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Play className="h-4 w-4" />
      case 'PAUSED': return <Pause className="h-4 w-4" />
      case 'DISABLED': return <AlertCircle className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-green-600'
    if (uptime >= 95) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getResponseTimeColor = (responseTime?: number) => {
    if (!responseTime) return 'text-gray-500'
    if (responseTime <= 1000) return 'text-green-600'
    if (responseTime <= 3000) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatResponseTime = (responseTime?: number) => {
    if (!responseTime) return 'N/A'
    return `${responseTime}ms`
  }

  const formatLastChecked = (lastChecked?: string) => {
    if (!lastChecked) return 'Never'
    const date = new Date(lastChecked)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Create New Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Uptime Monitoring
          </CardTitle>
          <CardDescription>
            Monitor your website's availability and performance with real-time alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="url">URL to Monitor</Label>
              <Input
                id="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://yourdomain.com"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="interval">Check Interval (seconds)</Label>
              <Input
                id="interval"
                type="number"
                value={checkInterval}
                onChange={(e) => setCheckInterval(parseInt(e.target.value) || 300)}
                min="60"
                max="3600"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={timeout}
                onChange={(e) => setTimeout(parseInt(e.target.value) || 30)}
                min="5"
                max="60"
                disabled={loading}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              onClick={handleCreateMonitor} 
              disabled={loading || !newUrl.trim()}
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Monitor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monitors List */}
      <div className="grid gap-4">
        {monitors.map((monitor) => (
          <Card key={monitor.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getStatusColor(monitor.status)}`}>
                    {getStatusIcon(monitor.status)}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {monitor.url}
                      {monitor.isUp ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Last checked {formatLastChecked(monitor.lastChecked)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={monitor.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {monitor.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleMonitor(monitor.id, monitor.status)}
                  >
                    {monitor.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-gray-500">Uptime</Label>
                  <div className={`text-lg font-bold ${getUptimeColor(monitor.uptime)}`}>
                    {monitor.uptime.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {monitor.successfulChecks}/{monitor.totalChecks} checks
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Response Time</Label>
                  <div className={`text-lg font-bold ${getResponseTimeColor(monitor.responseTime)}`}>
                    {formatResponseTime(monitor.responseTime)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {monitor.isUp ? 'Online' : 'Offline'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Check Interval</Label>
                  <div className="text-lg font-bold">
                    {monitor.checkInterval}s
                  </div>
                  <div className="text-xs text-gray-500">
                    Timeout: {monitor.timeout}s
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Active Alerts</Label>
                  <div className="text-lg font-bold">
                    {monitor.alerts.filter(a => a.isTriggered).length}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total: {monitor.alerts.length}
                  </div>
                </div>
              </div>

              {/* Active Alerts */}
              {monitor.alerts.filter(a => a.isTriggered).length > 0 && (
                <div className="mb-4">
                  <Label className="text-xs text-gray-500 mb-2 block">Active Alerts</Label>
                  <div className="space-y-2">
                    {monitor.alerts.filter(a => a.isTriggered).map((alert) => (
                      <Alert key={alert.id} className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>{alert.type.replace('_', ' ')}</strong>
                          {alert.type === 'DOWN' && ` - ${alert.consecutiveFails} consecutive failures`}
                          {alert.type === 'SLOW_RESPONSE' && ` - Over ${alert.threshold}ms response time`}
                          {alert.emailSent && ' - Email sent'}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(monitor.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Site
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchMonitors()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {monitors.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Uptime Monitors</h3>
              <p className="text-gray-500 mb-4">
                Add your first uptime monitor to track website availability
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}