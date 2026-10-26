import { db } from '#/db'
import { env } from '#/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: env.BETTER_AUTH_URL ?? `https://${env.VERCEL_URL}`,
  trustedOrigins: ['https://*-do0dlemans-projects.vercel.app'],
  plugins: [tanstackStartCookies()],
})
