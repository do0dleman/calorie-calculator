import { useEffect, useRef } from 'react'

import type { ImagePart, MealMessage, TextPart } from '#/modules/chat/types'

export function MessageList({ messages }: { messages: MealMessage[] }) {
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
        messages.map((message) => {
          const text = message.parts.find(
            (part): part is TextPart => part.type === 'text',
          )
          const image = message.parts.find(
            (part): part is ImagePart => part.type === 'image',
          )
          return (
            <div
              key={message.id}
              className="ml-auto flex max-w-[80%] flex-col gap-2 rounded-2xl bg-primary px-3 py-2 text-primary-foreground"
            >
              {image ? (
                <img
                  src={image.url}
                  alt="Meal"
                  className="max-h-48 rounded-lg object-cover"
                />
              ) : null}
              {text ? (
                <p className="text-sm whitespace-pre-wrap">{text.content}</p>
              ) : null}
            </div>
          )
        })
      )}
    </div>
  )
}
