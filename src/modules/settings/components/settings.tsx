import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useNavigate, useRouter } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { authClient } from '#/lib/auth-client'
import { useDailyGoals, type DailyGoals } from '#/modules/overview/daily_goals'
import { NUTRIENTS } from '#/modules/overview/nutrients'
import { m } from '#/paraglide/messages'

function goalFieldError(value: string) {
  const amount = Number(value.trim())
  if (!Number.isFinite(amount) || amount <= 0) {
    return m.settings_goals_invalid()
  }
  return undefined
}

function toGoalValues(goals: DailyGoals) {
  return {
    calories: String(goals.calories),
    protein: String(goals.protein),
    fat: String(goals.fat),
    carbs: String(goals.carbs),
  }
}

export function Settings() {
  const { goals, saveGoals } = useDailyGoals()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-4 pb-24 sm:px-6 sm:pt-6 sm:pb-10">
      <h1 className="text-xl font-semibold">{m.settings_title()}</h1>
      <GoalsCard goals={goals} saveGoals={saveGoals} />
      <AccountCard />
    </main>
  )
}

function GoalsCard({
  goals,
  saveGoals,
}: {
  goals: DailyGoals
  saveGoals: (next: DailyGoals) => void
}) {
  const [saved, setSaved] = useState(false)

  const form = useForm({
    defaultValues: toGoalValues(goals),
    onSubmit: ({ value }) => {
      saveGoals({
        calories: Number(value.calories),
        protein: Number(value.protein),
        fat: Number(value.fat),
        carbs: Number(value.carbs),
      })
      setSaved(true)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.settings_goals_title()}</CardTitle>
        <CardDescription>{m.settings_goals_description()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          {NUTRIENTS.map((nutrient) => (
            <form.Field
              key={nutrient.key}
              name={nutrient.key}
              validators={{
                onBlur: ({ value }) => goalFieldError(value),
                onSubmit: ({ value }) => goalFieldError(value),
              }}
            >
              {(field) => {
                const message = fieldErrorMessage(field.state.meta.errors)
                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>
                      {nutrient.label()} ({nutrient.unit})
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        setSaved(false)
                        field.handleChange(event.target.value)
                      }}
                      aria-invalid={Boolean(message)}
                    />
                    {message ? (
                      <p className="text-sm text-destructive">{message}</p>
                    ) : null}
                  </div>
                )
              }}
            </form.Field>
          ))}
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit">{m.settings_goals_save()}</Button>
            {saved ? (
              <p className="text-sm text-muted-foreground">
                {m.settings_goals_saved()}
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function AccountCard() {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.settings_account_title()}</CardTitle>
        <CardDescription>{m.settings_account_description()}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setOpen(true)}
        >
          {m.settings_delete_account()}
        </Button>
      </CardFooter>
      <DeleteAccountDialog open={open} onOpenChange={setOpen} />
    </Card>
  )
}

function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { password: '' },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const { error } = await authClient.deleteUser({
        password: value.password,
      })

      if (error) {
        setFormError(error.message ?? m.settings_delete_error())
        return
      }

      await router.invalidate()
      await navigate({ to: '/' })
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setFormError(null)
          form.reset()
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.settings_delete_title()}</DialogTitle>
          <DialogDescription>
            {m.settings_delete_description()}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="password"
            validators={{
              onSubmit: ({ value }) =>
                value ? undefined : m.settings_delete_password_required(),
            }}
          >
            {(field) => {
              const message = fieldErrorMessage(field.state.meta.errors)
              return (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="delete-account-password">
                    {m.settings_delete_password()}
                  </Label>
                  <Input
                    id="delete-account-password"
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
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

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {m.settings_delete_cancel()}
              </Button>
            </DialogClose>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? m.settings_delete_working()
                    : m.settings_delete_confirm()}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function fieldErrorMessage(errors: ReadonlyArray<unknown>) {
  for (const error of errors) {
    if (typeof error === 'string' && error) return error
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message
    }
  }

  return null
}
