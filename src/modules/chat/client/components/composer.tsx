import { useRef } from 'react'
import { Send, X } from 'lucide-react'

import { Button } from '#/components/ui/button'
import type { PendingImage } from '#/modules/chat/client/types'

import { AttachmentMenu } from './attachment_menu'

export function Composer({
  input,
  pending,
  disabled,
  onInput,
  onPick,
  onClearPending,
  onSend,
}: {
  input: string
  pending: PendingImage | null
  disabled?: boolean
  onInput: (value: string) => void
  onPick: (file: File) => void
  onClearPending: () => void
  onSend: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = !disabled && (input.trim().length > 0 || pending !== null)

  function resizeTextarea() {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  function send() {
    if (!canSend) return
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onSend()
  }

  return (
    <form
      className="border-t border-border bg-background p-3"
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      {pending ? (
        <div className="mb-2 inline-flex">
          <div className="relative">
            <img
              src={pending.url}
              alt="Attachment preview"
              className="h-16 w-16 rounded-md border border-border object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon-xs"
              className="absolute -top-2 -right-2"
              aria-label="Remove attachment"
              onClick={onClearPending}
            >
              <X />
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <AttachmentMenu onPick={onPick} />

        <textarea
          ref={textareaRef}
          value={input}
          rows={1}
          placeholder="Describe a meal..."
          disabled={disabled}
          className="max-h-30 min-h-9 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          onChange={(event) => {
            onInput(event.target.value)
            resizeTextarea()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              send()
            }
          }}
        />

        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label="Send"
        >
          <Send />
        </Button>
      </div>
    </form>
  )
}
