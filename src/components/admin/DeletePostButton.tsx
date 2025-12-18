'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeletePostButtonProps {
  postId: string
  title: string
}

export default function DeletePostButton({ postId, title }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`確定要刪除「${title}」嗎？此操作無法復原。`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('刪除失敗')
      }

      router.refresh()
    } catch (error) {
      alert('刪除失敗，請稍後再試')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
      title="刪除"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
