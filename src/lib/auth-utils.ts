import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './auth'

/**
 * Check if the current user is authenticated and has admin role
 * Returns the session if authorized, or a NextResponse error if not
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: '未授權' }, { status: 401 }),
    }
  }

  if (session.user?.role !== 'admin') {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: '權限不足' }, { status: 403 }),
    }
  }

  return {
    authorized: true as const,
    session,
  }
}
