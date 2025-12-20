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

    const categories = await prisma.category.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ categories })
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

    const { name, slug, description } = await request.json()
    const finalSlug = slug || slugify(name)

    const category = await prisma.category.create({
      data: { name, slug: finalSlug, description },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: '建立失敗' }, { status: 500 })
  }
}
