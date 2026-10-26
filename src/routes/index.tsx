import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
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

const techStack = [
  { name: 'TanStack Start', role: m.tech_framework },
  { name: 'React 19', role: m.tech_ui },
  { name: 'TypeScript', role: m.tech_language },
  { name: 'Tailwind CSS + shadcn/ui', role: m.tech_styling },
  { name: 'PostgreSQL + Drizzle ORM', role: m.tech_database },
  { name: 'Better Auth', role: m.tech_auth },
  { name: 'TanStack AI', role: m.tech_ai },
  { name: 'Paraglide JS', role: m.tech_i18n },
  { name: 'Vite + Nitro', role: m.tech_build },
  { name: 'Vercel', role: m.tech_hosting },
] as const

function App() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 pt-12 pb-24 sm:px-6 lg:gap-24 lg:pt-20">
      <section className="flex flex-col items-start gap-6 lg:py-8">
        <h1 className="max-w-4xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {m.landing_heading()}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {m.landing_subheading()}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild size="lg">
            <Link to="/signup">{m.landing_cta_signup()}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">{m.landing_cta_login()}</Link>
          </Button>
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

      <Section heading={m.tech_heading()} headingSide="right">
        <dl className="grid gap-x-10 sm:grid-cols-2">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-3"
            >
              <dt className="font-medium">{tech.name}</dt>
              <dd className="text-sm text-muted-foreground">{tech.role()}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </main>
  )
}

function Section({
  heading,
  headingSide = 'left',
  children,
}: {
  heading: string
  headingSide?: 'left' | 'right'
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'grid gap-8 border-t border-border pt-10 lg:gap-16',
        headingSide === 'left'
          ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]'
          : 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]',
      )}
    >
      <h2
        className={cn(
          'text-2xl font-bold tracking-tight',
          headingSide === 'right' && 'lg:order-last lg:text-right',
        )}
      >
        {heading}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  )
}
