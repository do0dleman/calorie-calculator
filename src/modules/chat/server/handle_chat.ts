import '@tanstack/react-start/server-only'

import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { geminiText } from '@tanstack/ai-gemini'
import type { ModelMessage, UIMessage } from '@tanstack/ai'

import { env } from '#/env'
import { auth } from '#/lib/auth'
import {
  ensureChatThread,
  loadUIMessages,
  persistAssistantFromModel,
  persistUIMessage,
} from './chat.store'
import { thoughtSignatureOf } from '../common/stored_parts'
import {
  extractCurrentImage,
  lastUserFromRequest,
  toGeminiMessages,
} from './stored_messages'
import { getTodaysMeals, logMeal } from './tools'
import type { MealChatContext } from './tools'

const SYSTEM_PROMPT = `You are a nutrition assistant for a calorie tracker.
When the user describes food or sends a photo of a meal, estimate a short name plus calories (kcal), protein, fat, and carbs in grams, then call logMeal.
Always insert a new meal, even if the photo looks familiar.
After logMeal, do not recap the meal, macros, or that you logged it — the UI already shows a meal card.
If the message is not food or you cannot tell what it is, ask a clarifying question instead of logging.
Use getTodaysMeals when the user asks what they already ate today.`

export async function handleChatPost(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as {
    messages?: unknown
    dayFrom?: string
    dayTo?: string
    data?: { dayFrom?: string; dayTo?: string }
    forwardedProps?: { dayFrom?: string; dayTo?: string }
  }

  const lastUser = lastUserFromRequest(body.messages)

  if (!lastUser) {
    return Response.json({ error: 'Expected a user message' }, { status: 400 })
  }

  let currentImage
  try {
    currentImage = extractCurrentImage(lastUser)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid image'
    return Response.json({ error: message }, { status: 400 })
  }

  const thread = await ensureChatThread(session.user.id)
  await persistUIMessage({
    threadId: thread.id,
    message: lastUser,
    imageHash: currentImage?.hash ?? null,
  })

  if (!env.GOOGLE_API_KEY) {
    return Response.json(
      { error: 'GOOGLE_API_KEY is not configured' },
      { status: 500 },
    )
  }

  const history = await loadUIMessages(session.user.id)
  const geminiMessages = toGeminiMessages(history, currentImage)

  const day = body.data ?? body.forwardedProps ?? body
  const context: MealChatContext = {
    userId: session.user.id,
    imageHash: currentImage?.hash ?? null,
    dayFrom: day.dayFrom ?? new Date(0).toISOString(),
    dayTo: day.dayTo ?? new Date().toISOString(),
  }

  const abortController = new AbortController()
  const toolOutputs: Array<{
    id: string
    name: string
    output: unknown
  }> = []

  const stream = chat({
    adapter: geminiText('gemini-3.5-flash'),
    messages: geminiMessages,
    systemPrompts: [SYSTEM_PROMPT],
    tools: [logMeal, getTodaysMeals],
    context,
    abortController,
    middleware: [
      {
        async onAfterToolCall(_ctx, info) {
          if (!info.ok || info.result === undefined) return
          toolOutputs.push({
            id: info.toolCallId,
            name: info.toolName,
            output: info.result,
          })
        },
        async onFinish(ctx, info) {
          await persistAssistantFromModel({
            threadId: thread.id,
            modelMessages: ctx.messages,
          })

          const parts: UIMessage['parts'] = []
          const assistants = ctx.messages.filter(
            (message) => message.role === 'assistant',
          )
          if (assistants.length === 0 && info.content) {
            parts.push({ type: 'text', content: info.content })
          }
          const signatures = thoughtSignaturesFromModel(ctx.messages)
          for (const tool of toolOutputs) {
            const thoughtSignature = signatures.get(tool.id)
            parts.push({
              type: 'tool-call',
              id: tool.id,
              name: tool.name,
              arguments: '',
              state: 'complete',
              output: tool.output,
              metadata: thoughtSignature ? { thoughtSignature } : undefined,
            })
          }
          if (parts.length === 0) return

          await persistUIMessage({
            threadId: thread.id,
            message: {
              id: crypto.randomUUID(),
              role: 'assistant',
              parts,
            },
            imageHash: null,
          })
        },
      },
    ],
  })

  return toServerSentEventsResponse(stream, { abortController })
}

function thoughtSignaturesFromModel(
  messages: ReadonlyArray<ModelMessage>,
): Map<string, string> {
  const signatures = new Map<string, string>()
  for (const message of messages) {
    for (const call of message.toolCalls ?? []) {
      const signature = thoughtSignatureOf(call.metadata)
      if (signature) signatures.set(call.id, signature)
    }
  }
  return signatures
}
