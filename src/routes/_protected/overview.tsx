import { createFileRoute } from '@tanstack/react-router'

import { Overview, OverviewSkeleton, loadOverview } from '#/modules/overview'

export const Route = createFileRoute('/_protected/overview')({
  // Run the loader in the browser so "today" uses the user's local timezone.
  ssr: false,
  loader: ({ context }) => loadOverview(context.queryClient),
  pendingComponent: OverviewSkeleton,
  component: Overview,
})
