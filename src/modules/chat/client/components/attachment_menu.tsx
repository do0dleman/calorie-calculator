import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { UIMessage } from '@tanstack/ai-react'
import { useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Camera, ImageIcon, PenLine, Plus } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { storedToUIMessage } from '#/modules/chat/common/stored_parts'
import { createManualMeal } from '#/modules/meal/meal.functions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

import { ManualMealDialog } from './manual_meal_dialog'

export function AttachmentMenu({
  onPick,
  onLoggedMeal,
}: {
  onPick: (file: File) => void
  onLoggedMeal: (message: UIMessage) => void
}) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [mealOpen, setMealOpen] = useState(false)
  const queryClient = useQueryClient()
  const saveMeal = useServerFn(createManualMeal)

  function onPicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onPick(file)
    event.target.value = ''
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Add attachment"
          >
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start">
          <DropdownMenuItem onSelect={() => cameraRef.current?.click()}>
            <Camera />
            Camera
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
            <ImageIcon />
            File
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setMealOpen(true)}>
            <PenLine />
            By hand
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPicked}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPicked}
      />

      <ManualMealDialog
        open={mealOpen}
        onOpenChange={setMealOpen}
        onSubmit={async (fields) => {
          const { message } = await saveMeal({ data: fields })
          onLoggedMeal(storedToUIMessage(message))
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['daily-meals'] }),
            queryClient.invalidateQueries({ queryKey: ['daily-totals'] }),
            queryClient.invalidateQueries({ queryKey: ['chat-messages'] }),
          ])
        }}
      />
    </>
  )
}
