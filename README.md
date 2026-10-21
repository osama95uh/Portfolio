# Siam Khan Portfolio

A portfolio website built with Next.js 16, React 19, and Tailwind CSS 4.

## Requirements

- Node.js 20.9 or later
- npm

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm ci
npm run build
npm run start
```

The production server listens on port 3000 by default. Set the `PORT` environment
variable when the hosting platform assigns a different port.

## Deploy

### Vercel

Import this repository into Vercel and keep the detected Next.js framework
settings. Vercel will install dependencies and run `npm run build` automatically.
No environment variables are required by the current app.

### Node.js hosting

Use Node.js 20.9 or later, install dependencies with `npm ci`, build with
`npm run build`, then run `npm run start`. The project uses a dynamic project
details route, so deploy it with a Next.js server runtime rather than as a
static-only export.
