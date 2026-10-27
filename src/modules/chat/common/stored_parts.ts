import type { UIMessage } from '@tanstack/ai'

import type { LoggedMeal } from '#/modules/meal/meal.schema'

import type {
  JsonValue,
  StoredChatMessage,
  StoredChatPart,
  StoredImagePart,
} from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function thoughtSignatureOf(metadata: unknown): string | undefined {
  if (!isRecord(metadata)) return undefined
  const value = metadata.thoughtSignature
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function imageHashFromPart(part: unknown): string | null {
  if (!isRecord(part) || part.type !== 'image') return null
  if (typeof part.hash === 'string' && part.hash.length > 0) return part.hash
  if (isRecord(part.metadata) && typeof part.metadata.hash === 'string') {
    return part.metadata.hash
  }
  if (isRecord(part.source) && typeof part.source.value === 'string') {
    const value = part.source.value
    if (value.startsWith('hash:')) return value.slice('hash:'.length)
  }
  return null
}

export function isStoredChatPart(value: unknown): value is StoredChatPart {
  if (!isRecord(value) || typeof value.type !== 'string') return false
  if (value.type === 'text') return typeof value.content === 'string'
  if (value.type === 'image') {
    return typeof value.hash === 'string'
  }
  if (value.type === 'tool-call') {
    return typeof value.id === 'string' && typeof value.name === 'string'
  }
  if (value.type === 'tool-result') {
    return typeof value.toolCallId === 'string'
  }
  return false
}

export function toStoredParts(
  message: UIMessage,
  imageHash: string | null,
): Array<StoredChatPart> {
  const parts: Array<StoredChatPart> = []

  for (const part of message.parts) {
    if (part.type === 'text' && part.content) {
      parts.push({ type: 'text', content: part.content })
      continue
    }

    if (part.type === 'image') {
      const hash = imageHash ?? imageHashFromPart(part)
      if (!hash) continue
      const url =
        part.source.type === 'url' && !part.source.value.startsWith('hash:')
          ? part.source.value
          : null
      parts.push({ type: 'image', hash, url })
      continue
    }

    if (part.type === 'tool-call') {
      if (part.output === undefined) continue
      parts.push({
        type: 'tool-call',
        id: part.id,
        name: part.name,
        arguments: part.arguments,
        state: part.state,
        input: toJsonValue(part.input),
        output: toJsonValue(part.output),
        thoughtSignature: thoughtSignatureOf(part.metadata),
      })
      continue
    }

    if (part.type === 'tool-result') {
      parts.push({
        type: 'tool-result',
        toolCallId: part.toolCallId,
        name: part.name,
        content: toJsonValue(part.content) ?? null,
      })
    }
  }

  return parts
}

export function storedLoggedMealMessage(meal: LoggedMeal): StoredChatMessage {
  const fields = {
    name: meal.name,
    caloriesKcal: meal.caloriesKcal,
    proteinG: meal.proteinG,
    fatG: meal.fatG,
    carbsG: meal.carbsG,
  }

  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    createdAt: new Date().toISOString(),
    parts: [
      {
        type: 'tool-call',
        id: crypto.randomUUID(),
        name: 'logMeal',
        arguments: JSON.stringify(fields),
        state: 'complete',
        input: fields,
        output: meal,
      },
    ],
  }
}

export function storedToUIMessage(message: StoredChatMessage): UIMessage {
  return {
    id: message.id,
    role: message.role,
    createdAt: new Date(message.createdAt),
    parts: message.parts.map((part) => storedPartToUI(part)),
  }
}

function storedPartToUI(part: StoredChatPart): UIMessage['parts'][number] {
  if (part.type === 'text') {
    return { type: 'text', content: part.content }
  }

  if (part.type === 'image') {
    return storedImageToUI(part)
  }

  if (part.type === 'tool-result') {
    return {
      type: 'tool-result',
      toolCallId: part.toolCallId,
      name: part.name,
      content:
        typeof part.content === 'string'
          ? part.content
          : JSON.stringify(part.content),
      state: 'complete',
    }
  }

  return {
    type: 'tool-call',
    id: part.id,
    name: part.name,
    arguments: part.arguments,
    state: part.state as never,
    input: part.input,
    output: part.output,
    metadata: part.thoughtSignature
      ? { thoughtSignature: part.thoughtSignature }
      : undefined,
  }
}

function toJsonValue(value: unknown): JsonValue | undefined {
  if (value === undefined) return undefined
  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue
  } catch {
    return null
  }
}

function storedImageToUI(part: StoredImagePart): UIMessage['parts'][number] {
  return {
    type: 'image',
    source: {
      type: 'url',
      value: part.url ?? `hash:${part.hash}`,
    },
    metadata: { hash: part.hash },
  }
}
