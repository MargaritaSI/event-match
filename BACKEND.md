# EventMatch — optional cloud backend (Supabase)

EventMatch runs fully **offline on `localStorage`** out of the box. Turning on a free
Supabase backend adds **real cross-device sync** for the core entities:

| Synced (cloud)            | Stays on device (local) |
| ------------------------- | ----------------------- |
| Your profile / card       | Tasks & follow-ups      |
| Connections (your matches)| Points, badges, level   |
| Meeting requests (live)   | Selected schedule       |

Identity is **anonymous, per device** (Supabase anonymous auth) — no login screen. Contact
handles are **never** stored in the world-readable profiles table; they're still exchanged via
the share-link / QR (which encodes only the contacts you chose to reveal).

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

## Architecture
- `src/lib/backend/client.ts` — lazily builds the client from env keys (or stays null).
- `src/lib/backend/mappers.ts` — pure row ⇄ domain mappings (unit-tested).
- `src/lib/backend/index.ts` — async data layer; every call is a no-op when disabled.
- `src/lib/profile.ts` — the "My Card" profile type + `profileToUser` mapping.
- `src/App.tsx` — boots the session, merges cloud profiles into discovery, syncs connections &
  requests, and subscribes to realtime. All behind the `isBackendEnabled` flag.
