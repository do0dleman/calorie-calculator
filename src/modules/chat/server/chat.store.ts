import '@tanstack/react-start/server-only'

import { asc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { chatMessage, chatThread } from '#/db/schema/app'
import { modelMessagesToUIMessages } from '@tanstack/ai'
import type { ModelMessage, UIMessage } from '@tanstack/ai'

import {
  isStoredChatPart,
  storedToUIMessage,
  toStoredParts,
} from '../common/stored_parts'
import type { StoredChatMessage } from '../common/types'

export async function ensureChatThread(userId: string) {
  const existing = await db
    .select()
    .from(chatThread)
    .where(eq(chatThread.userId, userId))
    .limit(1)

  if (existing[0]) return existing[0]

  const created = {
    id: crypto.randomUUID(),
    userId,
  }

  await db.insert(chatThread).values(created)
  return created
}

export async function loadStoredMessages(
  userId: string,
): Promise<Array<StoredChatMessage>> {
  const thread = await db
    .select()
    .from(chatThread)
    .where(eq(chatThread.userId, userId))
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
}

export async function loadUIMessages(userId: string): Promise<Array<UIMessage>> {
  const stored = await loadStoredMessages(userId)
  return stored.map(storedToUIMessage)
}

export async function persistUIMessage(params: {
  threadId: string
  message: UIMessage
  imageHash: string | null
}) {
  if (params.message.role !== 'user' && params.message.role !== 'assistant') {
    return
  }

  const parts = toStoredParts(params.message, params.imageHash)
  if (parts.length === 0) return

  await db
    .insert(chatMessage)
    .values({
      id: params.message.id,
      threadId: params.threadId,
      role: params.message.role,
      parts,
      createdAt: params.message.createdAt ?? new Date(),
    })
    .onConflictDoNothing()
}

export async function persistAssistantFromModel(params: {
  threadId: string
  modelMessages: ReadonlyArray<ModelMessage>
}) {
  const assistants = params.modelMessages.filter(
    (message) => message.role === 'assistant',
  )

  for (const message of modelMessagesToUIMessages(assistants)) {
    await persistUIMessage({
      threadId: params.threadId,
      message,
      imageHash: null,
    })
  }
}

