import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    const newPublished = !post.published

    await prisma.post.update({
      where: { id },
      data: {
        published: newPublished,
        publishedAt: newPublished ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, published: newPublished })
  } catch (error) {
    console.error('Toggle publish error:', error)
    return NextResponse.json(
      { error: '操作失敗' },
      { status: 500 }
    )
  }
}
