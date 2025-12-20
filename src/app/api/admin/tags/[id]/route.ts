import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const { id } = await params
    const { name, slug } = await request.json()

    const tag = await prisma.tag.update({
      where: { id },
      data: { name, slug },
    })

    return NextResponse.json({ tag })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: '更新失敗' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const { id } = await params
    await prisma.tag.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 })
  }
}
