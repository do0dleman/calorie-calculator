import { createFileRoute } from '@tanstack/react-router'

import { MealChat } from '#/modules/chat'

export const Route = createFileRoute('/_protected/chat')({
  component: MealChat,
})
