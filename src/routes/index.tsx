import { m } from '#/paraglide/messages'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="container mx-auto mt-2 px-1">
      <h1 className="text-lg mb-2">{m.home_page()}</h1>
      <p>Info about the app goes here</p>
    </main>
  )
}
