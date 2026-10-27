import { createFileRoute } from '@tanstack/react-router'

import {
  History,
  HistorySkeleton,
  mealHistoryQueryOptions,
} from '#/modules/history'

export const Route = createFileRoute('/_protected/history')({
  // Days are grouped in the browser so they follow the user's local timezone.
  ssr: false,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(mealHistoryQueryOptions()),
  pendingComponent: HistorySkeleton,
  component: History,
})
