import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Tag as TagIcon, ChevronLeft, Eye } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate, getReadingTime } from '@/lib/utils'
import { markdownToHtml, sanitizeHtmlContent, extractHeadings } from '@/lib/markdown'
import MarkdownContent from '@/components/post/MarkdownContent'
import HtmlContent from '@/components/post/HtmlContent'
import CommentSection from '@/components/comment/CommentSection'
import ViewTracker from '@/components/post/ViewTracker'
import TableOfContents from '@/components/post/TableOfContents'
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import ShareButtons from '@/components/post/ShareButtons'
import RelatedPosts from '@/components/post/RelatedPosts'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    preview?: string
  }>
}

async function getPost(slug: string, previewToken?: string) {
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

    if (!post) {
      return null
    }

    // Allow viewing if published, or if valid preview token is provided
    if (!post.published) {
      if (!previewToken || post.previewToken !== previewToken) {
        return null
      }
    }

    // View count is now tracked via client-side ViewTracker component
    // to prevent duplicate counting from prefetches and bots

    return { post, isPreview: !post.published }
  } catch {
    return null
  }
}

export async function generateMetadata({ params, searchParams }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const { preview } = await searchParams
  const decodedSlug = decodeURIComponent(slug)
  const result = await getPost(decodedSlug, preview)

  if (!result) {
    return {
      title: '文章不存在',
    }
  }

  const { post, isPreview } = result

  return {
    title: isPreview ? `[預覽] ${post.title}` : post.title,
    description: post.excerpt || undefined,
    // Don't index preview pages
    robots: isPreview ? { index: false, follow: false } : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { slug } = await params
  const { preview } = await searchParams
  const decodedSlug = decodeURIComponent(slug)
  const result = await getPost(decodedSlug, preview)

  if (!result) {
    notFound()
  }

  const { post, isPreview } = result
  const readingTime = getReadingTime(post.content)

  // Extract headings for TOC (only for markdown content)
  const headings = post.contentType === 'markdown' ? extractHeadings(post.content) : []

  // Convert markdown to HTML if needed, and sanitize
  const htmlContent = post.contentType === 'markdown'
    ? await markdownToHtml(post.content)
    : sanitizeHtmlContent(post.content)

  const showToc = headings.length >= 3 // Only show TOC if there are at least 3 headings

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const postUrl = `${baseUrl}/posts/${encodeURIComponent(post.slug)}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* JSON-LD Structured Data */}
      {!isPreview && (
        <>
          <ArticleJsonLd
            title={post.title}
            description={post.excerpt || undefined}
            url={postUrl}
            image={post.coverImage || undefined}
            datePublished={post.publishedAt?.toISOString()}
            dateModified={post.updatedAt.toISOString()}
            publisherName="My Blog"
          />
          <BreadcrumbJsonLd
            items={[
              { name: '首頁', url: baseUrl },
              { name: '文章', url: `${baseUrl}/posts` },
              { name: post.title, url: postUrl },
            ]}
          />
        </>
      )}

      {/* Track page view - only for published posts */}
      {!isPreview && <ViewTracker slug={decodedSlug} />}

      <div className="flex gap-8">
        {/* Main Content */}
        <article className={showToc ? 'flex-1 max-w-4xl' : 'max-w-4xl mx-auto'}>
          {/* Preview Banner */}
          {isPreview && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <Eye className="w-5 h-5" />
                <span className="font-medium">預覽模式</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                此文章尚未發布，僅供預覽使用。
              </p>
            </div>
          )}

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
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            {post.contentType === 'markdown' ? (
              <MarkdownContent content={htmlContent} />
            ) : (
              <HtmlContent content={htmlContent} />
            )}
          </div>

          {/* Share Buttons */}
          {!isPreview && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <ShareButtons url={postUrl} title={post.title} />
            </div>
          )}

          {/* Related Posts */}
          {!isPreview && (
            <RelatedPosts
              currentPostId={post.id}
              categoryId={post.categoryId}
              tagIds={post.tags.map((t) => t.id)}
            />
          )}

          {/* Comments */}
          <CommentSection postId={post.id} comments={post.comments} />
        </article>

        {/* Sidebar with TOC */}
        {showToc && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>
    </div>
  )
}
