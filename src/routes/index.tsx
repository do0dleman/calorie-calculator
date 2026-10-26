import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { getSession } from '#/lib/auth.functions'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
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

const steps = [
  { title: m.step_signup_title, description: m.step_signup_description },
  { title: m.step_log_title, description: m.step_log_description },
  { title: m.step_overview_title, description: m.step_overview_description },
  { title: m.step_chat_title, description: m.step_chat_description },
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

// Sample day shown in the hero mockup of the overview screen
const sampleGoal = 2200
const sampleMacros = [
  { label: m.mock_protein, value: 96, goal: 130 },
  { label: m.mock_fat, value: 52, goal: 70 },
  { label: m.mock_carbs, value: 180, goal: 250 },
] as const
const sampleMeals = [
  { name: m.mock_meal_breakfast, kcal: 420, fromPhoto: false },
  { name: m.mock_meal_lunch, kcal: 610, fromPhoto: false },
  { name: m.mock_meal_dinner, kcal: 610, fromPhoto: true },
] as const
const sampleTotal = sampleMeals.reduce((sum, meal) => sum + meal.kcal, 0)

function App() {
  const { signedIn } = Route.useLoaderData()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 pt-12 pb-24 sm:px-6 lg:gap-24 lg:pt-20">
      <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex flex-col items-start gap-6">
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-brand" aria-hidden />
            {m.landing_badge()}
          </p>
          <h1 className="max-w-xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {m.landing_heading()}
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
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
        </div>

        <div className="flex justify-center rounded-3xl bg-brand/8 px-4 py-10 sm:py-14">
          <OverviewMockup />
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

      <Section heading={m.how_to_heading()}>
        <Card>
          <CardContent>
            <ol className="flex flex-col">
              {steps.map((step, index) => (
                <li
                  key={step.title()}
                  className="relative pb-8 pl-12 last:pb-0"
                >
                  {index < steps.length - 1 && (
                    <span
                      className="absolute top-9 bottom-1 left-4 w-px bg-border"
                      aria-hidden
                    />
                  )}
                  <span className="absolute top-0 left-0 flex size-8 items-center justify-center rounded-full border border-brand/40 text-sm font-semibold text-brand tabular-nums">
                    {index + 1}
                  </span>
                  <h3 className="pt-1 font-semibold">{step.title()}</h3>
                  <p className="mt-1 text-muted-foreground">
                    {step.description()}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </Section>

      <Section heading={m.tech_heading()}>
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

      <Section heading={m.about_heading()}>
        <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">
          {m.about_text()}
        </p>
      </Section>
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
    <section className="grid gap-8 border-t border-border pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

function OverviewMockup() {
  const format = new Intl.NumberFormat(getLocale())
  const share = (sampleTotal / sampleGoal) * 100

  return (
    <figure
      aria-label={m.mock_label()}
      className="w-full max-w-[19rem] rounded-[2.5rem] bg-foreground/90 p-2 shadow-2xl shadow-brand/20 dark:bg-secondary"
    >
      <div className="flex flex-col gap-5 rounded-[2rem] bg-background p-5 text-foreground">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{m.mock_today()}</span>
          <ChartPieIcon className="size-4 text-muted-foreground" aria-hidden />
        </div>

        <div className="flex items-center gap-4">
          <svg viewBox="0 0 120 120" className="size-24 shrink-0 -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="10"
              className="stroke-muted"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset={100 - share}
              className="stroke-brand motion-safe:animate-[ring-fill_1.2s_cubic-bezier(0.2,0.8,0.2,1)_both]"
            />
          </svg>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold tracking-tight tabular-nums">
              {format.format(sampleTotal)}
            </span>
            <span className="text-sm text-muted-foreground">
              {m.mock_goal({ goal: format.format(sampleGoal) })}
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {sampleMacros.map((macro) => (
            <li key={macro.label()} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-medium">{macro.label()}</span>
                <span className="text-muted-foreground tabular-nums">
                  {m.mock_grams({ value: macro.value, goal: macro.goal })}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full origin-left rounded-full bg-brand motion-safe:animate-[bar-grow_1.2s_cubic-bezier(0.2,0.8,0.2,1)_both]"
                  style={{ width: `${(macro.value / macro.goal) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        <ul className="flex flex-col divide-y divide-border border-y border-border text-sm">
          {sampleMeals.map((meal) => (
            <li
              key={meal.name()}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{meal.name()}</span>
                {meal.fromPhoto && (
                  <CameraIcon
                    className="size-3.5 shrink-0 text-brand"
                    aria-label={m.mock_photo_logged()}
                  />
                )}
              </span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {m.mock_kcal({ value: format.format(meal.kcal) })}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 text-sm">
          <p className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
            {m.mock_chat_question()}
          </p>
          <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
            {m.mock_chat_answer()}
          </p>
        </div>
      </div>
    </figure>
  )
}
