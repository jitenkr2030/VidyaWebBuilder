import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // In a real app, you would fetch SEO settings from the database
    // For now, return mock data
    const seoSettings = {
      metaTitle: "VidyaWebBuilder School - Best Education in New Delhi",
      metaDescription: "VidyaWebBuilder School provides quality education with modern facilities. Admissions open for 2024-25.",
      metaKeywords: "school, education, cbse, new delhi, admissions",
      ogTitle: "VidyaWebBuilder School - Excellence in Education",
      ogDescription: "Join VidyaWebBuilder School for a brighter future.",
      ogImage: "/images/og-image.jpg",
      twitterCard: "summary_large_image",
      twitterTitle: "VidyaWebBuilder School - New Delhi",
      twitterDescription: "Providing quality education and shaping future leaders.",
      googleAnalytics: null,
      googleSearchConsole: null
    }

    return NextResponse.json(seoSettings)
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json()

    // Validate required fields
    if (!settings.metaTitle || !settings.metaDescription) {
      return NextResponse.json(
        { error: 'Meta title and description are required' },
        { status: 400 }
      )
    }

    // In a real app, you would update the school's SEO settings in the database
    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      message: 'SEO settings updated successfully',
      settings
    })
  } catch (error) {
    console.error('Error updating SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to update SEO settings' },
      { status: 500 }
    )
  }
}