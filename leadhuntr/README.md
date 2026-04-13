# LeadHuntr — Reddit Lead Finder for SaaS Founders

LeadHuntr monitors Reddit 24/7 and finds people actively looking for tools like yours. AI-scored leads delivered to your dashboard.

Built with Next.js 14 (App Router), Supabase, Stripe, Google Gemini, Resend, and Tailwind CSS.

## Features

- **Reddit monitoring**: Scan any number of subreddits for posts matching your keywords
- **AI scoring**: Every post is scored 0–100 for buying intent by Google Gemini
- **AI replies**: Auto-generated, helpful Reddit replies you can edit and post yourself
- **Smart dashboard**: Filters, statuses (new/saved/contacted/dismissed), pagination
- **Email alerts**: Realtime alerts for hot leads, daily/weekly digests
- **Stripe billing**: Free, Pro ($29), and Business ($79) plans with usage limits enforced server-side
- **Row Level Security**: Every Supabase table is locked down so users only see their own data
- **Cron jobs**: Vercel cron triggers Reddit scans and digest emails

## Tech Stack

| Layer       | Tool                         |
| ----------- | ---------------------------- |
| Framework   | Next.js 14 (App Router)      |
| Language    | TypeScript (strict)          |
| Database    | Supabase (PostgreSQL + Auth) |
| Styling     | Tailwind CSS                 |
| AI          | Google Gemini 2.0 Flash      |
| Reddit      | Reddit OAuth API             |
| Payments    | Stripe Checkout + Portal     |
| Emails      | Resend                       |
| Rate limit  | Upstash Redis                |
| Hosting     | Vercel                       |

## Local Setup

### 1. Install dependencies

```bash
cd leadhuntr
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the keys (see `.env.local.example` for the full list). At minimum you'll need:

- A Supabase project (URL, anon key, service role key)
- A Reddit app (https://www.reddit.com/prefs/apps — script type)
- A Google Gemini API key (https://aistudio.google.com/)

Stripe, Resend, and Upstash are optional for local dev — the app degrades gracefully without them.

### 3. Run Supabase migrations

In the SQL editor of your Supabase project, paste the contents of:

```
supabase/migrations/0001_initial_schema.sql
```

This creates all tables, RLS policies, and the auto-create-profile trigger.

### 4. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Stripe Setup

1. Create two recurring prices in your Stripe dashboard (Pro $29/mo, Business $79/mo)
2. Copy the price IDs into `STRIPE_PRO_PRICE_ID` and `STRIPE_BUSINESS_PRICE_ID`
3. Create a webhook endpoint pointing to `https://your-domain.com/api/webhooks/stripe`
4. Subscribe to events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

## Deploying to Vercel

1. Push the `leadhuntr/` directory to a Git repo (or use the existing one with the project root set to `leadhuntr/`)
2. Import the project in Vercel
3. Add all env vars from `.env.local.example`
4. Vercel will pick up `vercel.json` and auto-configure the cron jobs
5. Deploy

The cron jobs run at:
- `/api/cron/scan-reddit` — every hour
- `/api/cron/send-alerts` — daily at 8am UTC

Both are protected by `CRON_SECRET` (Vercel sends it in the `Authorization: Bearer` header automatically).

## Project Structure

```
src/
├── app/
│   ├── (landing) page.tsx, layout.tsx
│   ├── login/ signup/ auth/
│   ├── dashboard/             # Protected app
│   │   ├── page.tsx           # Overview
│   │   ├── leads/             # All leads + filters
│   │   ├── lead/[id]/         # Lead detail
│   │   ├── monitors/          # CRUD monitors
│   │   ├── settings/
│   │   └── billing/
│   └── api/
│       ├── monitors/  leads/  ai/  account/
│       ├── stripe/            # checkout + portal
│       ├── webhooks/stripe/
│       └── cron/              # scan-reddit + send-alerts
├── components/
│   ├── ui/                    # Button, Card, Modal, Toast, …
│   ├── landing/               # Hero, HowItWorks, Pricing, FAQ, Footer
│   └── dashboard/             # Sidebar, Header, LeadCard, StatsCard
├── lib/
│   ├── supabase/              # client, server, admin, middleware
│   ├── ai.ts                  # Gemini scoring + reply generation
│   ├── reddit.ts              # OAuth + post fetching
│   ├── stripe.ts
│   ├── resend.ts              # Email templates
│   ├── plans.ts               # Plan limits + helpers
│   ├── rate-limit.ts          # Upstash sliding window
│   └── utils.ts
├── types/                     # Database + domain types
└── middleware.ts              # Supabase session + route protection
```

## Plans

| Feature             | Free        | Pro ($29) | Business ($79) |
| ------------------- | ----------- | --------- | -------------- |
| Monitors            | 1           | 5         | 20             |
| Subreddits          | 3           | 15        | Unlimited      |
| Keywords            | 5           | 25        | Unlimited      |
| Leads / day         | 10          | 100       | Unlimited      |
| Scan interval       | 6 h         | 1 h       | 30 min         |
| AI replies          | -           | Yes       | Yes            |
| Email alerts        | -           | Yes       | Yes            |
| CSV export          | -           | Yes       | Yes            |
| API access          | -           | -         | Yes            |

Plan limits are enforced **server-side** in every API route — never trust the client.

## Security

- Row Level Security on every Supabase table
- Zod validation on every API route
- Stripe webhook signature verification
- `CRON_SECRET` on cron endpoints
- Upstash rate limiting on user-facing API routes
- Open-redirect protection on auth callback

## License

MIT
