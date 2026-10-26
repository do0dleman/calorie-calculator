import { m } from '#/paraglide/messages'

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <p className="mx-auto max-w-prose text-center text-sm leading-relaxed text-muted-foreground">
          {m.about_text()}
        </p>
      </div>
    </footer>
  )
}
