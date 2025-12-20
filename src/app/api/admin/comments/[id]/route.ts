import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'
import { commentActionSchema, validateRequest } from '@/lib/validations'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validation = validateRequest(commentActionSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { action } = validation.data

    if (action === 'approve') {
      await prisma.comment.update({
        where: { id },
        data: { approved: true },
      })
    } else if (action === 'reject') {
      await prisma.comment.update({
        where: { id },
        data: { approved: false },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comment update error:', error)
    return NextResponse.json({ error: '操作失敗' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const { id } = await params

    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comment delete error:', error)
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 })
  }
}
