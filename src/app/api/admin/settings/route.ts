import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'

const SETTINGS_ID = 'site_settings'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    // Get or create settings
    let settings = await prisma.settings.findUnique({
      where: { id: SETTINGS_ID },
    })

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: SETTINGS_ID },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: '獲取設定失敗' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const body = await request.json()
    const {
      siteName,
      siteDescription,
      siteUrl,
      socialTwitter,
      socialGithub,
      socialLinkedin,
      seoDefaultTitle,
      seoDefaultDesc,
    } = body

    const settings = await prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: {
        siteName,
        siteDescription,
        siteUrl,
        socialTwitter: socialTwitter || null,
        socialGithub: socialGithub || null,
        socialLinkedin: socialLinkedin || null,
        seoDefaultTitle: seoDefaultTitle || null,
        seoDefaultDesc: seoDefaultDesc || null,
      },
      create: {
        id: SETTINGS_ID,
        siteName,
        siteDescription,
        siteUrl,
        socialTwitter: socialTwitter || null,
        socialGithub: socialGithub || null,
        socialLinkedin: socialLinkedin || null,
        seoDefaultTitle: seoDefaultTitle || null,
        seoDefaultDesc: seoDefaultDesc || null,
      },
    })

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: '更新設定失敗' }, { status: 500 })
  }
}
