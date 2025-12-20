import { Metadata } from 'next'
import { Search } from 'lucide-react'
import SearchForm from '@/components/search/SearchForm'
import PostList from '@/components/post/PostList'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: '搜尋文章',
  description: '搜尋部落格文章',
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

async function searchPosts(query: string) {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            excerpt: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        category: true,
        tags: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 20,
    })
    return posts
  } catch {
    return []
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const results = query ? await searchPosts(query) : []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Search className="w-8 h-8" />
          搜尋文章
        </h1>
      </div>

      <div className="mb-8">
        <SearchForm initialQuery={query} />
      </div>

      {query && (
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            搜尋「<span className="font-medium text-gray-900 dark:text-white">{query}</span>」
            的結果：{results.length} 篇文章
          </p>
        </div>
      )}

      {query ? (
        <PostList posts={results} emptyMessage="沒有找到相關文章" />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">輸入關鍵字開始搜尋</p>
        </div>
      )}
    </div>
  )
}
