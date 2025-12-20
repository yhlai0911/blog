'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'

interface Settings {
  id: string
  siteName: string
  siteDescription: string
  siteUrl: string
  socialTwitter: string | null
  socialGithub: string | null
  socialLinkedin: string | null
  seoDefaultTitle: string | null
  seoDefaultDesc: string | null
}

interface SettingsFormProps {
  settings: Settings
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    siteUrl: settings.siteUrl,
    socialTwitter: settings.socialTwitter || '',
    socialGithub: settings.socialGithub || '',
    socialLinkedin: settings.socialLinkedin || '',
    seoDefaultTitle: settings.seoDefaultTitle || '',
    seoDefaultDesc: settings.seoDefaultDesc || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '更新失敗')
      }

      setMessage({ type: 'success', text: '設定已儲存' })
      router.refresh()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '更新失敗',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Basic Info Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
              網站名稱
            </label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
              網站描述
            </label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              value={formData.siteDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 mb-1">
              網站網址
            </label>
            <input
              type="url"
              id="siteUrl"
              name="siteUrl"
              value={formData.siteUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">社群連結</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="socialTwitter" className="block text-sm font-medium text-gray-700 mb-1">
              Twitter / X
            </label>
            <input
              type="url"
              id="socialTwitter"
              name="socialTwitter"
              value={formData.socialTwitter}
              onChange={handleChange}
              placeholder="https://twitter.com/username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="socialGithub" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub
            </label>
            <input
              type="url"
              id="socialGithub"
              name="socialGithub"
              value={formData.socialGithub}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="socialLinkedin" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              id="socialLinkedin"
              name="socialLinkedin"
              value={formData.socialLinkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO 預設值</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="seoDefaultTitle" className="block text-sm font-medium text-gray-700 mb-1">
              預設 SEO 標題
            </label>
            <input
              type="text"
              id="seoDefaultTitle"
              name="seoDefaultTitle"
              value={formData.seoDefaultTitle}
              onChange={handleChange}
              placeholder="用於沒有自訂 SEO 標題的頁面"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="seoDefaultDesc" className="block text-sm font-medium text-gray-700 mb-1">
              預設 SEO 描述
            </label>
            <textarea
              id="seoDefaultDesc"
              name="seoDefaultDesc"
              value={formData.seoDefaultDesc}
              onChange={handleChange}
              rows={3}
              placeholder="用於沒有自訂 SEO 描述的頁面"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              儲存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              儲存設定
            </>
          )}
        </button>
      </div>
    </form>
  )
}
