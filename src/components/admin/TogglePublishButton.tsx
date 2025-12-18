'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

interface TogglePublishButtonProps {
  postId: string
  published: boolean
}

export default function TogglePublishButton({ postId, published }: TogglePublishButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/posts/${postId}/toggle-publish`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('更新失敗')
      }

      router.refresh()
    } catch (error) {
      alert('更新失敗，請稍後再試')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      className={`p-2 transition-colors disabled:opacity-50 ${
        published
          ? 'text-green-600 hover:text-yellow-600'
          : 'text-yellow-600 hover:text-green-600'
      }`}
      title={published ? '取消發布' : '發布'}
    >
      {published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  )
}
