export interface Post {
  id: string
  title: string
  slug: string
  content: string
  contentType: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  featured: boolean
  viewCount: number
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  categoryId: string | null
  category?: Category | null
  tags?: Tag[]
  comments?: Comment[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  posts?: Post[]
  _count?: {
    posts: number
  }
}

export interface Tag {
  id: string
  name: string
  slug: string
  posts?: Post[]
  _count?: {
    posts: number
  }
}

export interface Comment {
  id: string
  content: string
  author: string
  email: string | null
  website: string | null
  approved: boolean
  createdAt: Date
  postId: string
  parentId: string | null
  replies?: Comment[]
}

export interface Analytics {
  id: string
  path: string
  referrer: string | null
  userAgent: string | null
  country: string | null
  createdAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
