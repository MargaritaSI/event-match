# EventMatch 🤝 — *Turn a hallway hello into a real connection*

> **Live demo:** https://margaritasi.github.io/event-match/
> **Code:** https://github.com/MargaritaSI/event-match
> **Built with:** KendoReact (Progress Telerik UI)
> **Track:** *Improve how events are created or experienced*

---

## 1. Introduction

**EventMatch** is a networking companion for tech conferences and meetups. It helps attendees
**find the right people, break the ice, exchange contacts, and actually follow up** — and gives
organisers, sponsors and speakers their own tools in the same app.

**Elevator pitch:** *At every conference you meet brilliant people, swap a few words, and a week
later remember a blurry face and half a conversation. EventMatch turns those fleeting hallway
moments into lasting, actionable connections — matching you by interests, skills and intent,
capturing the contact and the next step in two taps, and reminding you to follow through.*

### Meet the team
- **Margarita — "The Solo Full‑Stack Builder & Designer."** Designed the product, built the entire
  KendoReact front‑end, wrote the matching/gamification/scheduling logic and its tests, set up CI/CD
  to GitHub Pages, and made all the design decisions (palette, illustrations, IA). One person, one
  night, one shipped product.

---

## 2. Framing the Problem

**Have you ever swapped business cards with someone amazing at a conference… and a week later had no
idea who they were or why you should message them?**

Networking is the whole reason most people attend events — yet the experience is broken:

- Professionals overwhelmingly say networking matters for their careers, but most **leave events
  with a stack of half‑remembered contacts and no follow‑up plan.** (LinkedIn / HBR networking research — *verify link before submitting*).
- Human memory works against us: the **Ebbinghaus forgetting curve** shows we lose roughly **50% of
  new information within an hour and ~70% within a day** ([Wikipedia: Forgetting curve](https://en.wikipedia.org/wiki/Forgetting_curve)).
  Names and "we should collaborate" intentions evaporate fastest.
- It's also a **discovery problem.** At a 50–400 person event you can't tell who you *should* meet —
  the recruiter who's hiring, the founder who needs your skill, the speaker working on your exact problem.
- And the value is fragmented: **organisers** can't see what the crowd cares about, **sponsors**
  can't capture leads cleanly, and **communities** dissolve the moment the event ends.

This is personal: I build apps and go to meetups, and I've lost more good connections to "I'll
message them later" than I'd like to admit. EventMatch is the tool I wished existed in my pocket.

---

## 3. Idea Explanation

EventMatch is a single mobile‑first app organised into three areas — **Me**, **Meet**, **Event** —
that together close the networking loop:

**Discover → Connect → Capture → Follow up → Keep in touch.**

- **Smart matching** — every attendee has a card (role, company, interests, **specific skills**:
  languages/design/sport, and an **intent**: hiring / open‑to‑work / find co‑founder / investing…).
  People are ranked by *affinity* (shared interests **+** shared skills), and **complementary intents**
  are surfaced ("you're hiring ↔ they're open to work"). A compact, searchable list scales to
  hundreds of attendees; tap to expand a profile.
- **Connect** — ice‑breaker question deck, "Coffee Meetup" matchmaking (random / by‑interest /
  topic / quiet co‑work) timed to the next break.
- **Quick Capture → Tasks** — right after a conversation, jot the person + the next step; the app
  creates a dated **follow‑up task** automatically, exportable to Apple/Google Calendar (.ics) with
  optional email reminders. This is the "never forget a follow‑up" core.
- **Contact exchange without a backend** — your **QR code / share link** encodes your card; the other
  person opens it and connects instantly. You choose which contacts to reveal.
- **Connections** — a single place listing everyone you matched with, contacts unlocked.
- **Groups (communities)** — lasting communities by stack/role/interest with a meet time, place and a
  **Discord** that lives on after the event; each lists example discussions.
- **Schedule & Venue Map** — your agenda with free‑time gaps that suggest who to meet, and a colour‑coded
  floor map you can jump to from any session.
- **For organisers** — a **live Dashboard** (top interests, match potential, zone crowd heatmap),
  all computed from real data.
- **For sponsors** — booth on the map, **badge‑drop lead capture**, and a **ROI line** (leads · views).
- **Gamification** — points and badges for genuinely useful actions (matching, planning, exploring) +
  a leaderboard, to drive engagement.

Everything works **client‑side** so the demo is instant and the live site is real.

---

## 4. Tech Stack

```
┌────────────────────────────────────────────────────────────┐
│  Browser (mobile-first SPA)                                 │
│                                                             │
│   React 19 + TypeScript ── Vite (build)                     │
│        │                                                    │
│        ├── KendoReact UI  (Cards, Buttons, Dialogs,         │
│        │     Inputs, Layout, Indicators)  + Kendo theme     │
│        ├── qrcode.react   (QR contact cards)                │
│        ├── pure-TS domain logic (lib/)                      │
│        │     peopleLogic · intentLogic · captureLogic       │
│        │     scheduleLogic · gamificationLogic              │
│        └── localStorage   (profile, points, tasks — no server)│
│                                                             │
│   Share-link flow: card → base64 → URL #hash                │
└───────────────┬────────────────────────────────────────────┘
                │ static assets
                ▼
   GitHub Actions ──build──▶ GitHub Pages (live URL)
```

- **Front end:** React + TypeScript, **KendoReact** component library + Kendo Default theme (the
  challenge's Kendo UI requirement — Cards, Dialogs, Buttons, Inputs, Layout, Indicators are used
  throughout).
- **Domain logic:** isolated pure‑TypeScript modules in `src/lib/` (matching, scheduling, capture,
  gamification) — framework‑free, so they port 1:1 to a future native (Flutter/Swift) app.
- **Persistence:** `localStorage` keyed under `em_*` (profile, points, tasks). A one‑tap "Delete all
  my data" wipes it.
- **No backend (by design):** real attendee‑to‑attendee matching is done via a **base64‑encoded card
  in the URL hash** (QR / share link) — two judges can match across two devices with no server.
- **Tests:** **55 unit tests** (Vitest) covering matching, affinity, schedule gaps, gamification and
  capture logic.
- **CI/CD:** GitHub Actions builds and deploys to **GitHub Pages** on every push to `main`.

---

## 5. Technical Deep‑Dive

A few things I'm proud of under the hood:

- **Affinity matching that blends two signals.** `affinity(user) = sharedInterests + sharedSkills`.
  Skills are concrete (Swift, UI/UX, Running…), so a designer and a Swift dev with one shared skill
  still surface to each other. Complementary **intents** add a second axis (hiring↔job, co‑founder↔
  co‑founder, mentor↔learner) so the *recruiter ↔ job‑seeker* match is explicit. All of this is pure,
  unit‑tested functions in `lib/peopleLogic.ts` + `lib/intentLogic.ts`.
- **No‑backend two‑person matching.** The shareable card is `btoa(JSON.stringify(profile))` appended to
  the URL as `#card=…`. Opening that link decodes the card and offers "Connect", revealing only the
  contacts the owner chose to share. This is the realistic demo path for two judges without standing
  up a server.
- **Everything computed, nothing faked.** The organiser dashboard's "high‑affinity pairs", "group
  RSVPs" and "zone crowd index" are all derived live from the attendee/group/session data, not
  hard‑coded numbers.
- **StrictMode‑safe gamification.** Points are awarded outside React state‑updater functions to avoid
  double‑firing under React 19 StrictMode — a real bug I caught and fixed (and the points are tuned so
  they accrue meaningfully, not for every tap).
- **Mobile polish:** safe‑area aware header, fill‑coloured overscroll edges, a 2‑level grouped nav
  (Me / Meet / Event), and per‑tab background illustrations.

---

## 6. Time Usage (one build session)

| Phase | Roughly |
|---|---|
| Idea, scoping, KendoReact setup | 10% |
| Core: People, matching, profile card | 25% |
| Capture → Tasks, Schedule, Map, Groups, Connect | 30% |
| Sponsors, Organiser Dashboard, Connections, gamification | 20% |
| Tests, deploy (GitHub Pages), polish & design | 15% |

---

## 7. Challenges

- **Scope vs. one night, solo.** The honest hard part was deciding *what not to build*. I kept the
  domain logic in pure modules so I could add features (skills, intents, dashboard, sponsors) without
  the UI turning to spaghetti.
- **Real matching with no backend.** Two separate browsers can't see each other. I solved it with the
  **base64 card‑in‑URL share flow** — it took a couple of iterations to get the encode/decode and the
  "reveal only chosen contacts" right.
- **A real React 19 StrictMode bug.** Points were doubling because I awarded them *inside* a `setState`
  updater (which StrictMode invokes twice). Fix: award after the updater. Lesson learned — keep side
  effects out of reducers.
- **Mobile background/edge rendering.** Overscroll flashing white/black and the notch showing the
  wallpaper took several passes (safe‑area padding, `theme-color`, painting the root colour).
- **KendoReact theming on a custom palette.** Reconciling Kendo's default theme with a bespoke
  purple/pink brand and illustrated backgrounds.

---

## 8. Accomplishments

- Shipped a **genuinely deployed, live product** (not a local demo) with CI/CD on the first try.
- A **complete networking loop** — discover, match, capture, follow‑up reminder, keep‑in‑touch — plus
  value for **organisers, sponsors, speakers and communities**, in one app.
- **Real two‑device matching with zero backend** via the share‑link flow.
- **55 passing unit tests** for the core logic — rare for a hackathon front‑end.
- A polished, mobile‑first KendoReact UI with consistent branding.

---

## 9. Business / Monetization

**Cost to run (today):** ~**$0/month** — static front‑end on GitHub Pages, no server, no database.
A custom domain is ~$10–15/year. KendoReact is used under its trial license for the hackathon
(commercial license needed for production).

**Path to revenue (B2B‑first):**
- **Sell to organisers / event platforms** as a white‑label networking add‑on — tiered by event size
  (e.g. €0 for <100 attendees, €299–€1,500 per event for larger).
- **Sponsor packages** — premium booth placement + the lead‑capture/ROI dashboard.
- **Pro tier for power networkers** (recruiters, founders) — unlimited matches, CRM/calendar export,
  per‑event history.

Because the heavy compute is client‑side, marginal cost per user stays near zero until we add a
backend for cross‑device realtime; that's the main future cost line to watch.

---

## 10. Next Steps

- **Next hackathon (a weekend):** add a lightweight backend (Supabase) so matching, requests and the
  leaderboard sync **live across devices** — replacing the share‑link workaround for big crowds.
- **A month:** push notifications for meeting requests and follow‑up reminders; organiser import of
  the real attendee list & agenda; post‑event "who you met" summary + vCard export.
- **A year:** native iOS/Android apps (the pure‑TS domain logic ports cleanly to Flutter/Swift),
  Apple Wallet event badge, sponsor analytics suite, and persistent communities that outlive the event.

---

## 11. FAQ

- **Is there a backend?** No — by design. Profiles live in `localStorage`; cross‑person matching uses a
  share link / QR that encodes the card in the URL. Great for a private, instant demo; a backend is
  the first "next step" for scale.
- **Does it use Kendo UI?** Yes — KendoReact components (Cards, Dialogs, Buttons, Inputs, Layout,
  Indicators) and the Kendo theme are used across the app.
- **Will two judges actually match?** Yes — one opens *My Card → Share link*, sends it; the other opens
  it and taps **Connect**, and contacts unlock.
- **Is my data safe?** It never leaves your device, and **Delete all my data** wipes it instantly.
- **Why for events specifically?** Networking is the #1 reason people attend, and it's the most broken
  part of the experience — high value, clear scope.

---

## 12. Project Links
- **🌐 Live app:** https://margaritasi.github.io/event-match/
- **💻 Code:** https://github.com/MargaritaSI/event-match
- **🎬 Video demo:** *(add link)*

## 13. Submission Category
**"Improve how events are created or experienced."** EventMatch targets the *attendee experience*
first (discovery → connection → follow‑up) while delivering clear value to **organisers, sponsors and
communities** — and it's built with **KendoReact**, satisfying the Kendo UI requirement.

> **Pre‑submit checklist:** verify every link opens · confirm the stats/source links · category set to
> the single best‑fit track · video under the length limit · live URL loads.
