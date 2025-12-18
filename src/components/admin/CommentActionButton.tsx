'use client'

import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface CommentActionButtonProps {
  commentId: string
  action: 'approve' | 'reject' | 'delete'
  icon: ReactNode
  className: string
  title: string
  confirm?: boolean
}

export default function CommentActionButton({
  commentId,
  action,
  icon,
  className,
  title,
  confirm = false,
}: CommentActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAction = async () => {
    if (confirm && !window.confirm('確定要執行此操作嗎？')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error('操作失敗')
      }

      router.refresh()
    } catch (error) {
      alert('操作失敗，請稍後再試')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleAction}
      disabled={isLoading}
      className={`${className} disabled:opacity-50`}
      title={title}
    >
      {icon}
    </button>
  )
}
