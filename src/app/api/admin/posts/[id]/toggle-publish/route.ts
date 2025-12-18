import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
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
