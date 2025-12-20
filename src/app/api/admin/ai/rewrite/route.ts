import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { requireAdmin } from '@/lib/auth-utils'

interface RewriteRequest {
  content: string
  title?: string
  options: {
    improveFlow: boolean      // 改善文章流暢度
    seoOptimize: boolean      // SEO 優化
    shorten: boolean          // 縮短/精簡內容
    expand: boolean           // 擴充內容
  }
  customPrompt?: string       // 自訂要求
  contentType: 'markdown' | 'html'
}

export async function POST(request: Request) {
  try {
    // 驗證管理員權限
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    // 檢查 API Key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: '未設定 OPENAI_API_KEY 環境變數' },
        { status: 500 }
      )
    }

    // 在函數內部建立 OpenAI 客戶端
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const body: RewriteRequest = await request.json()
    const { content, title, options, customPrompt, contentType } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '內容不能為空' },
        { status: 400 }
      )
    }

    // 構建優化指令
    const optimizationInstructions: string[] = []

    if (options.improveFlow) {
      optimizationInstructions.push('改善文章的流暢度和可讀性，讓句子更通順、段落銜接更自然')
    }

    if (options.seoOptimize) {
      optimizationInstructions.push('優化 SEO：適當加入關鍵字、優化標題結構（H2、H3）、增加內部連結建議位置')
    }

    if (options.shorten) {
      optimizationInstructions.push('精簡內容：移除冗詞贅字，保留重點資訊，讓文章更簡潔有力')
    }

    if (options.expand) {
      optimizationInstructions.push('擴充內容：補充更多細節、範例或說明，讓內容更完整豐富')
    }

    if (customPrompt && customPrompt.trim()) {
      optimizationInstructions.push(`額外要求：${customPrompt}`)
    }

    // 如果沒有選擇任何選項，使用預設的全面優化
    if (optimizationInstructions.length === 0) {
      optimizationInstructions.push('全面優化文章：改善流暢度、優化結構、讓內容更專業易讀')
    }

    const systemPrompt = `你是一位專業的部落格文章編輯和內容優化專家。你的任務是根據使用者的要求改寫和優化文章內容。

規則：
1. 保持原文的核心意思和主題不變
2. 輸出格式必須與輸入格式一致（${contentType === 'markdown' ? 'Markdown' : 'HTML'}）
3. 保留原有的程式碼區塊、連結、圖片等元素
4. 使用繁體中文
5. 直接輸出改寫後的內容，不要加入任何解釋或前言`

    const userPrompt = `請根據以下要求改寫這篇文章：

${title ? `文章標題：${title}` : ''}

優化要求：
${optimizationInstructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

原文內容：
${content}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    })

    const rewrittenContent = completion.choices[0]?.message?.content

    if (!rewrittenContent) {
      return NextResponse.json(
        { error: 'AI 未能生成內容' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: rewrittenContent,
      usage: completion.usage,
    })
  } catch (error) {
    console.error('AI Rewrite Error:', error)

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API 錯誤: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: '改寫過程發生錯誤' },
      { status: 500 }
    )
  }
}
