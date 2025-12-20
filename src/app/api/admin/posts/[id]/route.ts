import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Post fetch error:', error)
    return NextResponse.json(
      { error: '獲取文章失敗' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const { id } = await params
    const body = await request.json()
    const {
      title,
      slug,
      content,
      contentType,
      excerpt,
      coverImage,
      categoryId,
      tagIds,
      published,
      featured,
    } = body

    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    // Check if slug is taken by another post
    if (slug !== existingPost.slug) {
      const slugExists = await prisma.post.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: '此 slug 已被使用' },
          { status: 400 }
        )
      }
    }

    // Determine publishedAt
    let publishedAt = existingPost.publishedAt
    if (published && !existingPost.published) {
      publishedAt = new Date()
    } else if (!published) {
      publishedAt = null
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        contentType,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        categoryId: categoryId || null,
        published,
        featured,
        publishedAt,
        tags: {
          set: tagIds?.map((tagId: string) => ({ id: tagId })) || [],
        },
      },
      include: {
        category: true,
        tags: true,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Post update error:', error)
    return NextResponse.json(
      { error: '更新文章失敗' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const { id } = await params

    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Post delete error:', error)
    return NextResponse.json(
      { error: '刪除文章失敗' },
      { status: 500 }
    )
  }
}
