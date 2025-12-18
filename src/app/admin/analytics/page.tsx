import { BarChart3, TrendingUp, Eye, FileText } from 'lucide-react'
import prisma from '@/lib/prisma'

async function getAnalytics() {
  try {
    // Get date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get top posts by views
    const topPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        publishedAt: true,
      },
    })

    // Get posts by category
    const postsByCategory = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: { where: { published: true } } },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
    })

    // Get total stats
    const totalViews = await prisma.post.aggregate({
      _sum: { viewCount: true },
    })

    const totalPosts = await prisma.post.count({ where: { published: true } })
    const totalComments = await prisma.comment.count({ where: { approved: true } })

    // Get recent analytics (if tracking enabled)
    const recentAnalytics = await prisma.analytics.findMany({
      where: {
        createdAt: { gte: thisWeek },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Group analytics by date
    const dailyViews: Record<string, number> = {}
    recentAnalytics.forEach((a) => {
      const date = a.createdAt.toISOString().split('T')[0]
      dailyViews[date] = (dailyViews[date] || 0) + 1
    })

    return {
      topPosts,
      postsByCategory,
      totalViews: totalViews._sum.viewCount || 0,
      totalPosts,
      totalComments,
      dailyViews,
      recentPageViews: recentAnalytics.length,
    }
  } catch {
    return {
      topPosts: [],
      postsByCategory: [],
      totalViews: 0,
      totalPosts: 0,
      totalComments: 0,
      dailyViews: {},
      recentPageViews: 0,
    }
  }
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalytics()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 className="w-7 h-7" />
        數據分析
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">總瀏覽量</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">已發布文章</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalPosts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">近 7 天瀏覽</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.recentPageViews}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">熱門文章</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {analytics.topPosts.length === 0 ? (
              <p className="p-6 text-center text-gray-500">尚無數據</p>
            ) : (
              analytics.topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-500">/{post.slug}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {post.viewCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">瀏覽</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Posts by Category */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">分類統計</h2>
          </div>
          <div className="p-6">
            {analytics.postsByCategory.length === 0 ? (
              <p className="text-center text-gray-500">尚無分類</p>
            ) : (
              <div className="space-y-4">
                {analytics.postsByCategory.map((category) => {
                  const percentage =
                    analytics.totalPosts > 0
                      ? (category._count.posts / analytics.totalPosts) * 100
                      : 0

                  return (
                    <div key={category.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{category.name}</span>
                        <span className="text-gray-500">
                          {category._count.posts} 篇
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
