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

    const tempImageUrl = response.data?.[0]?.url

    if (!tempImageUrl) {
      return NextResponse.json(
        { error: 'AI 未能生成圖片' },
        { status: 500 }
      )
    }

    // 如果有設定 IMGBB_API_KEY，將圖片上傳到 imgbb 持久化儲存
    if (process.env.IMGBB_API_KEY) {
      try {
        // 下載圖片
        const imageResponse = await fetch(tempImageUrl)
        if (!imageResponse.ok) {
          throw new Error('無法下載圖片')
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString('base64')

        // 上傳到 imgbb
        const formData = new FormData()
        formData.append('key', process.env.IMGBB_API_KEY)
        formData.append('image', base64Image)

        const uploadResponse = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: formData,
        })

        const uploadData = await uploadResponse.json()

        if (uploadResponse.ok && uploadData.success) {
          return NextResponse.json({
            success: true,
            imageUrl: uploadData.data.url,
            persistent: true,
          })
        }
      } catch (uploadError) {
        console.error('Image upload to imgbb failed:', uploadError)
        // 上傳失敗時回退到臨時 URL
      }
    }

    // 沒有設定 IMGBB 或上傳失敗，返回臨時 URL（會在約 1 小時後過期）
    return NextResponse.json({
      success: true,
      imageUrl: tempImageUrl,
      persistent: false,
      warning: '圖片為臨時 URL，將在約 1 小時後過期。請設定 IMGBB_API_KEY 環境變數以持久化儲存圖片。',
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
