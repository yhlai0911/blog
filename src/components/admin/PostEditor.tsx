'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, ArrowLeft, Sparkles, Image, Wand2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'
import { markdownToHtml } from '@/lib/markdown'
import AIRewriteModal from './AIRewriteModal'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface Post {
  id: string
  title: string
  slug: string
  content: string
  contentType: string
  excerpt: string | null
  coverImage: string | null
  categoryId: string | null
  tags: Tag[]
  published: boolean
  featured: boolean
  scheduledAt: Date | string | null
  previewToken: string | null
}

interface PostEditorProps {
  post?: Post
  categories: Category[]
  tags: Tag[]
}

// Helper to format date for datetime-local input
function formatDateForInput(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 16)
}

export default function PostEditor({ post, categories, tags }: PostEditorProps) {
  const router = useRouter()
  const isEditing = !!post

  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    content: post?.content || '',
    contentType: post?.contentType || 'markdown',
    excerpt: post?.excerpt || '',
    coverImage: post?.coverImage || '',
    categoryId: post?.categoryId || '',
    tagIds: post?.tags.map((t) => t.id) || [],
    published: post?.published || false,
    featured: post?.featured || false,
    scheduledAt: formatDateForInput(post?.scheduledAt || null),
  })

  // Publish mode: 'now' | 'schedule' | 'draft'
  const [publishMode, setPublishMode] = useState<'now' | 'schedule' | 'draft'>(
    post?.published ? 'now' : post?.scheduledAt ? 'schedule' : 'draft'
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [error, setError] = useState('')
  const [showAIModal, setShowAIModal] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false)
  const [imageStyle, setImageStyle] = useState<'realistic' | 'illustration' | 'abstract' | 'minimal'>('minimal')
  const [imageWarning, setImageWarning] = useState('')

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && formData.title && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: slugify(formData.title) }))
    }
  }, [formData.title, isEditing, formData.slug])

  // Generate preview
  useEffect(() => {
    if (showPreview && formData.contentType === 'markdown') {
      markdownToHtml(formData.content).then(setPreviewHtml)
    }
  }, [showPreview, formData.content, formData.contentType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const url = isEditing
        ? `/api/admin/posts/${post.id}`
        : '/api/admin/posts'

      // Prepare submit data based on publish mode
      const submitData = {
        ...formData,
        published: publishMode === 'now',
        scheduledAt: publishMode === 'schedule' ? formData.scheduledAt : null,
      }

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '儲存失敗')
      }

      router.push('/admin/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存失敗')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }))
  }

  const handleAIRewriteApply = (rewrittenContent: string) => {
    setFormData((prev) => ({ ...prev, content: rewrittenContent }))
  }

  const handleGenerateImage = async () => {
    if (!formData.title.trim()) {
      setError('請先輸入文章標題')
      return
    }
    setIsGeneratingImage(true)
    setError('')
    setImageWarning('')
    try {
      const response = await fetch('/api/admin/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          style: imageStyle,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '圖片生成失敗')
      }
      setFormData((prev) => ({ ...prev, coverImage: data.imageUrl }))
      // 如果圖片未持久化，顯示警告
      if (data.warning || data.persistent === false) {
        setImageWarning(data.warning || '圖片為臨時 URL，建議設定 IMGBB_API_KEY 以持久化儲存')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '圖片生成失敗')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleGenerateMetadata = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('請先輸入文章標題和內容')
      return
    }
    setIsGeneratingMetadata(true)
    setError('')
    try {
      const response = await fetch('/api/admin/ai/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '生成失敗')
      }
      const { metadata } = data
      setFormData((prev) => ({
        ...prev,
        excerpt: metadata.excerpt || prev.excerpt,
        categoryId: metadata.categoryId || prev.categoryId,
        tagIds: metadata.tagIds?.length > 0 ? metadata.tagIds : prev.tagIds,
      }))
      // Show suggestions if any
      if (metadata.suggestedCategory || metadata.suggestedTags?.length > 0) {
        const suggestions: string[] = []
        if (metadata.suggestedCategory) {
          suggestions.push(`建議新增分類：${metadata.suggestedCategory}`)
        }
        if (metadata.suggestedTags?.length > 0) {
          suggestions.push(`建議新增標籤：${metadata.suggestedTags.join('、')}`)
        }
        alert(suggestions.join('\n'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失敗')
    } finally {
      setIsGeneratingMetadata(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? '編輯' : '預覽'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? '儲存中...' : '儲存'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                標題 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="文章標題"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="url-friendly-slug"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                內容類型
              </label>
              <select
                value={formData.contentType}
                onChange={(e) =>
                  setFormData({ ...formData, contentType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  內容 <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAIModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  AI 改寫
                </button>
              </div>
              {showPreview ? (
                <div
                  className="w-full min-h-[400px] p-4 border border-gray-300 rounded-lg bg-gray-50 prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      formData.contentType === 'markdown'
                        ? previewHtml
                        : formData.content,
                  }}
                />
              ) : (
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full h-[400px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                  placeholder={
                    formData.contentType === 'markdown'
                      ? '使用 Markdown 格式撰寫...'
                      : '輸入 HTML 內容...'
                  }
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  摘要
                </label>
                <button
                  type="button"
                  onClick={handleGenerateMetadata}
                  disabled={isGeneratingMetadata || !formData.title || !formData.content}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingMetadata ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      AI 生成摘要/分類/標籤
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="文章摘要（選填）"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">發布設定</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishMode"
                  checked={publishMode === 'draft'}
                  onChange={() => setPublishMode('draft')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">儲存為草稿</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishMode"
                  checked={publishMode === 'now'}
                  onChange={() => setPublishMode('now')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">立即發布</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishMode"
                  checked={publishMode === 'schedule'}
                  onChange={() => setPublishMode('schedule')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">排程發布</span>
              </label>

              {publishMode === 'schedule' && (
                <div className="ml-6 mt-2">
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required={publishMode === 'schedule'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    選擇發布時間
                  </p>
                </div>
              )}
            </div>

            <hr className="border-gray-200" />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">設為精選</span>
            </label>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">封面圖片</h3>
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !formData.title}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Image className="w-4 h-4" />
                    AI 生成
                  </>
                )}
              </button>
            </div>
            <select
              value={imageStyle}
              onChange={(e) => setImageStyle(e.target.value as typeof imageStyle)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="minimal">極簡風格</option>
              <option value="realistic">寫實風格</option>
              <option value="illustration">插畫風格</option>
              <option value="abstract">抽象風格</option>
            </select>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) =>
                setFormData({ ...formData, coverImage: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="https://example.com/image.jpg"
            />
            {imageWarning && (
              <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                ⚠️ {imageWarning}
              </div>
            )}
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                alt="封面預覽"
                className="w-full aspect-video object-cover rounded-lg"
              />
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">分類</h3>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">選擇分類</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">標籤</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    formData.tagIds.includes(tag.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-gray-500">尚無標籤</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Rewrite Modal */}
      <AIRewriteModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApply={handleAIRewriteApply}
        currentContent={formData.content}
        currentTitle={formData.title}
        contentType={formData.contentType as 'markdown' | 'html'}
      />
    </form>
  )
}
