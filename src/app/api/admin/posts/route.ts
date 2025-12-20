import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { createPostSchema, validateRequest } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const body = await request.json()

    // Validate request body
    const validation = validateRequest(createPostSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { title, slug, content, contentType, excerpt, coverImage, categoryId, tagIds, published, featured } =
      validation.data

    const finalSlug = slug || slugify(title)

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: finalSlug },
    })

    if (existingPost) {
      return NextResponse.json({ error: '此 slug 已存在' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        content,
        contentType: contentType || 'markdown',
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        categoryId: categoryId || null,
        published: published || false,
        featured: featured || false,
        publishedAt: published ? new Date() : null,
        tags: tagIds?.length
          ? {
              connect: tagIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: true,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json({ error: '建立文章失敗' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const posts = await prisma.post.findMany({
      include: {
        category: true,
        tags: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json({ error: '獲取文章失敗' }, { status: 500 })
  }
}
