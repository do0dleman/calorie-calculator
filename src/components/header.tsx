import { Link } from '@tanstack/react-router'
import { ChartPieIcon, MessageSquareIcon, SettingsIcon } from 'lucide-react'
import { m } from '#/paraglide/messages'
import AvatarMenu from './avatar_menu.tsx'

const navItems = [
  { to: '/overview', label: m.nav_overview, icon: ChartPieIcon },
  { to: '/chat', label: m.nav_chat, icon: MessageSquareIcon },
  { to: '/settings', label: m.nav_settings, icon: SettingsIcon },
] as const

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 backdrop-blur-lg">
        <div className="page-wrap flex items-center justify-between gap-3 py-3 sm:py-4">
          <Link className="font-bold tracking-tight" to="/">
            {m.landing_title()}
          </Link>
          <nav className="hidden gap-4 sm:flex">
            {navItems.map((item) => (
              <Link key={item.to} className="hover:underline" to={item.to}>
                {item.label()}
              </Link>
            ))}
          </nav>
          <AvatarMenu />
        </div>
      </header>

      {/* On phones the navigation moves to an icon bar at the bottom of the screen;
          the current page's whole section of the bar is highlighted */}
      <nav
        data-bottom-nav
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg sm:hidden"
      >
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label()}
            title={item.label()}
            className="flex h-14 flex-1 items-center justify-center transition-colors data-[status=active]:bg-muted"
          >
            <item.icon className="size-5" aria-hidden />
          </Link>
        ))}
      </nav>
    </>
  )
}
