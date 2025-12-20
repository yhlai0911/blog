import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Tag as TagIcon, ChevronLeft, Eye } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate, getReadingTime } from '@/lib/utils'
import { markdownToHtml, sanitizeHtmlContent } from '@/lib/markdown'
import MarkdownContent from '@/components/post/MarkdownContent'
import HtmlContent from '@/components/post/HtmlContent'
import CommentSection from '@/components/comment/CommentSection'
import ViewTracker from '@/components/post/ViewTracker'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getPost(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        comments: {
          where: {
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
        },
      },
    })

    if (!post || !post.published) {
      return null
    }

    // View count is now tracked via client-side ViewTracker component
    // to prevent duplicate counting from prefetches and bots

    return post
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: '文章不存在',
    }
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const readingTime = getReadingTime(post.content)

  // Convert markdown to HTML if needed, and sanitize
  const htmlContent = post.contentType === 'markdown'
    ? await markdownToHtml(post.content)
    : sanitizeHtmlContent(post.content)

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Track page view */}
      <ViewTracker slug={slug} />

      {/* Back Link */}
      <Link
        href="/posts"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        返回文章列表
      </Link>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        {/* Category */}
        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
          >
            {post.category.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {readingTime} 分鐘閱讀
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {post.viewCount} 次閱讀
          </span>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <TagIcon className="w-3 h-3" />
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
        {post.contentType === 'markdown' ? (
          <MarkdownContent content={htmlContent} />
        ) : (
          <HtmlContent content={htmlContent} />
        )}
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} comments={post.comments} />
    </article>
  )
}
