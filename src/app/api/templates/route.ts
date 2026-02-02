import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const templates = await db.template.findMany({
      orderBy: [
        { isPremium: 'asc' },
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, category, previewUrl, isPremium } = await request.json()

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      )
    }

    const template = await db.template.create({
      data: {
        name,
        description,
        category,
        previewUrl,
        isPremium: isPremium || false
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}