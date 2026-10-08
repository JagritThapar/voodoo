# Aussie Energy Savers: customer app

A mobile-first web app (installable as a PWA) for [Aussie Energy Savers](https://www.aussieenergysavers.com.au) customers, plus an admin console for the AES team.

## What customers can do

| Area | Features |
| --- | --- |
| **Design & quote** | Build a system (solar size, panel range, inverter, battery, EV charger, heat pump hot water, bird proofing) and see a live estimate with federal STC / Cheaper Home Batteries rebates, yearly savings and payback. Then request a quote. |
| **Track projects** | Progress from quote requested → quote ready → accepted → install booked → installed → grid connected. Accept or decline quotes, see install date and installer, and follow a timeline. |
| **Paperwork** | A checklist is created when a quote is accepted (contract, deposit, electricity bill, STC form, network approval, CES, meter, warranty pack, plus Solar Victoria in VIC). Customers upload PDFs/photos from their phone. |
| **Reviews** | Rate the overall experience and the installer once the install is complete. |
| **Refer & earn** | Personal referral code and link (share via SMS, WhatsApp, email or the native share sheet), or submit a friend's details directly. Each referral shows its status. |
| **Network** | Multi-level tree of everyone who joined through you and the people they referred, with per-level counts and earnings. |
| **Earnings** | Clearing and available balances, reward history, bank details and payout requests. |
| **News & offers** | Feed of news and time-limited offers published by AES. |

## Referral rewards (multi-level)

Rewards are created when a referred customer's system is **installed**, never for sign-ups alone. Each upline member is paid according to `REWARD_LEVELS` in `src/lib/constants.ts`:

| Level | Who | Default |
| --- | --- | --- |
| 1 | You referred them directly | $500 |
| 2 | Someone you referred referred them | $150 |
| 3 | Third level | $50 |

Rewards start as **Clearing**. An admin approves them (one click approves everything older than 14 days) and they become **Available**. The customer withdraws, and the admin marks the payout paid with a bank reference.

> Because rewards depend only on completed installs (product sales) and not on recruitment, the program is a referral scheme rather than a pyramid scheme under the Competition and Consumer Act. Have the final terms reviewed by a lawyer before launch.

## Admin console (`/admin`)

- Overview: new quote requests, installs in progress, payouts to process, latest reviews, customer list
- Projects: set status, quote price, summary, validity, install date and installer, add timeline notes, review and upload paperwork
- Referrals: work leads, change status, approve or void rewards
- Payouts: bank details, mark paid or reject
- News & offers: publish and delete posts

## Running it

Requires **Node 22+**.

```bash
npm install
npm run dev        # http://localhost:3000
# or
npm run build && npm start
```

Locally the data lives in a SQLite file at `data/aes.db`, created on first start and seeded with:

- Admin: `admin@aussieenergysavers.com.au` / `ChangeMe123!` (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Demo customer with a 3-level network: `demo@aes.test` / `demo1234` (disable with `SEED_DEMO=false`)

Uploaded paperwork is stored in the database too (5 MB per file), so the app needs no disk.

### Free hosting: Render + Turso

1. Create a free database at [turso.tech](https://turso.tech). Copy its **URL** (`libsql://…turso.io`) and create a **token**.
2. In Render: **New → Blueprint**, pick this repo. `render.yaml` sets up a free web service.
3. Fill in `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_PASSWORD` and `APP_URL` when asked, then deploy.

Free Render services sleep after 15 minutes without visitors; the next visit takes about a minute to wake up. Your data is safe in Turso.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Hosted Turso database (when unset, a local file is used) |
| `DATABASE_PATH` | Local SQLite file location (default `data/aes.db`) |
| `APP_URL` | Public URL used in referral links (otherwise taken from the request) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account |
| `SEED_DEMO` | `false` to skip demo data |

## Things to configure

- **Pricing and rebates:** `src/lib/catalog.ts` (product prices, STC price, zone ratings, battery STC factor, tariffs). All figures are indicative placeholders.
- **Reward amounts and payout minimum:** `src/lib/constants.ts`
- **Company phone and email:** `COMPANY` in `src/lib/constants.ts`

## Brand

The look follows the AES capability statement and brand strategy: Ink `#181818` as the base, Yellow `#FCCD01` for actions and highlights, Lime `#8EF840` as the accent, heavy condensed Archivo headlines with Geist body text, and real install photos (`public/brand/photos`). Colour tokens live in `tailwind.config.ts`; shared styles (`.display`, `.eyebrow`, `.stat-num`, `.btn-volt`, `.grain`) are in `src/app/globals.css`.

## Tech

Next.js 15 (App Router, server actions), React 19, Tailwind CSS 3, SQLite / Turso via `@libsql/client`, scrypt password hashing, httpOnly session cookies.
