import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Spam keywords blacklist
const SPAM_KEYWORDS = [
  'viagra',
  'casino',
  'lottery',
  'winner',
  'click here',
  'free money',
]

function isSpam(content: string): boolean {
  const lowerContent = content.toLowerCase()
  return SPAM_KEYWORDS.some((keyword) => lowerContent.includes(keyword))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, parentId, author, email, website, content } = body

    // Validation
    if (!postId || !author || !content) {
      return NextResponse.json(
        { error: '請填寫必要欄位' },
        { status: 400 }
      )
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    // Check for spam
    if (isSpam(content) || isSpam(author)) {
      return NextResponse.json(
        { error: '評論包含不當內容' },
        { status: 400 }
      )
    }

    // Check if parent comment exists (if replying)
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: '回覆的評論不存在' },
          { status: 404 }
        )
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        postId,
        parentId: parentId || null,
        author: author.trim(),
        email: email?.trim() || null,
        website: website?.trim() || null,
        content: content.trim(),
        approved: false, // Requires admin approval
      },
    })

    return NextResponse.json({
      success: true,
      message: '評論已提交，等待審核',
      comment: {
        id: comment.id,
        author: comment.author,
        createdAt: comment.createdAt,
      },
    })
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json(
      { error: '提交失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: '請提供文章 ID' },
        { status: 400 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        approved: true,
        parentId: null,
      },
      include: {
        replies: {
          where: {
            approved: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Comment fetch error:', error)
    return NextResponse.json(
      { error: '獲取評論失敗' },
      { status: 500 }
    )
  }
}
