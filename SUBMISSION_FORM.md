# EventMatch 🤝 — *Meaningful Matches for Modern Events*

**Short submission text (form‑ready). Full write‑up: [SUBMISSION.md](SUBMISSION.md).**

🌐 Live: https://margaritasi.github.io/event-match/ · 💻 Code: https://github.com/MargaritaSI/event-match

---

### Framing the Problem
*Who I am, what's the problem, who it affects.*

I'm Margarita — an iOS developer and designer who goes to a lot of tech events. There are **so many
events and so many different people**, and you only have a **short, limited time** to meet the ones
who actually matter to you. In practice that's hard: you can't tell *who* you should talk to in a
room of 50–400 people, conversations are rushed, and a week later you've forgotten who you met and
why you wanted to follow up (we lose ~70% of new information within a day — the Ebbinghaus forgetting
curve). It affects **attendees** (lost connections), but also **organisers, sponsors and speakers**,
who have no shared way to turn a crowd into real, measurable relationships.

### Idea Explanation
*What the idea is and how it fixes the problem.*

**EventMatch** is a mobile‑first (and desktop‑responsive) networking app that helps you meet the
right people **efficiently, in the time you have**:
- **Filter people by *your* interests** for the **chosen event**, so you instantly see who's worth
  meeting (ranked by shared interests **+** concrete skills, with complementary intents like
  *hiring ↔ open‑to‑work*).
- A **matching + safe‑contact flow**: you **choose exactly what each person sees** of your contacts —
  no long chat required, just connect and exchange.
- **Ice‑breakers and "people magnets"** — prompts and coffee‑meetups that gather people in the spaces
  **between sessions**.
- **Tasks that email‑remind you** to reach out to someone you met — and you can **write a note on
  their card** (who they are, what you talked about) so you never go blank later.

That closes the whole loop: **discover → connect safely → capture the person & next step → get
reminded → keep in touch.**

### Implementation
*How the pieces fit together; frontend/backend/database.*

A **mobile‑first, desktop‑responsive SPA** built with **React + TypeScript + KendoReact** (Kendo UI
components & theme), deployed live on **GitHub Pages** via GitHub Actions. All domain logic lives in
pure, **unit‑tested TypeScript modules** (matching, intents, capture, schedule, gamification).

**There is no backend — by design.** The frontend doesn't call a server; your profile, tasks and
points are stored in the **browser's `localStorage`** (your "database" on‑device, with one‑tap
delete). Real **person‑to‑person matching works without a server** by encoding your card into a
**share link / QR (base64 in the URL)** — the other person opens it and connects. Sample attendees,
incoming requests, sponsor lead counts and leaderboard peers are **seeded placeholders** that a
backend would otherwise provide.

### Challenges
*What I struggled with and how I overcame it.*

- **Scope, solo, one session.** I kept all logic in framework‑free modules so I could keep adding
  features (skills, intents, dashboard, sponsors) without the UI collapsing.
- **Real matching with no backend.** Two browsers can't see each other — I solved it with the
  base64 **card‑in‑URL** share flow, and a "reveal only the contacts you choose" rule.
- **A real React 19 StrictMode bug** where points doubled (I was awarding inside a state updater).
  Fix: move side effects out of reducers.
- **Mobile polish** — safe‑area header, overscroll edge colours, exact background tints, a 2‑level
  grouped nav — took several iterations.

### Accomplishments
*What I learned and accomplished.*

- Shipped a **real, deployed, live product** (not a local demo) with CI/CD on the first try.
- A **complete networking loop** plus value for **attendees, organisers, sponsors and communities** in
  one KendoReact app.
- **Two‑device matching with zero backend** via the share‑link flow.
- **55 passing unit tests** for the core logic — and a clean, branded, mobile‑first UI.
- Learned KendoReact, hardened my TypeScript architecture, and shipped under real time pressure.

### Next Steps
*Where I'd take it.*

- **A weekend:** add a thin **Supabase** backend so profiles, requests and the leaderboard sync **live
  across devices**, replacing the seeded data and the share‑link workaround for big crowds.
- **A month:** push notifications for requests/follow‑ups, organiser import of the real attendee list
  & agenda, post‑event "who you met" summary + vCard export.
- **A year:** native iOS/Android apps (the pure‑TS logic ports cleanly), Apple Wallet event badge,
  full sponsor analytics, and communities that outlive the event.
