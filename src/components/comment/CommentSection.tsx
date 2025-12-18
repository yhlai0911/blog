'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { MessageCircle, Reply, User } from 'lucide-react'
import CommentForm from './CommentForm'

interface Comment {
  id: string
  content: string
  author: string
  email: string | null
  website: string | null
  createdAt: Date
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

function CommentItem({ comment, postId, depth = 0 }: { comment: Comment; postId: string; depth?: number }) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{comment.author}</span>
              <span className="text-sm text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Reply className="w-4 h-4" />
              回覆
            </button>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-4 ml-8">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => setShowReplyForm(false)}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CommentSection({ postId, comments }: CommentSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <section className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        評論 ({comments.length})
      </h2>

      {/* Comment Form */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">發表評論</h3>
        <CommentForm
          postId={postId}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      </div>

      {/* Comments List */}
      <div className="space-y-6" key={refreshKey}>
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            還沒有評論，成為第一個留言的人吧！
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))
        )}
      </div>
    </section>
  )
}
