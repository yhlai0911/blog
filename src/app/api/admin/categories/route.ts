import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
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
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
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
