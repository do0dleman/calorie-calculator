import { authClient } from '#/lib/auth-client.ts'
import { m } from '#/paraglide/messages'
import { getLocale, locales, setLocale } from '#/paraglide/runtime'
import { Link } from '@tanstack/react-router'
import {
  LanguagesIcon,
  LogInIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react'
import { useThemeMode } from './theme_toggle'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Skeleton } from './ui/skeleton'
import { Button } from './ui/button'

const localeLabels: Record<(typeof locales)[number], string> = {
  en: 'English',
  lv: 'Latviešu',
}

const themeOptions = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'auto', label: 'Auto', icon: MonitorIcon },
] as const

export default function AvatarMenu() {
  const { data: session, isPending } = authClient.useSession()
  const { mode, selectMode } = useThemeMode()
  const currentLocale = getLocale()
  const ThemeIcon =
    themeOptions.find((option) => option.value === mode)?.icon ?? MonitorIcon

  if (isPending) {
    return (
      <div className="flex gap-2 items-center">
        <Skeleton className="w-24 h-4" />
        <Avatar>
          <AvatarFallback className="bg-transparent">
            <Skeleton className="w-full h-full delay-300" />
          </AvatarFallback>
        </Avatar>
      </div>
    )
  }

  if (!session) {
    return (
      <Button asChild variant={'secondary'}>
        <Link to="/demo/better-auth">
          <LogInIcon />
          Sign in
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-2 items-center">
        {session.user.name}
        <Avatar>
          <AvatarImage src={session.user.image ?? ''} />
          <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <LanguagesIcon />
            {m.language_label()}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={currentLocale}
              onValueChange={(locale) => {
                setLocale(locale as (typeof locales)[number])
              }}
            >
              {locales.map((locale) => (
                <DropdownMenuRadioItem key={locale} value={locale}>
                  <span className="flex size-4 items-center justify-center text-[10px] font-semibold tracking-tight">
                    {locale.toUpperCase()}
                  </span>
                  {localeLabels[locale]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ThemeIcon />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={mode}
              onValueChange={(value) => {
                if (value === 'light' || value === 'dark' || value === 'auto') {
                  selectMode(value)
                }
              }}
            >
              {themeOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <option.icon />
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => authClient.signOut()}>
          <LogOutIcon />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
