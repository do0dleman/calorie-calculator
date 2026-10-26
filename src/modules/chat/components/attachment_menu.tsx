import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { Camera, ImageIcon, PenLine, Plus } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export function AttachmentMenu({ onPick }: { onPick: (file: File) => void }) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
          <DropdownMenuItem>
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
    </>
  )
}
