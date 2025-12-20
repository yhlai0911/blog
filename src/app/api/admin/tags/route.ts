import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const tags = await prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      return auth.response
    }

    const { name, slug } = await request.json()
    const finalSlug = slug || slugify(name)

    const tag = await prisma.tag.create({
      data: { name, slug: finalSlug },
    })

    return NextResponse.json({ tag })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: '建立失敗' }, { status: 500 })
  }
}
