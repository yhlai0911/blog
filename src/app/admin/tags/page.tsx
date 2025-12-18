'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Tag {
  id: string
  name: string
  slug: string
  _count: { posts: number }
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [formData, setFormData] = useState({ name: '', slug: '' })
  const router = useRouter()

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/tags')
      const data = await res.json()
      setTags(data.tags || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId
        ? `/api/admin/tags/${editingId}`
        : '/api/admin/tags'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({ name: '', slug: '' })
        setEditingId(null)
        setShowNew(false)
        fetchTags()
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setFormData({ name: tag.name, slug: tag.slug })
    setShowNew(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此標籤嗎？')) return
    try {
      await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
      fetchTags()
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowNew(false)
    setFormData({ name: '', slug: '' })
  }

  if (isLoading) {
    return <div className="p-6">載入中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">標籤管理</h1>
        <button
          onClick={() => { setShowNew(true); setEditingId(null) }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          新增標籤
        </button>
      </div>

      {(showNew || editingId) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">
            {editingId ? '編輯標籤' : '新增標籤'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名稱</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              儲存
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {tags.length === 0 ? (
              <p className="text-gray-500">尚無標籤</p>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full"
                >
                  <span className="font-medium text-gray-900">#{tag.name}</span>
                  <span className="text-sm text-gray-500">({tag._count.posts})</span>
                  <button
                    onClick={() => handleEdit(tag)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
