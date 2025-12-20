/**
 * Environment variable validation
 * This module validates required environment variables at startup
 */

interface EnvConfig {
  // Required
  DATABASE_URL: string
  NEXTAUTH_SECRET: string
  // Optional with defaults
  NEXTAUTH_URL: string
  NEXT_PUBLIC_SITE_URL: string
  NEXT_PUBLIC_SITE_NAME: string
  NEXT_PUBLIC_SITE_DESCRIPTION: string
}

const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET'] as const

const optionalEnvVars = {
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SITE_NAME: '我的部落格',
  NEXT_PUBLIC_SITE_DESCRIPTION: '分享技術與生活',
} as const

function validateEnv(): EnvConfig {
  const missingVars: string[] = []

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar)
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.map((v) => `  - ${v}`).join('\n')}\n\n` +
        'Please check your .env file or environment configuration.'
    )
  }

  // Build config with defaults for optional vars
  const config: EnvConfig = {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || optionalEnvVars.NEXTAUTH_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || optionalEnvVars.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || optionalEnvVars.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_SITE_DESCRIPTION:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION || optionalEnvVars.NEXT_PUBLIC_SITE_DESCRIPTION,
  }

  return config
}

// Validate on module load (at startup)
let envConfig: EnvConfig | null = null

export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    envConfig = validateEnv()
  }
  return envConfig
}

// Export individual values for convenience
export const env = {
  get databaseUrl() {
    return getEnvConfig().DATABASE_URL
  },
  get nextAuthSecret() {
    return getEnvConfig().NEXTAUTH_SECRET
  },
  get nextAuthUrl() {
    return getEnvConfig().NEXTAUTH_URL
  },
  get siteUrl() {
    return getEnvConfig().NEXT_PUBLIC_SITE_URL
  },
  get siteName() {
    return getEnvConfig().NEXT_PUBLIC_SITE_NAME
  },
  get siteDescription() {
    return getEnvConfig().NEXT_PUBLIC_SITE_DESCRIPTION
  },
}
