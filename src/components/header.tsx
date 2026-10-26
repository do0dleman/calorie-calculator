import { Link } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import AvatarMenu from './avatar_menu.tsx'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 backdrop-blur-lg">
      <div className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4 justify-between">
        <Link className="font-bold tracking-tight" to="/">
          {m.landing_title()}
        </Link>
        <nav className="flex gap-4">
          <Link className="hover:underline" to="/overview">
            Overview
          </Link>
          <Link className="hover:underline" to="/chat">
            Chat
          </Link>
        </nav>
        <AvatarMenu />
      </div>
    </header>
  )
}
