import AvatarMenu from './avatar_menu.tsx'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-row-reverse flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <AvatarMenu />
      </nav>
    </header>
  )
}
