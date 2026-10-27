import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { asc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { chatMessage, chatThread } from '#/db/schema/app'
import { auth } from '#/lib/auth'

import { isStoredChatPart } from '../common/stored_parts'
import type { StoredChatMessage } from '../common/types'

export const getChatMessages = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<StoredChatMessage>> => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw new Error('Unauthorized')
    }

    const thread = await db
      .select()
      .from(chatThread)
      .where(eq(chatThread.userId, session.user.id))
      .limit(1)

    if (!thread[0]) return []

    const rows = await db
      .select()
      .from(chatMessage)
      .where(eq(chatMessage.threadId, thread[0].id))
      .orderBy(asc(chatMessage.createdAt), asc(chatMessage.id))

    return rows.map((row) => ({
      id: row.id,
      role: row.role,
      parts: row.parts.filter(isStoredChatPart),
      createdAt: row.createdAt.toISOString(),
    }))
  },
)
