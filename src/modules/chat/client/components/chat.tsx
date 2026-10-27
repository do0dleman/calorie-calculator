import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import type { ContentPart } from '@tanstack/ai'

import { storedToUIMessage } from '#/modules/chat/common/stored_parts'
import type { StoredChatMessage } from '#/modules/chat/common/types'
import type { PendingImage } from '#/modules/chat/client/types'
import { todayRange } from '#/modules/overview/utils'

import { Composer } from './composer'
import { MessageList } from './message_list'

export function MealChat({
  initialStored = [],
}: {
  initialStored?: Array<StoredChatMessage>
}) {
  return (
    <MealChatSession
      initialMessages={initialStored.map(storedToUIMessage)}
    />
  )
}

function MealChatSession({
  initialMessages,
}: {
  initialMessages: ReturnType<typeof storedToUIMessage>[]
}) {
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const [pending, setPending] = useState<PendingImage | null>(null)
  const urlsRef = useRef<string[]>([])

  const { messages, sendMessage, status, error } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    initialMessages,
    onFinish: () => {
      void queryClient.invalidateQueries({ queryKey: ['daily-meals'] })
      void queryClient.invalidateQueries({ queryKey: ['daily-totals'] })
      void queryClient.invalidateQueries({ queryKey: ['chat-messages'] })
    },
  })

  useEffect(() => {
    const urls = urlsRef.current
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [])

  function clearPending() {
    setPending((current) => {
      if (current) URL.revokeObjectURL(current.url)
      return null
    })
  }

  function chooseImage(file: File) {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    urlsRef.current.push(url)
    setPending((current) => {
      if (current) URL.revokeObjectURL(current.url)
      return { file, url }
    })
  }

  async function send() {
    const text = input.trim()
    const busy = status === 'submitted' || status === 'streaming'
    if ((!text && !pending) || busy) return

    const range = todayRange()
    const parts: Array<ContentPart> = []

    if (pending) {
      const image = await fileToBase64(pending.file)
      parts.push({
        type: 'image',
        source: {
          type: 'data',
          value: image.value,
          mimeType: image.mimeType,
        },
      })
    }
    if (text) parts.push({ type: 'text', content: text })

    setInput('')
    clearPending()

    await sendMessage(
      { content: parts },
      { body: { dayFrom: range.from, dayTo: range.to } },
    )
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.25rem)] md:h-[calc(100dvh-4.25rem)] w-full max-w-2xl flex-col bg-background text-foreground sm:h-[calc(100dvh-4.75rem)]">
      <MessageList messages={messages} />
      {error ? (
        <p className="px-4 pb-2 text-sm text-destructive" role="alert">
          {error.message}
        </p>
      ) : null}
      <Composer
        input={input}
        pending={pending}
        disabled={status === 'submitted' || status === 'streaming'}
        onInput={setInput}
        onPick={chooseImage}
        onClearPending={clearPending}
        onSend={() => {
          void send()
        }}
      />
    </div>
  )
}

function fileToBase64(file: File) {
  return new Promise<{ value: string; mimeType: string }>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result)
      const comma = result.indexOf(',')
      resolve({
        value: comma === -1 ? result : result.slice(comma + 1),
        mimeType: file.type || 'image/jpeg',
      })
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}
