import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { requireAdmin } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'

interface GenerateMetadataRequest {
  title: string
  content: string
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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const body: GenerateMetadataRequest = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: '請提供文章標題和內容' },
        { status: 400 }
      )
    }

    // 取得現有的分類和標籤
    const [categories, tags] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
      prisma.tag.findMany({ select: { id: true, name: true, slug: true } }),
    ])

    const categoryList = categories.map(c => `${c.name} (ID: ${c.id})`).join(', ')
    const tagList = tags.map(t => `${t.name} (ID: ${t.id})`).join(', ')

    const systemPrompt = `你是一位專業的部落格 SEO 專家。根據文章標題和內容，幫助生成適合的元資料。

請以 JSON 格式回覆，包含以下欄位：
1. excerpt: 一段 100-150 字的文章摘要，吸引讀者點擊閱讀
2. categoryId: 從現有分類中選擇最適合的分類 ID（如果沒有適合的，回傳 null）
3. suggestedCategory: 如果現有分類都不適合，建議一個新分類名稱（否則為 null）
4. tagIds: 從現有標籤中選擇 1-3 個最相關的標籤 ID 陣列
5. suggestedTags: 建議 1-3 個新標籤名稱的陣列（如果現有標籤不足以描述文章）

現有分類：${categoryList || '（無）'}
現有標籤：${tagList || '（無）'}

回覆格式範例：
{
  "excerpt": "這是一篇關於...",
  "categoryId": "xxx-xxx",
  "suggestedCategory": null,
  "tagIds": ["id1", "id2"],
  "suggestedTags": ["新標籤1"]
}`

    const userPrompt = `文章標題：${title}

文章內容：
${content.substring(0, 2000)}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      return NextResponse.json(
        { error: 'AI 未能生成內容' },
        { status: 500 }
      )
    }

    const metadata = JSON.parse(responseContent)

    return NextResponse.json({
      success: true,
      metadata: {
        excerpt: metadata.excerpt || '',
        categoryId: metadata.categoryId || null,
        suggestedCategory: metadata.suggestedCategory || null,
        tagIds: metadata.tagIds || [],
        suggestedTags: metadata.suggestedTags || [],
      },
      usage: completion.usage,
    })
  } catch (error) {
    console.error('AI Metadata Generation Error:', error)

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API 錯誤: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: '生成過程發生錯誤' },
      { status: 500 }
    )
  }
}
