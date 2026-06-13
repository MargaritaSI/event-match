# EventMatch — optional cloud backend (Supabase)

EventMatch runs fully **offline on `localStorage`** out of the box. Turning on a free
Supabase backend adds **real cross-device sync** for the core entities:

| Synced (cloud)             | Stays on device (local) |
| -------------------------- | ----------------------- |
| Your profile / card        | Points, badges, level   |
| Connections (your matches) | Selected schedule       |
| Meeting requests (live)    |                         |
| Follow-up tasks            |                         |

Identity is **anonymous, per device** (Supabase anonymous auth) — no login screen, no
pre-filled card (each visitor creates their own). Contact handles are **never** stored in the
world-readable profiles table; they're still exchanged via the share-link / QR (which encodes
only the contacts you chose to reveal).

> ⚠️ **Cross-device today:** because identity is per-device, your data is scoped to *this*
> browser/phone. Opening the app on a second device starts a fresh anonymous account, so your
> tasks/profile don't follow you there **yet** — that needs the login step below.

It's **opt-in**: with no keys configured the app ignores all of this and works exactly as before.
The supabase-js library is even code-split, so a keyless build never downloads it.

---

## Setup (about 5 minutes)

### 1. Create a free Supabase project
- Go to <https://supabase.com> → **New project** (free tier).
- Wait for it to provision.

### 2. Create the tables
- Open **SQL Editor → New query**.
- Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and **Run**.
- This creates `profiles`, `connections`, `requests`, their Row-Level-Security policies, and
  enables realtime. It's safe to re-run.

### 3. Enable anonymous sign-ins
- **Authentication → Sign In / Providers → Anonymous sign-ins → Enable.**

### 4. Grab your keys
- **Project Settings → API** (or **Data API**).
- Copy the **Project URL** and the **anon / publishable** key.
  ⚠️ Use the *anon* key, **never** the `service_role` secret.

### 5. Add the keys
Create a `.env` (or `.env.local`) at the project root — see [`.env.example`](.env.example):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Then `npm run dev`. That's it — cloud sync is on.

> **For the deployed GitHub Pages site:** the build inlines `VITE_*` vars, so set the same two
> values as **GitHub → repo Settings → Secrets and variables → Actions → Variables**, and pass
> them into the build step in `.github/workflows/deploy.yml`
> (`env: VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}` …). The anon key is public by design,
> so this is safe.

---

## How to verify it works
1. Open the app on **two devices / browsers** (one in incognito).
2. On each, go to **My Card → Edit → Save** — each device publishes its profile.
3. Both profiles now appear in **People** on the other device (live).
4. Tap **Want to meet** on device A → a 🔔 request appears in device B's inbox in real time.
5. Accept it on B → it becomes a connection on both sides.

## Free-tier headroom
The data is tiny (small JSON rows), so the Supabase free tier (500 MB DB · 50k monthly users ·
realtime) covers a real event with plenty of room. Note the free project **pauses after ~1 week
of inactivity** — just un-pause it from the dashboard.

## Roadmap — cross-device login (next step)

To make a user's card and tasks follow them from phone → laptop, add a **shared account
identity** on top of the current per-device anonymous auth:

1. **Magic-link email** (recommended) — Supabase built-in, free, no passwords, no OAuth setup.
   Keep the frictionless anonymous start, then offer **"Sign in to sync across devices"**, which
   **upgrades the existing anonymous account to a permanent one** (`supabase.auth.updateUser`
   / `linkIdentity`) so all current data is preserved. Entering the same email on another device
   lands in the same account → profile + tasks appear.
2. **Google / OAuth** can be added later as a one-tap option (needs a Google OAuth app + client
   id/secret in Supabase; for a future *native* iOS build, Apple also requires Sign in with Apple).

The data layer is already keyed to `auth.uid()`, so once a device's anonymous account becomes a
real account, its rows (profile, connections, requests, tasks) carry over with no migration.

## Architecture
- `src/lib/backend/client.ts` — lazily builds the client from env keys (or stays null).
- `src/lib/backend/mappers.ts` — pure row ⇄ domain mappings (unit-tested).
- `src/lib/backend/index.ts` — async data layer; every call is a no-op when disabled.
- `src/lib/profile.ts` — the "My Card" profile type, blank default + `profileToUser` mapping.
- `src/lib/tasks.ts` — offline (localStorage) task persistence.
- `src/App.tsx` — boots the session, merges cloud profiles into discovery, syncs connections &
  requests, and subscribes to realtime. All behind the `isBackendEnabled` flag.
