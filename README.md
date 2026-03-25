## Luna

Luna is a mobile-first cycle and intimacy tracker built with Next.js App Router, TypeScript, and Tailwind CSS.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

3. Add your Supabase values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Setup

This project now includes a minimal Supabase foundation for Next.js App Router:

- browser helper: `src/lib/supabase/client.ts`
- server helper: `src/lib/supabase/server.ts`
- shared env guard: `src/lib/supabase/env.ts`

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Local development:

- put both values in `.env.local`

Vercel:

- add the same two variables in Project Settings -> Environment Variables
- redeploy after saving them

Current status:

- Supabase is installed and ready
- existing localStorage MVP flows are still untouched
- auth and database tables are not wired yet

## Notes

Do not commit real secrets. `.env.local` is ignored by git through the existing `.env*` rule in `.gitignore`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
