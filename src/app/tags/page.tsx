import { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { Tag } from 'lucide-react'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '標籤雲',
  description: '按標籤瀏覽部落格文章',
}

async function getTags() {
  noStore()
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: { where: { published: true } } },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    return tags.filter((tag) => tag._count.posts > 0)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
  }
}

export default async function TagsPage() {
  const tags = await getTags()

  // Calculate tag sizes based on post count
  const maxCount = Math.max(...tags.map((t) => t._count.posts), 1)
  const getTagSize = (count: number) => {
    const ratio = count / maxCount
    if (ratio > 0.8) return 'text-2xl font-bold'
    if (ratio > 0.6) return 'text-xl font-semibold'
    if (ratio > 0.4) return 'text-lg font-medium'
    if (ratio > 0.2) return 'text-base'
    return 'text-sm'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-8 h-8" />
          標籤雲
        </h1>
        <p className="mt-2 text-gray-600">按標籤瀏覽文章</p>
      </div>

      {tags.length === 0 ? (
        <p className="text-center text-gray-500 py-12">暫無標籤</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex flex-wrap gap-4 justify-center">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className={`${getTagSize(tag._count.posts)} text-gray-700 hover:text-blue-600 transition-colors`}
              >
                #{tag.name}
                <span className="text-gray-400 text-sm ml-1">
                  ({tag._count.posts})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
