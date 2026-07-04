Shree Vaari Chit Finance Admin — multi-branch chit fund management built with Next.js, TypeScript, Tailwind, shadcn/ui and Prisma (PostgreSQL).

## Database (Prisma + PostgreSQL)

Prisma 7 with the pg driver adapter. Schema: `prisma/schema.prisma`, CLI config: `prisma.config.ts`, client singleton: `src/lib/prisma.ts`.

```bash
cp .env.example .env        # set DATABASE_URL (local Postgres or Supabase)
createdb shree_vaari        # local dev database (Homebrew PostgreSQL)
npm run db:migrate          # create/apply migrations
npm run db:seed             # seed demo data (3 branches, 25 customers, 5 chits, …)
npm run db:studio           # browse data in Prisma Studio
```

To point at Supabase later, replace `DATABASE_URL` in `.env` with the Supabase connection string and run `npm run db:migrate` — no schema changes needed.

Sample DB-backed endpoint: `GET /api/branches` (branch list with live aggregates). The UI currently reads from the mock data layer in `src/data`; migrate modules to API routes incrementally.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
