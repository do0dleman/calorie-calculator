import { Button } from '#/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { getSession } from '#/lib/auth.functions'
import { m } from '#/paraglide/messages'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CameraIcon,
  ChartPieIcon,
  MessageSquareIcon,
  UtensilsCrossedIcon,
} from 'lucide-react'

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

function App() {
  const { signedIn } = Route.useLoaderData()

  return (
    <main className="container mx-auto flex flex-col gap-20 px-4 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          {m.landing_badge()}
        </span>
        <h1 className="max-w-2xl font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          {m.landing_heading()}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {m.landing_subheading()}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
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

      <section className="flex flex-col gap-6">
        <h2 className="text-center font-serif text-2xl font-bold">
          {m.features_heading()}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title()}>
              <CardHeader>
                <feature.icon className="mb-2 size-6 text-muted-foreground" />
                <CardTitle>{feature.title()}</CardTitle>
                <CardDescription>{feature.description()}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-center font-serif text-2xl font-bold">
          {m.how_to_heading()}
        </h2>
        <ol className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step.title()} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title()}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description()}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-center font-serif text-2xl font-bold">
          {m.tech_heading()}
        </h2>
        <ul className="mx-auto grid w-full max-w-3xl gap-x-8 gap-y-3 sm:grid-cols-2">
          {techStack.map((tech) => (
            <li
              key={tech.name}
              className="flex items-baseline justify-between gap-4 border-b border-border pb-2"
            >
              <span className="font-medium">{tech.name}</span>
              <span className="text-sm text-muted-foreground">
                {tech.role()}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-2xl text-center">
        <h2 className="mb-3 font-serif text-2xl font-bold">
          {m.about_heading()}
        </h2>
        <p className="text-muted-foreground">{m.about_text()}</p>
      </section>
    </main>
  )
}
