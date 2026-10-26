import { Button } from '#/components/ui/button'
import { m } from '#/paraglide/messages'
import { getLocale, locales, setLocale } from '#/paraglide/runtime'

export default function LanguageToggle() {
  const nextLocale =
    locales.find((locale) => locale !== getLocale()) ?? locales[0]

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setLocale(nextLocale)}
      aria-label={m.language_switch()}
      title={m.language_switch()}
      className="text-xs font-semibold"
    >
      {nextLocale.toUpperCase()}
    </Button>
  )
}
