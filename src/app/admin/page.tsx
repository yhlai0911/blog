import { FileText, MessageSquare, Eye, Users } from 'lucide-react'
import prisma from '@/lib/prisma'

async function getStats() {
  try {
    const [
      totalPosts,
      publishedPosts,
      totalComments,
      pendingComments,
      totalViews,
      recentPosts,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.post.aggregate({ _sum: { viewCount: true } }),
      prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { category: true },
      }),
    ])

    return {
      totalPosts,
      publishedPosts,
      totalComments,
      pendingComments,
      totalViews: totalViews._sum.viewCount || 0,
      recentPosts,
    }
  } catch {
    return {
      totalPosts: 0,
      publishedPosts: 0,
      totalComments: 0,
      pendingComments: 0,
      totalViews: 0,
      recentPosts: [],
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">總文章數</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPosts}
              </p>
              <p className="text-xs text-gray-500">
                已發布：{stats.publishedPosts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">總評論數</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalComments}
              </p>
              <p className="text-xs text-gray-500">
                待審核：{stats.pendingComments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">總瀏覽量</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">草稿文章</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPosts - stats.publishedPosts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">最近文章</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentPosts.length === 0 ? (
            <p className="p-6 text-center text-gray-500">尚無文章</p>
          ) : (
            stats.recentPosts.map((post) => (
              <div key={post.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500">
                    {post.category?.name || '未分類'} •{' '}
                    {new Date(post.createdAt).toLocaleDateString('zh-TW')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {post.published ? '已發布' : '草稿'}
                  </span>
                  <a
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    編輯
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
