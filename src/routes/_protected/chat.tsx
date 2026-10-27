import { createFileRoute } from '@tanstack/react-router'

import { MealChat } from '#/modules/chat'
import { getChatMessages } from '#/modules/chat/server/chat.functions'

export const Route = createFileRoute('/_protected/chat')({
  ssr: false,
  loader: () => getChatMessages(),
  component: ChatPage,
})

function ChatPage() {
  const stored = Route.useLoaderData()
  return <MealChat initialStored={stored} />
}
