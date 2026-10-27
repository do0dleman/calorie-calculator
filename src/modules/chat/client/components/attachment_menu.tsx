import { useRef, useState } from 'react'
import type { ChangeEvent, ComponentProps } from 'react'
import type { UIMessage } from '@tanstack/ai-react'
import { useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Camera, ImageIcon, PenLine, Plus } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { storedToUIMessage } from '#/modules/chat/common/stored_parts'
import { createManualMeal } from '#/modules/meal/meal.functions'

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

  const [attachOpen, setAttachOpen] = useState(false)

  const options = [
    {
      label: 'Camera',
      icon: Camera,
      run: () => cameraRef.current?.click(),
    },
    {
      label: 'File',
      icon: ImageIcon,
      run: () => fileRef.current?.click(),
    },
    {
      label: 'By hand',
      icon: PenLine,
      run: () => setMealOpen(true),
    },
  ]

  function onPicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onPick(file)
    event.target.value = ''
  }

  function choose(run: () => void) {
    run()
    setAttachOpen(false)
  }

  return (
    <>
      <div className="md:hidden">
        <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
          <DialogTrigger asChild>
            <AddButton />
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>Add</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              {options.map(({ label, icon: Icon, run }) => (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  className="aspect-square h-auto flex-col gap-2 text-base"
                  onClick={() => choose(run)}
                >
                  <Icon className="size-10" />
                  {label}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <AddButton />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            {options.map(({ label, icon: Icon, run }) => (
              <DropdownMenuItem key={label} onSelect={run}>
                <Icon />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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

function AddButton(props: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Add attachment"
      {...props}
    >
      <Plus />
    </Button>
  )
}
