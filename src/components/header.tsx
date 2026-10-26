import { Link } from '@tanstack/react-router'
import { ChartPieIcon, MessageSquareIcon, SettingsIcon } from 'lucide-react'
import { m } from '#/paraglide/messages'
import AvatarMenu from './avatar_menu.tsx'

const navItems = [
  { to: '/overview', label: m.nav_overview, icon: ChartPieIcon },
  { to: '/chat', label: m.nav_chat, icon: MessageSquareIcon },
  { to: '/settings', label: m.nav_settings, icon: SettingsIcon },
] as const

function NavLinks({
  className,
  iconClassName,
}: {
  className: string
  iconClassName: string
}) {
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          aria-label={item.label()}
          title={item.label()}
          className={`group ${className}`}
        >
          <span
            className={`flex items-center justify-center transition-colors ${iconClassName}`}
          >
            <item.icon className="size-5" aria-hidden />
          </span>
        </Link>
      ))}
    </>
  )
}

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 backdrop-blur-lg">
        <div className="page-wrap flex items-center justify-between gap-3 py-3 sm:py-4">
          <Link className="font-bold tracking-tight" to="/">
            {m.landing_title()}
          </Link>
          <nav className="hidden gap-1 sm:flex">
            <NavLinks
              className="flex"
              iconClassName="size-9 rounded-md group-data-[status=active]:bg-muted hover:bg-muted/60"
            />
          </nav>
          <AvatarMenu />
        </div>
      </header>

      {/* On phones the navigation moves to a bar at the bottom of the screen;
          the current page's whole section of the bar is highlighted */}
      <nav
        data-bottom-nav
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg sm:hidden"
      >
        <NavLinks
          className="flex h-14 flex-1 items-center justify-center transition-colors data-[status=active]:bg-muted"
          iconClassName=""
        />
      </nav>
    </>
  )
}
