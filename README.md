# Calorie calculator

Build for RTU subject "Programmatūras izstrādes tehnoloģija" as a prototype for the app described in previous assignments.

# Current deployment

Hosted via Vercel, check the [current deployment](https://calorie-calculator-sooty.vercel.app/).

# Local development

To run this application:

```bash
pnpm install
pnpm dev
```

# Building For Production

To build this application for production:

```bash
pnpm build
```

## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
pnpm lint
pnpm format
pnpm check
```

# Tech

## Paraglide i18n

This add-on wires up ParaglideJS for localized routing and message formatting.

- Messages live in `project.inlang/messages`.
- URLs are localized through the Paraglide Vite plugin and router `rewrite` hooks.
- Run the dev server or build to regenerate the `src/paraglide` outputs.

## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/).

```bash
pnpm dlx shadcn@latest add button
```
