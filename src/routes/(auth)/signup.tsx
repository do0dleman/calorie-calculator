import { authClient } from '#/lib/auth-client'
import { getSession } from '#/lib/auth.functions'
import { authSearchSchema, safeRedirect } from './-utils/safe-redirect'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useForm } from '@tanstack/react-form'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

const nameSchema = z.string().trim().min(1, 'Enter your name')
const emailSchema = z.email('Enter a valid email')
const passwordSchema = z.string().min(8, 'Use at least 8 characters')

export const Route = createFileRoute('/(auth)/signup')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ search }) => {
    const session = await getSession()
    if (session) {
      throw redirect({ href: safeRedirect(search.redirect) })
    }
  },
  component: SignupPage,
})

function SignupPage() {
  const { redirect: redirectTo } = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      if (value.password !== value.confirmPassword) {
        return
      }

      const { error } = await authClient.signUp.email({
        name: value.name.trim(),
        email: value.email.trim(),
        password: value.password,
      })

      if (error) {
        setFormError(error.message ?? 'Could not create your account')
        return
      }

      await router.invalidate()
      await navigate({ href: safeRedirect(redirectTo) })
    },
  })

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center px-4 py-10">
      <Card className="w-full border-border bg-card text-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription>
            Sign up with your name, email, and a password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field
              name="name"
              validators={{
                onBlur: nameSchema,
                onSubmit: nameSchema,
              }}
            >
              {(field) => {
                const message = fieldErrorMessage(field.state.meta.errors)
                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      autoComplete="name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={Boolean(message)}
                    />
                    {message ? (
                      <p className="text-sm text-destructive">{message}</p>
                    ) : null}
                  </div>
                )
              }}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onBlur: emailSchema,
                onSubmit: emailSchema,
              }}
            >
              {(field) => {
                const message = fieldErrorMessage(field.state.meta.errors)
                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={Boolean(message)}
                    />
                    {message ? (
                      <p className="text-sm text-destructive">{message}</p>
                    ) : null}
                  </div>
                )
              }}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onBlur: passwordSchema,
                onSubmit: passwordSchema,
              }}
            >
              {(field) => {
                const message = fieldErrorMessage(field.state.meta.errors)
                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={Boolean(message)}
                    />
                    {message ? (
                      <p className="text-sm text-destructive">{message}</p>
                    ) : null}
                  </div>
                )
              }}
            </form.Field>

            <form.Field
              name="confirmPassword"
              validators={{
                onBlur: ({ value, fieldApi }) =>
                  value === fieldApi.form.getFieldValue('password')
                    ? undefined
                    : 'Passwords do not match',
                onSubmit: ({ value, fieldApi }) =>
                  value === fieldApi.form.getFieldValue('password')
                    ? undefined
                    : 'Passwords do not match',
              }}
            >
              {(field) => {
                const message = fieldErrorMessage(field.state.meta.errors)
                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Confirm password</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={Boolean(message)}
                    />
                    {message ? (
                      <p className="text-sm text-destructive">{message}</p>
                    ) : null}
                  </div>
                )
              }}
            </form.Field>

            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account…' : 'Create account'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Link
              to="/login"
              search={{ redirect: redirectTo }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

function fieldErrorMessage(errors: ReadonlyArray<unknown>) {
  for (const error of errors) {
    if (typeof error === 'string' && error) return error
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string' &&
      error.message
    ) {
      return error.message
    }
  }

  return null
}
