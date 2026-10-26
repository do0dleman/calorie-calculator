import { Button } from '#/components/ui/button'
import { getSession } from '#/lib/auth.functions'
import { m } from '#/paraglide/messages'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CameraIcon,
  ChartPieIcon,
  MessageSquareIcon,
  UtensilsCrossedIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

export const Route = createFileRoute('/')({
  loader: async () => {
    const session = await getSession()
    return { signedIn: Boolean(session) }
  },
  head: () => ({
    meta: [{ title: m.landing_title() }],
  }),
  component: App,
})

const features = [
  {
    icon: UtensilsCrossedIcon,
    title: m.feature_manual_title,
    description: m.feature_manual_description,
  },
  {
    icon: CameraIcon,
    title: m.feature_picture_title,
    description: m.feature_picture_description,
  },
  {
    icon: ChartPieIcon,
    title: m.feature_overview_title,
    description: m.feature_overview_description,
  },
  {
    icon: MessageSquareIcon,
    title: m.feature_chat_title,
    description: m.feature_chat_description,
  },
] as const

const techGroups = [
  {
    label: m.tech_group_frontend,
    tools: [
      { name: 'React 19', role: m.tech_ui },
      { name: 'Tailwind CSS + shadcn/ui', role: m.tech_styling },
      { name: 'Paraglide JS', role: m.tech_i18n },
      { name: 'TypeScript', role: m.tech_language },
    ],
  },
  {
    label: m.tech_group_backend,
    tools: [
      { name: 'TanStack Start', role: m.tech_framework },
      { name: 'Better Auth', role: m.tech_auth },
      { name: 'TanStack AI', role: m.tech_ai },
    ],
  },
  {
    label: m.tech_group_data,
    tools: [
      { name: 'PostgreSQL', role: m.tech_database },
      { name: 'Drizzle ORM', role: m.tech_orm },
    ],
  },
  {
    label: m.tech_group_deployment,
    tools: [
      { name: 'Vite + Nitro', role: m.tech_build },
      { name: 'Vercel', role: m.tech_hosting },
    ],
  },
] as const

function App() {
  const { signedIn } = Route.useLoaderData()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-20 pb-16 sm:px-6 lg:gap-14 lg:pt-20">
      <section className="flex flex-col items-start gap-6 lg:pb-4">
        <h1 className="max-w-4xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {m.landing_heading()}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {m.landing_subheading()}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          {signedIn ? (
            <Button asChild size="lg">
              <Link to="/overview">{m.landing_cta_overview()}</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/signup">{m.landing_cta_signup()}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">{m.landing_cta_login()}</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <Section heading={m.features_heading()}>
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature.title()} className="flex flex-col gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <feature.icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{feature.title()}</h3>
              <p className="leading-relaxed text-muted-foreground">
                {feature.description()}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <section className="flex flex-col gap-8 border-t border-border pt-8">
        <h2 className="text-2xl font-bold tracking-tight">
          {m.tech_heading()}
        </h2>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {techGroups.map((group) => (
            <div
              key={group.label()}
              className="flex flex-col gap-5 border-t-2 border-brand pt-4"
            >
              <h3 className="font-semibold">{group.label()}</h3>
              <dl className="flex flex-col gap-4">
                {group.tools.map((tool) => (
                  <div key={tool.name}>
                    <dt className="font-medium">{tool.name}</dt>
                    <dd className="text-sm text-muted-foreground">
                      {tool.role()}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function Section({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-8 border-t border-border pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  )
}
