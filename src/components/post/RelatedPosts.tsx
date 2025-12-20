import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

interface RelatedPostsProps {
  currentPostId: string
  categoryId: string | null
  tagIds: string[]
}

async function getRelatedPosts(
  currentPostId: string,
  categoryId: string | null,
  tagIds: string[]
) {
  // Try to find posts with same tags first
  if (tagIds.length > 0) {
    const postsWithSameTags = await prisma.post.findMany({
      where: {
        id: { not: currentPostId },
        published: true,
        tags: {
          some: {
            id: { in: tagIds },
          },
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        publishedAt: true,
        excerpt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    })

    if (postsWithSameTags.length >= 3) {
      return postsWithSameTags
    }

    // If not enough, supplement with category posts
    if (categoryId && postsWithSameTags.length < 3) {
      const existingIds = postsWithSameTags.map((p) => p.id)
      const categoryPosts = await prisma.post.findMany({
        where: {
          id: { notIn: [currentPostId, ...existingIds] },
          published: true,
          categoryId,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          publishedAt: true,
          excerpt: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: 3 - postsWithSameTags.length,
      })

      return [...postsWithSameTags, ...categoryPosts]
    }

    return postsWithSameTags
  }

  // Fall back to category posts
  if (categoryId) {
    return prisma.post.findMany({
      where: {
        id: { not: currentPostId },
        published: true,
        categoryId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        publishedAt: true,
        excerpt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    })
  }

  // Last resort: just get recent posts
  return prisma.post.findMany({
    where: {
      id: { not: currentPostId },
      published: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      publishedAt: true,
      excerpt: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  })
}

export default async function RelatedPosts({
  currentPostId,
  categoryId,
  tagIds,
}: RelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(currentPostId, categoryId, tagIds)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-12">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">相關文章</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${encodeURIComponent(post.slug)}`}
            className="group block"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-gray-100">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
              {post.title}
            </h4>
            {post.publishedAt && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                {formatDate(post.publishedAt)}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
