/**
 * Next.js Instrumentation
 * This file runs once when the server starts
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run validation on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import to avoid issues during build
    const { getEnvConfig } = await import('./lib/env')

    try {
      getEnvConfig()
      console.log('✓ Environment variables validated successfully')
    } catch (error) {
      console.error('✗ Environment validation failed:')
      console.error(error instanceof Error ? error.message : error)
      // In production, you might want to exit the process
      if (process.env.NODE_ENV === 'production') {
        process.exit(1)
      }
    }
  }
}
