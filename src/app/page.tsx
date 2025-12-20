import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PostList from '@/components/post/PostList'
import prisma from '@/lib/prisma'

async function getFeaturedPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        featured: true,
      },
      include: {
        category: true,
        tags: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 3,
    })
    return posts
  } catch {
    return []
  }
}

async function getRecentPosts() {
  try {
    const posts = await prisma.post.findMany({
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
      take: 6,
    })
    return posts
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    return categories
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featuredPosts, recentPosts, categories] = await Promise.all([
    getFeaturedPosts(),
    getRecentPosts(),
    getCategories(),
  ])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            歡迎來到我的部落格
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            分享技術心得、生活點滴與學習筆記
          </p>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            瀏覽文章
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">精選文章</h2>
              <Link
                href="/posts?featured=true"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                查看更多 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <PostList posts={featuredPosts} />
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">最新文章</h2>
            <Link
              href="/posts"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <PostList posts={recentPosts} emptyMessage="尚未發布任何文章" />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">文章分類</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {category._count.posts} 篇文章
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
