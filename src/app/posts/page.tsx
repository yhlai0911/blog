import { Metadata } from 'next'
import PostList from '@/components/post/PostList'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: '所有文章',
  description: '瀏覽所有部落格文章',
}

interface PostsPageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    tag?: string
  }>
}

async function getPosts(page: number = 1, pageSize: number = 12) {
  try {
    const skip = (page - 1) * pageSize

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
        skip,
        take: pageSize,
      }),
      prisma.post.count({
        where: {
          published: true,
        },
      }),
    ])

    return {
      posts,
      total,
      totalPages: Math.ceil(total / pageSize),
    }
  } catch {
    return {
      posts: [],
      total: 0,
      totalPages: 0,
    }
  }
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const { posts, total, totalPages } = await getPosts(page)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">所有文章</h1>
        <p className="mt-2 text-gray-600">共 {total} 篇文章</p>
      </div>

      <PostList posts={posts} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <a
              key={pageNum}
              href={`/posts?page=${pageNum}`}
              className={`px-4 py-2 rounded-lg ${
                pageNum === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {pageNum}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
