import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

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

    if (!title || !content) {
      return NextResponse.json(
        { error: '標題和內容為必填' },
        { status: 400 }
      )
    }

    const finalSlug = slug || slugify(title)

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: finalSlug },
    })

    if (existingPost) {
      return NextResponse.json(
        { error: '此 slug 已存在' },
        { status: 400 }
      )
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
    return NextResponse.json(
      { error: '建立文章失敗' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
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
    return NextResponse.json(
      { error: '獲取文章失敗' },
      { status: 500 }
    )
  }
}
