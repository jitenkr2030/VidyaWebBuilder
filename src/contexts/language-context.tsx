'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'ENGLISH' | 'HINDI'

interface Translations {
  [key: string]: {
    [key in Language]: string
  }
}

const translations: Translations = {
  // Navigation
  'dashboard': {
    ENGLISH: 'Dashboard',
    HINDI: 'डैशबोर्ड'
  },
  'websiteBuilder': {
    ENGLISH: 'Website Builder',
    HINDI: 'वेबसाइट बिल्डर'
  },
  'noticeBoard': {
    ENGLISH: 'Notice Board',
    HINDI: 'नोटिस बोर्ड'
  },
  'admissions': {
    ENGLISH: 'Admissions',
    HINDI: 'प्रवेश'
  },
  'gallery': {
    ENGLISH: 'Photo Gallery',
    HINDI: 'फोटो गैलरी'
  },
  'staff': {
    ENGLISH: 'Staff Directory',
    HINDI: 'स्टाफ डायरेक्टरी'
  },
  'academics': {
    ENGLISH: 'Academics',
    HINDI: 'शिक्षा'
  },
  'templates': {
    ENGLISH: 'Templates',
    HINDI: 'टेम्प्लेट्स'
  },
  'contact': {
    ENGLISH: 'Contact & Messages',
    HINDI: 'संपर्क और संदेश'
  },
  'users': {
    ENGLISH: 'User Management',
    HINDI: 'उपयोगकर्ता प्रबंधन'
  },
  
  // Common actions
  'save': {
    ENGLISH: 'Save',
    HINDI: 'सेव करें'
  },
  'cancel': {
    ENGLISH: 'Cancel',
    HINDI: 'रद्द करें'
  },
  'edit': {
    ENGLISH: 'Edit',
    HINDI: 'संपादित करें'
  },
  'delete': {
    ENGLISH: 'Delete',
    HINDI: 'हटाएं'
  },
  'add': {
    ENGLISH: 'Add',
    HINDI: 'जोड़ें'
  },
  'view': {
    ENGLISH: 'View',
    HINDI: 'देखें'
  },
  'manage': {
    ENGLISH: 'Manage',
    HINDI: 'प्रबंधित करें'
  },
  'publish': {
    ENGLISH: 'Publish',
    HINDI: 'प्रकाशित करें'
  },
  'draft': {
    ENGLISH: 'Draft',
    HINDI: 'ड्राफ्ट'
  },
  
  // Welcome messages
  'welcomeTitle': {
    ENGLISH: 'Welcome to Your School Website Dashboard',
    HINDI: 'आपके स्कूल वेबसाइट डैशबोर्ड में आपका स्वागत है'
  },
  'welcomeSubtitle': {
    ENGLISH: 'Manage your school\'s online presence with our easy-to-use tools',
    HINDI: 'हमारे उपयोग में आसान टूल के साथ अपने स्कूल की ऑनलाइन उपस्थिति का प्रबंधन करें'
  },
  
  // Form labels
  'name': {
    ENGLISH: 'Name',
    HINDI: 'नाम'
  },
  'email': {
    ENGLISH: 'Email',
    HINDI: 'ईमेल'
  },
  'phone': {
    ENGLISH: 'Phone',
    HINDI: 'फोन'
  },
  'subject': {
    ENGLISH: 'Subject',
    HINDI: 'विषय'
  },
  'message': {
    ENGLISH: 'Message',
    HINDI: 'संदेश'
  },
  'address': {
    ENGLISH: 'Address',
    HINDI: 'पता'
  },
  
  // Status
  'active': {
    ENGLISH: 'Active',
    HINDI: 'सक्रिय'
  },
  'inactive': {
    ENGLISH: 'Inactive',
    HINDI: 'निष्क्रिय'
  },
  'published': {
    ENGLISH: 'Published',
    HINDI: 'प्रकाशित'
  },
  'new': {
    ENGLISH: 'New',
    HINDI: 'नया'
  },
  'read': {
    ENGLISH: 'Read',
    HINDI: 'पढ़ा गया'
  },
  'replied': {
    ENGLISH: 'Replied',
    HINDI: 'जवाब दिया गया'
  },
  'closed': {
    ENGLISH: 'Closed',
    HINDI: 'बंद'
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Initialize with saved language from localStorage or default to ENGLISH
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('vidya-language') as Language
      if (savedLanguage && (savedLanguage === 'ENGLISH' || savedLanguage === 'HINDI')) {
        return savedLanguage
      }
    }
    return 'ENGLISH'
  })

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('vidya-language', lang)
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  const isRTL = language === 'HINDI'

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}