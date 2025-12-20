import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// This endpoint is meant to be called by a cron job (e.g., Vercel Cron)
// to publish posts that are scheduled for publication

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Find all posts that are scheduled and due for publication
    const postsToPublish = await prisma.post.findMany({
      where: {
        published: false,
        scheduledAt: {
          lte: now,
        },
      },
    })

    if (postsToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts to publish',
        count: 0,
      })
    }

    // Publish each post
    const publishedIds = await Promise.all(
      postsToPublish.map(async (post) => {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            published: true,
            publishedAt: post.scheduledAt || now,
            scheduledAt: null,
            previewToken: null,
          },
        })
        return post.id
      })
    )

    console.log(`Published ${publishedIds.length} scheduled posts:`, publishedIds)

    return NextResponse.json({
      success: true,
      message: `Published ${publishedIds.length} posts`,
      count: publishedIds.length,
      publishedIds,
    })
  } catch (error) {
    console.error('Cron publish error:', error)
    return NextResponse.json(
      { error: 'Failed to publish scheduled posts' },
      { status: 500 }
    )
  }
}

// Vercel Cron configuration
export const dynamic = 'force-dynamic'
