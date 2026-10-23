import { z } from 'zod'

export const authSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
})

export function safeRedirect(value: string | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/'
  }

  if (value.startsWith('/login') || value.startsWith('/signup')) {
    return '/'
  }

  return value
}
