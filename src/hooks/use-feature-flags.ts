import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface FeatureFlags {
  website: boolean
  hosting: boolean
  notice_board: boolean
  photo_gallery: boolean
  mobile_friendly: boolean
  free_subdomain: boolean
  custom_domain: boolean
  admission_form: boolean
  whatsapp_button: boolean
  google_map: boolean
  priority_support: boolean
  whatsapp_broadcast: boolean
  fee_payment: boolean
  results_upload: boolean
  content_updates: boolean
  ssl_certificates: boolean
  uptime_monitoring: boolean
  renewal_reminders: boolean
}

const defaultFeatures: FeatureFlags = {
  website: true,
  hosting: true,
  notice_board: true,
  photo_gallery: true,
  mobile_friendly: true,
  free_subdomain: true,
  custom_domain: false,
  admission_form: false,
  whatsapp_button: false,
  google_map: false,
  priority_support: false,
  whatsapp_broadcast: false,
  fee_payment: false,
  results_upload: false,
  content_updates: false,
  ssl_certificates: false,
  uptime_monitoring: false,
  renewal_reminders: false
}

export function useFeatureFlags() {
  const { data: session } = useSession()
  const [features, setFeatures] = useState<FeatureFlags>(defaultFeatures)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.schoolId) {
      fetchFeatureFlags()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchFeatureFlags = async () => {
    try {
      const response = await fetch('/api/feature-flags')
      if (response.ok) {
        const data = await response.json()
        setFeatures(data)
      }
    } catch (error) {
      console.error('Error fetching feature flags:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasFeature = (feature: keyof FeatureFlags) => {
    return features[feature]
  }

  const canAccessFeature = (feature: keyof FeatureFlags, fallback?: () => void) => {
    if (!hasFeature(feature)) {
      if (fallback) fallback()
      return false
    }
    return true
  }

  return {
    features,
    loading,
    hasFeature,
    canAccessFeature
  }
}