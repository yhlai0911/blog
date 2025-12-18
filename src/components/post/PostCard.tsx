import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Tag as TagIcon } from 'lucide-react'
import { formatDate, getReadingTime, truncate } from '@/lib/utils'
import type { Post, Tag, Category } from '@/types'

interface PostCardProps {
  post: Post & {
    category?: Category | null
    tags?: Tag[]
  }
}

export default function PostCard({ post }: PostCardProps) {
  const readingTime = getReadingTime(post.content)

  return (
    <article className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      {/* Cover Image */}
      {post.coverImage && (
        <Link href={`/posts/${post.slug}`} className="block aspect-video relative overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}

      <div className="p-6">
        {/* Category */}
        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700 mb-2"
          >
            {post.category.name}
          </Link>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          <Link href={`/posts/${post.slug}`}>
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-2">
            {truncate(post.excerpt, 120)}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {readingTime} 分鐘閱讀
          </span>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <TagIcon className="w-3 h-3" />
                {tag.name}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
