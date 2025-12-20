import { z } from 'zod'

// Post schemas
export const createPostSchema = z.object({
  title: z.string().min(1, '標題為必填').max(200, '標題不可超過 200 字'),
  slug: z.string().optional(),
  content: z.string().min(1, '內容為必填'),
  contentType: z.enum(['markdown', 'html']).default('markdown'),
  excerpt: z.string().max(500, '摘要不可超過 500 字').optional().nullable(),
  coverImage: z.string().url('封面圖片須為有效網址').optional().nullable().or(z.literal('')),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  scheduledAt: z.string().optional().nullable(),
})

export const updatePostSchema = createPostSchema.partial().extend({
  title: z.string().min(1, '標題為必填').max(200, '標題不可超過 200 字'),
  slug: z.string().min(1, 'Slug 為必填'),
  content: z.string().min(1, '內容為必填'),
})

// Comment schemas
export const createCommentSchema = z.object({
  postId: z.string().min(1, '文章 ID 為必填'),
  parentId: z.string().optional().nullable(),
  author: z.string().min(1, '姓名為必填').max(50, '姓名不可超過 50 字'),
  email: z.string().email('請輸入有效的 Email').optional().nullable().or(z.literal('')),
  website: z.string().url('請輸入有效的網址').optional().nullable().or(z.literal('')),
  content: z.string().min(1, '評論內容為必填').max(2000, '評論不可超過 2000 字'),
})

export const commentActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
})

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, '名稱為必填').max(50, '名稱不可超過 50 字'),
  slug: z.string().optional(),
  description: z.string().max(200, '描述不可超過 200 字').optional().nullable(),
})

export const updateCategorySchema = createCategorySchema

// Tag schemas
export const createTagSchema = z.object({
  name: z.string().min(1, '名稱為必填').max(50, '名稱不可超過 50 字'),
  slug: z.string().optional(),
})

export const updateTagSchema = createTagSchema

// Settings schemas
export const updateSettingsSchema = z.object({
  siteName: z.string().min(1, '網站名稱為必填').max(100),
  siteDescription: z.string().min(1, '網站描述為必填').max(500),
  siteUrl: z.string().url('請輸入有效的網址'),
  socialTwitter: z.string().url('請輸入有效的網址').optional().nullable().or(z.literal('')),
  socialGithub: z.string().url('請輸入有效的網址').optional().nullable().or(z.literal('')),
  socialLinkedin: z.string().url('請輸入有效的網址').optional().nullable().or(z.literal('')),
  seoDefaultTitle: z.string().max(70).optional().nullable().or(z.literal('')),
  seoDefaultDesc: z.string().max(160).optional().nullable().or(z.literal('')),
})

// Validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true
  data: T
} | {
  success: false
  error: string
} {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message).join(', ')
    return { success: false, error: errors }
  }

  return { success: true, data: result.data }
}
