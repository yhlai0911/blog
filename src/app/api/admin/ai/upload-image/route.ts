import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'

interface UploadImageRequest {
  imageUrl: string  // Temporary URL from DALL-E
}

export async function POST(request: Request) {
  try {
    // 驗證管理員權限
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    // 檢查 IMGBB API Key
    if (!process.env.IMGBB_API_KEY) {
      // 如果沒有設定 IMGBB，直接返回原始 URL（會過期）
      console.warn('IMGBB_API_KEY 未設定，圖片將使用臨時 URL（1小時後過期）')
      const body: UploadImageRequest = await request.json()
      return NextResponse.json({
        success: true,
        imageUrl: body.imageUrl,
        warning: '未設定 IMGBB_API_KEY，圖片 URL 將在 1 小時後過期',
      })
    }

    const body: UploadImageRequest = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: '請提供圖片 URL' },
        { status: 400 }
      )
    }

    // 下載圖片
    const imageResponse = await fetch(imageUrl)
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

    if (!uploadResponse.ok || !uploadData.success) {
      throw new Error(uploadData.error?.message || '上傳圖片失敗')
    }

    return NextResponse.json({
      success: true,
      imageUrl: uploadData.data.url,
      deleteUrl: uploadData.data.delete_url,
    })
  } catch (error) {
    console.error('Image Upload Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '圖片上傳失敗' },
      { status: 500 }
    )
  }
}
