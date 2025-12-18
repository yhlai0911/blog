import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

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
    return NextResponse.json(
      { error: '操作失敗' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { id } = await params

    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comment delete error:', error)
    return NextResponse.json(
      { error: '刪除失敗' },
      { status: 500 }
    )
  }
}
