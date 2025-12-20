import { remark } from 'remark'
import html from 'remark-html'
import sanitizeHtml from 'sanitize-html'

// Whitelist configuration for sanitize-html
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'strong', 'em', 'del', 'ins', 'sub', 'sup',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img', 'figure', 'figcaption',
    'div', 'span',
  ],
  allowedAttributes: {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'code': ['class'], // For syntax highlighting
    'pre': ['class'],
    'span': ['class'],
    'div': ['class'],
    'th': ['align'],
    'td': ['align'],
    'h1': ['id'],
    'h2': ['id'],
    'h3': ['id'],
    'h4': ['id'],
    'h5': ['id'],
    'h6': ['id'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  transformTags: {
    'a': (tagName, attribs) => {
      // Add security attributes to external links
      if (attribs.href && !attribs.href.startsWith('/') && !attribs.href.startsWith('#')) {
        return {
          tagName,
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }
      }
      return { tagName, attribs }
    },
  },
}

// Generate slug for heading ID
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
}

// Add IDs to headings in HTML
function addHeadingIds(htmlContent: string): string {
  return htmlContent.replace(
    /<(h[1-6])>(.+?)<\/\1>/gi,
    (match, tag, text) => {
      const id = generateHeadingId(text.replace(/<[^>]+>/g, ''))
      return `<${tag} id="${id}">${text}</${tag}>`
    }
  )
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(html, { sanitize: false })
    .process(markdown)

  // Add IDs to headings
  const htmlWithIds = addHeadingIds(result.toString())

  // Sanitize the HTML output
  return sanitizeHtml(htmlWithIds, sanitizeOptions)
}

// Sanitize raw HTML content and add IDs to headings
export function sanitizeHtmlContent(htmlContent: string): string {
  const htmlWithIds = addHeadingIds(htmlContent)
  return sanitizeHtml(htmlWithIds, sanitizeOptions)
}

// Extract headings for Table of Contents
export function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: { id: string; text: string; level: number }[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
      .replace(/\s+/g, '-')

    headings.push({ id, text, level })
  }

  return headings
}

// Extract excerpt from content
export function extractExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown syntax
  const plainText = content
    .replace(/^#+\s+/gm, '') // headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/`(.+?)`/g, '$1') // inline code
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\n+/g, ' ')
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  return plainText.slice(0, maxLength).trim() + '...'
}
