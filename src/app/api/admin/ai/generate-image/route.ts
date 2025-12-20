import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { requireAdmin } from '@/lib/auth-utils'

interface GenerateImageRequest {
  title: string
  content?: string
  style?: 'realistic' | 'illustration' | 'abstract' | 'minimal'
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

    const body: GenerateImageRequest = await request.json()
    const { title, content, style = 'minimal' } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: '請提供文章標題' },
        { status: 400 }
      )
    }

    // 根據風格設定不同的提示詞
    const stylePrompts: Record<string, string> = {
      realistic: 'photorealistic, high quality photograph, professional photography',
      illustration: 'digital illustration, artistic, colorful, modern illustration style',
      abstract: 'abstract art, geometric shapes, modern design, artistic',
      minimal: 'minimalist design, clean, simple, modern, subtle colors, professional blog header',
    }

    // 構建圖片生成提示詞
    const contentSummary = content
      ? content.substring(0, 200).replace(/[#*`\[\]]/g, '')
      : ''

    const imagePrompt = `Create a blog cover image for an article titled "${title}". ${contentSummary ? `The article is about: ${contentSummary}` : ''} Style: ${stylePrompts[style]}. The image should be suitable as a blog header/cover image, visually appealing, and relevant to the topic. No text in the image.`

    // 使用 DALL-E 3 生成圖片（性價比較高）
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1792x1024', // 寬版比例適合部落格封面
      quality: 'standard',
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'AI 未能生成圖片' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    })
  } catch (error) {
    console.error('AI Image Generation Error:', error)

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API 錯誤: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: '圖片生成過程發生錯誤' },
      { status: 500 }
    )
  }
}
