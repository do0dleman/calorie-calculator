import { useEffect, useRef } from 'react'
import type { UIMessage } from '@tanstack/ai-react'
import { ImageIcon } from 'lucide-react'

import type { LoggedMeal } from '#/modules/meal/meal.functions'

import { MealCard } from './meal_card'

export function MessageList({
  messages,
}: {
  messages: ReadonlyArray<UIMessage>
}) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages])

  return (
    <div
      ref={listRef}
      className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-6"
    >
      {messages.length === 0 ? (
        <p className="m-auto max-w-sm text-center text-sm text-muted-foreground">
          Describe a meal or attach a photo.
        </p>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}
    </div>
  )
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex max-w-[80%] flex-col gap-2 ${
        isUser ? 'ml-auto items-end' : 'mr-auto items-start'
      }`}
    >
      {message.parts.map((part, index) => {
        if (part.type === 'image') {
          return <ImageBubble key={`${message.id}-image-${index}`} part={part} />
        }

        if (part.type === 'text' && part.content) {
          return (
            <div
              key={`${message.id}-text-${index}`}
              className={`rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {part.content}
            </div>
          )
        }

        if (part.type === 'tool-call' && part.name === 'logMeal') {
          const meal = asLoggedMeal(part.output) ?? asLoggedMeal(part.input)
          if (!meal) return null
          return (
            <div key={part.id} className="w-full min-w-56">
              <MealCard meal={meal} />
            </div>
          )
        }

        if (part.type === 'tool-result' && part.name === 'logMeal') {
          const meal = mealFromToolResult(part.content)
          if (!meal) return null
          return (
            <div
              key={part.toolCallId}
              className="w-full min-w-56"
            >
              <MealCard meal={meal} />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

function ImageBubble({ part }: { part: UIMessage['parts'][number] }) {
  if (part.type !== 'image') return null

  const src = imageSrc(part)
  if (src) {
    return (
      <img
        src={src}
        alt="Meal"
        className="max-h-48 rounded-lg object-cover"
      />
    )
  }

  const hash = imageHash(part)

  return (
    <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted text-muted-foreground">
      <ImageIcon className="size-5" />
      <span className="px-1 font-mono text-[10px]">
        {hash ? hash.slice(0, 8) : 'photo'}
      </span>
    </div>
  )
}

function mealFromToolResult(content: unknown): LoggedMeal | null {
  if (typeof content === 'string') {
    try {
      return asLoggedMeal(JSON.parse(content))
    } catch {
      return null
    }
  }
  return asLoggedMeal(content)
}

function asLoggedMeal(value: unknown): LoggedMeal | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.name !== 'string') {
    return null
  }
  if (
    typeof record.caloriesKcal !== 'number' ||
    typeof record.proteinG !== 'number' ||
    typeof record.fatG !== 'number' ||
    typeof record.carbsG !== 'number'
  ) {
    return null
  }
  return {
    id: record.id,
    name: record.name,
    caloriesKcal: record.caloriesKcal,
    proteinG: record.proteinG,
    fatG: record.fatG,
    carbsG: record.carbsG,
  }
}

function imageSrc(part: Extract<UIMessage['parts'][number], { type: 'image' }>) {
  const source = part.source
  if (source.type === 'data') {
    return `data:${source.mimeType};base64,${source.value}`
  }
  if (source.type === 'url' && !source.value.startsWith('hash:')) {
    return source.value
  }
  return null
}

function imageHash(part: Extract<UIMessage['parts'][number], { type: 'image' }>) {
  const metadata = part.metadata
  if (
    metadata &&
    typeof metadata === 'object' &&
    'hash' in metadata &&
    typeof metadata.hash === 'string'
  ) {
    return metadata.hash
  }
  const source = part.source
  if (source.type === 'url' && source.value.startsWith('hash:')) {
    return source.value.slice('hash:'.length)
  }
  return null
}
