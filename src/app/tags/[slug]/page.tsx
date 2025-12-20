import { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Tag as TagIcon } from 'lucide-react'
import PostList from '@/components/post/PostList'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface TagPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getTag(slug: string) {
  noStore()
  try {
    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        posts: {
          where: {
            published: true,
          },
          include: {
            category: true,
            tags: true,
          },
          orderBy: {
            publishedAt: 'desc',
          },
        },
        _count: {
          select: { posts: { where: { published: true } } },
        },
      },
    })
    return tag
  } catch (error) {
    console.error('Error fetching tag:', error)
    return null
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTag(slug)

  if (!tag) {
    return {
      title: '標籤不存在',
    }
  }

  return {
    title: `#${tag.name}`,
    description: `標籤 ${tag.name} 下的所有文章`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  const tag = await getTag(slug)

  if (!tag) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/tags"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        返回標籤列表
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TagIcon className="w-8 h-8" />
          #{tag.name}
        </h1>
        <p className="mt-2 text-gray-500">共 {tag._count.posts} 篇文章</p>
      </div>

      <PostList posts={tag.posts} emptyMessage="此標籤暫無文章" />
    </div>
  )
}
