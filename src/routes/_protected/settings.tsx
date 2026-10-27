import { createFileRoute } from '@tanstack/react-router'

import { Settings } from '#/modules/settings'

export const Route = createFileRoute('/_protected/settings')({
  // Goals are read from localStorage on the first render.
  ssr: false,
  component: Settings,
})
