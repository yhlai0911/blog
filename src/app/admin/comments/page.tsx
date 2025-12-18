import { Check, X, Trash2 } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import CommentActionButton from '@/components/admin/CommentActionButton'

async function getComments() {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        post: {
          select: { title: true, slug: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return comments
  } catch {
    return []
  }
}

export default async function AdminCommentsPage() {
  const comments = await getComments()
  const pendingComments = comments.filter((c) => !c.approved)
  const approvedComments = comments.filter((c) => c.approved)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">評論管理</h1>

      {/* Pending Comments */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            待審核評論 ({pendingComments.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingComments.length === 0 ? (
            <p className="p-6 text-center text-gray-500">暫無待審核評論</p>
          ) : (
            pendingComments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.author}
                      </span>
                      {comment.email && (
                        <span className="text-sm text-gray-500">
                          ({comment.email})
                        </span>
                      )}
                      <span className="text-sm text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <p className="text-sm text-gray-500">
                      文章：{comment.post.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CommentActionButton
                      commentId={comment.id}
                      action="approve"
                      icon={<Check className="w-4 h-4" />}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="批准"
                    />
                    <CommentActionButton
                      commentId={comment.id}
                      action="delete"
                      icon={<Trash2 className="w-4 h-4" />}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="刪除"
                      confirm
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Approved Comments */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            已批准評論 ({approvedComments.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {approvedComments.length === 0 ? (
            <p className="p-6 text-center text-gray-500">暫無評論</p>
          ) : (
            approvedComments.slice(0, 20).map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.author}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <p className="text-sm text-gray-500">
                      文章：{comment.post.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CommentActionButton
                      commentId={comment.id}
                      action="reject"
                      icon={<X className="w-4 h-4" />}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                      title="取消批准"
                    />
                    <CommentActionButton
                      commentId={comment.id}
                      action="delete"
                      icon={<Trash2 className="w-4 h-4" />}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="刪除"
                      confirm
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
