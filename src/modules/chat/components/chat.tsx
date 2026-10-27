import { useEffect, useRef, useState } from 'react'

import type { MealMessage, PendingImage } from '#/modules/chat/types'

import { Composer } from './composer'
import { MessageList } from './message_list'

export function MealChat() {
  const [messages, setMessages] = useState<MealMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState<PendingImage | null>(null)
  const urlsRef = useRef<string[]>([])

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

  function send() {
    const text = input.trim()
    if (!text && !pending) return

    const parts: MealMessage['parts'] = []
    if (pending) parts.push({ type: 'image', url: pending.url })
    if (text) parts.push({ type: 'text', content: text })

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', parts },
    ])
    setInput('')
    setPending(null)
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.25rem)] md:h-[calc(100dvh-4.25rem)] w-full max-w-2xl flex-col bg-background text-foreground sm:h-[calc(100dvh-4.75rem)]">
      <MessageList messages={messages} />
      <Composer
        input={input}
        pending={pending}
        onInput={setInput}
        onPick={chooseImage}
        onClearPending={clearPending}
        onSend={send}
      />
    </div>
  )
}
