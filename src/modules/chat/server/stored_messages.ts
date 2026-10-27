import '@tanstack/react-start/server-only'

import { createHash } from 'node:crypto'

import type { ContentPart, ModelMessage, UIMessage } from '@tanstack/ai'
import { convertMessagesToModelMessages } from '@tanstack/ai'

import { imageHashFromPart, thoughtSignatureOf } from '../common/stored_parts'

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_BYTES = 4 * 1024 * 1024

export type CurrentImage = {
  hash: string
  part: Extract<ContentPart, { type: 'image' }>
}

export function hashImageBytes(bytes: Buffer, mimeType: string): string {
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new Error('Use a JPEG, PNG, or WebP image')
  }
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Image must be between 1 byte and 4 MB')
  }
  return createHash('sha256').update(bytes).digest('hex')
}

export function lastUserFromRequest(messages: unknown): UIMessage | null {
  if (!Array.isArray(messages)) return null

  for (let index = messages.length - 1; index >= 0; index--) {
    const message = toIncomingUserMessage(messages[index])
    if (message) return message
  }

  return null
}

function toIncomingUserMessage(value: unknown): UIMessage | null {
  if (!isRecord(value) || value.role !== 'user') return null

  const id = typeof value.id === 'string' ? value.id : crypto.randomUUID()
  const createdAt =
    typeof value.createdAt === 'string' || value.createdAt instanceof Date
      ? new Date(value.createdAt)
      : new Date()
  const parts = Array.isArray(value.parts)
    ? (value.parts as UIMessage['parts'])
    : contentToParts(value.content)

  if (parts.length === 0) return null

  return { id, role: 'user', createdAt, parts }
}

function contentToParts(content: unknown): UIMessage['parts'] {
  if (typeof content === 'string') {
    return content.trim() ? [{ type: 'text', content }] : []
  }
  if (!Array.isArray(content)) return []

  const parts: UIMessage['parts'] = []
  for (const item of content) {
    if (!isRecord(item)) continue
    if (item.type === 'text') {
      const text =
        typeof item.content === 'string'
          ? item.content
          : typeof item.text === 'string'
            ? item.text
            : ''
      if (text) parts.push({ type: 'text', content: text })
      continue
    }
    if (item.type !== 'image' || !isRecord(item.source)) continue
    if (item.source.type !== 'data' || typeof item.source.value !== 'string') {
      continue
    }
    parts.push({
      type: 'image',
      source: {
        type: 'data',
        value: item.source.value,
        mimeType:
          typeof item.source.mimeType === 'string'
            ? item.source.mimeType
            : 'image/jpeg',
      },
    })
  }
  return parts
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function extractCurrentImage(message: UIMessage): CurrentImage | null {
  for (const part of message.parts) {
    if (part.type !== 'image') continue
    const source = part.source
    if (source.type !== 'data') {
      continue
    }
    const mimeType = source.mimeType
    const bytes = Buffer.from(source.value, 'base64')
    const hash = hashImageBytes(bytes, mimeType)
    return {
      hash,
      part: {
        type: 'image',
        source: { type: 'data', value: source.value, mimeType },
      },
    }
  }
  return null
}

export function toGeminiMessages(
  uiMessages: Array<UIMessage>,
  currentImage: CurrentImage | null,
): Array<ModelMessage> {
  const modelMessages = dropUnsignedToolCalls(
    convertMessagesToModelMessages(uiMessages).map(stubModelImages),
  )

  if (!currentImage) return modelMessages

  let lastUserIndex = -1
  for (let index = modelMessages.length - 1; index >= 0; index--) {
    if (modelMessages[index]?.role === 'user') {
      lastUserIndex = index
      break
    }
  }

  if (lastUserIndex === -1) return modelMessages

  return modelMessages.map((message, index) =>
    index === lastUserIndex ? appendImage(message, currentImage.part) : message,
  )
}

function dropUnsignedToolCalls(
  messages: Array<ModelMessage>,
): Array<ModelMessage> {
  const unsignedIds = new Set<string>()

  const rewritten = messages.map((message) => {
    if (message.role !== 'assistant' || !message.toolCalls?.length) {
      return message
    }

    const signed = message.toolCalls.filter((call) =>
      Boolean(thoughtSignatureOf(call.metadata)),
    )
    const unsigned = message.toolCalls.filter((call) => {
      if (thoughtSignatureOf(call.metadata)) return false
      unsignedIds.add(call.id)
      return true
    })

    if (unsigned.length === 0) return message

    const stubs = unsigned.map((call) => ({
      type: 'text' as const,
      content: `[logged with ${call.function.name}]`,
    }))
    const existing =
      typeof message.content === 'string'
        ? message.content
          ? [{ type: 'text' as const, content: message.content }]
          : []
        : (message.content ?? [])

    return {
      ...message,
      toolCalls: signed.length > 0 ? signed : undefined,
      content: [...existing, ...stubs],
    }
  })

  if (unsignedIds.size === 0) return rewritten

  return rewritten.filter(
    (message) =>
      message.role !== 'tool' ||
      !message.toolCallId ||
      !unsignedIds.has(message.toolCallId),
  )
}

function stubModelImages(message: ModelMessage): ModelMessage {
  if (typeof message.content === 'string' || message.content == null) {
    return message
  }

  return {
    ...message,
    content: message.content.map((part) => {
      if (part.type !== 'image') return part
      const hash = imageHashFromPart(part) ?? 'unknown'
      return { type: 'text' as const, content: `[photo sha256=${hash}]` }
    }),
  }
}

function appendImage(
  message: ModelMessage,
  image: Extract<ContentPart, { type: 'image' }>,
): ModelMessage {
  const existing =
    typeof message.content === 'string'
      ? message.content
        ? [{ type: 'text' as const, content: message.content }]
        : []
      : (message.content ?? [])

  return {
    ...message,
    content: [...existing, image],
  }
}
