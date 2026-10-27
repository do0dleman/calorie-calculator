import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import type { ManualMeal } from '#/modules/chat/client/types'

const nameSchema = z.string().trim().min(1, 'Enter a name')

const amountSchema = z
  .string()
  .trim()
  .min(1, 'Enter an amount')
  .refine(
    (value) => Number.isFinite(Number(value)) && Number(value) >= 0,
    'Enter a number that is 0 or greater',
  )

const amountFields = [
  ['calories', 'Calories (kcal)'],
  ['protein', 'Protein (g)'],
  ['fat', 'Fat (g)'],
  ['carbs', 'Carbs (g)'],
] as const

function toFormValues(meal?: ManualMeal | null) {
  return {
    name: meal?.name ?? '',
    calories: meal ? String(meal.caloriesKcal) : '',
    protein: meal ? String(meal.proteinG) : '',
    fat: meal ? String(meal.fatG) : '',
    carbs: meal ? String(meal.carbsG) : '',
  }
}

export function ManualMealDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
  title = 'Add a meal',
  submitLabel = 'Save meal',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (meal: ManualMeal) => Promise<void>
  initial?: ManualMeal | null
  title?: string
  submitLabel?: string
}) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: toFormValues(initial),
    onSubmit: async ({ value, formApi }) => {
      setFormError(null)

      try {
        await onSubmit({
          name: value.name.trim(),
          caloriesKcal: Number(value.calories),
          proteinG: Number(value.protein),
          fatG: Number(value.fat),
          carbsG: Number(value.carbs),
        })
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : 'Could not save the meal',
        )
        return
      }

      formApi.reset(toFormValues(initial))
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (!open) return
    setFormError(null)
    form.reset(toFormValues(initial))
  }, [open, initial, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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

          {amountFields.map(([name, label]) => (
            <form.Field
              key={name}
              name={name}
              validators={{
                onBlur: amountSchema,
                onSubmit: amountSchema,
              }}
            >
              {(field) => {
                const message = fieldErrorMessage(field.state.meta.errors)
                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>{label}</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      inputMode="decimal"
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
          ))}

          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : submitLabel}
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
