'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react'

interface AIRewriteModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (content: string) => void
  currentContent: string
  currentTitle: string
  contentType: 'markdown' | 'html'
}

interface RewriteOptions {
  improveFlow: boolean
  seoOptimize: boolean
  shorten: boolean
  expand: boolean
}

export default function AIRewriteModal({
  isOpen,
  onClose,
  onApply,
  currentContent,
  currentTitle,
  contentType,
}: AIRewriteModalProps) {
  const [options, setOptions] = useState<RewriteOptions>({
    improveFlow: true,
    seoOptimize: true,
    shorten: false,
    expand: false,
  })
  const [customPrompt, setCustomPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rewrittenContent, setRewrittenContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  if (!isOpen) return null

  const handleRewrite = async () => {
    if (!currentContent.trim()) {
      setError('請先輸入內容再進行改寫')
      return
    }

    setIsLoading(true)
    setError('')
    setRewrittenContent('')

    try {
      const response = await fetch('/api/admin/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentContent,
          title: currentTitle,
          options,
          customPrompt,
          contentType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '改寫失敗')
      }

      setRewrittenContent(data.content)
      setShowPreview(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '改寫過程發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = () => {
    onApply(rewrittenContent)
    handleClose()
  }

  const handleClose = () => {
    setRewrittenContent('')
    setShowPreview(false)
    setError('')
    onClose()
  }

  const optionItems = [
    { key: 'improveFlow', label: '改善流暢度', desc: '讓文章更通順易讀' },
    { key: 'seoOptimize', label: 'SEO 優化', desc: '優化關鍵字與標題結構' },
    { key: 'shorten', label: '精簡內容', desc: '移除冗詞，保留重點' },
    { key: 'expand', label: '擴充內容', desc: '補充更多細節說明' },
  ] as const

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">AI 內容改寫</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {!showPreview ? (
              <>
                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    優化選項
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {optionItems.map((item) => (
                      <label
                        key={item.key}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          options[item.key]
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={options[item.key]}
                          onChange={(e) =>
                            setOptions({ ...options, [item.key]: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自訂要求（選填）
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="例如：加入更多程式碼範例、使用更專業的術語、針對初學者簡化說明..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                  />
                </div>

                {/* Content Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目前內容預覽
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">
                      {currentContent || '（無內容）'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              /* Preview Rewritten Content */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  改寫結果預覽
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {rewrittenContent}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
            {!showPreview ? (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleRewrite}
                  disabled={isLoading || !currentContent.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      改寫中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      開始改寫
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  重新改寫
                </button>
                <button
                  onClick={handleApply}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  套用改寫結果
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
