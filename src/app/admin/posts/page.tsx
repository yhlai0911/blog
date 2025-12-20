import Link from 'next/link'
import { Plus, Edit, Eye, EyeOff, Clock, ExternalLink } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import DeletePostButton from '@/components/admin/DeletePostButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        category: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return posts
  } catch {
    return []
  }
}

export default async function AdminPostsPage() {
  const posts = await getPosts()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增文章
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                標題
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分類
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                瀏覽
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  尚無文章
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">/{post.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.category?.name || '未分類'}
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        <Eye className="w-3 h-3" />
                        已發布
                      </span>
                    ) : post.scheduledAt ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          <Clock className="w-3 h-3" />
                          排程中
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(post.scheduledAt)}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                        <EyeOff className="w-3 h-3" />
                        草稿
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.viewCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!post.published && post.previewToken && (
                        <Link
                          href={`/posts/${post.slug}?preview=${post.previewToken}`}
                          target="_blank"
                          className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                          title="預覽"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <TogglePublishButton
                        postId={post.id}
                        published={post.published}
                      />
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="編輯"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeletePostButton postId={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
