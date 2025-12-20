import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ slug: string }>
}

// Bot detection patterns
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /lighthouse/i,
  /pagespeed/i,
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baiduspider/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /slackbot/i,
  /discordbot/i,
  /telegrambot/i,
  /whatsapp/i,
]

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent))
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const userAgent = request.headers.get('user-agent')

    // Ignore bots and crawlers
    if (isBot(userAgent)) {
      return NextResponse.json({ success: true, counted: false, reason: 'bot' })
    }

    // Check for prefetch requests
    const purpose = request.headers.get('purpose')
    const secPurpose = request.headers.get('sec-purpose')
    if (purpose === 'prefetch' || secPurpose === 'prefetch') {
      return NextResponse.json({ success: true, counted: false, reason: 'prefetch' })
    }

    // Find the post
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, published: true },
    })

    if (!post || !post.published) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ success: true, counted: true })
  } catch (error) {
    console.error('View count error:', error)
    return NextResponse.json({ error: '記錄失敗' }, { status: 500 })
  }
}
