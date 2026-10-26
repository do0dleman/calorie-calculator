import { m } from '#/paraglide/messages'

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-10 sm:px-6">
        <h2 className="text-sm font-semibold">{m.about_heading()}</h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          {m.about_text()}
        </p>
      </div>
    </footer>
  )
}
