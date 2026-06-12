# EventMatch 🤝 — *Meaningful Matches for Modern Events*

**Short submission text (form‑ready). Full write‑up: [SUBMISSION.md](SUBMISSION.md).**

🌐 Live: https://margaritasi.github.io/event-match/ · 💻 Code: https://github.com/MargaritaSI/event-match

---

### Framing the Problem
I'm Margarita — a QA engineer who actively builds products with AI, and goes to a lot of tech events.
Too many events, too many people, too little time to actually meet the ones who matter. In a room of
50–400 you can't tell *who* to talk to, conversations are rushed, and a week later you've forgotten
who you met and why (we lose ~70% of new info within a day — the forgetting curve). It hurts
**attendees** — and **organisers, sponsors and speakers** who have no shared way to turn a crowd into
real relationships.

### Idea Explanation
A mobile‑first (desktop‑responsive) app to meet the right people **fast, in the time you have**:
- **Filter people by your interests** for the chosen event — ranked by shared interests + skills, with
  complementary intents (*hiring ↔ open‑to‑work*).
- **Safe contact exchange** — you choose exactly what each person sees; connect, no long chat.
- **Ice‑breakers & "people magnets"** that gather people between sessions.
- **Tasks that email‑remind you to follow up**, with a **note on each person's card** so you never go blank.

Loop: **discover → connect safely → capture → get reminded → keep in touch.**

### Implementation
Mobile‑first, desktop‑responsive SPA in **React + TypeScript + KendoReact**, live on **GitHub Pages**
(Actions CI/CD). Logic sits in pure, unit‑tested TS modules. **No backend by design:** profile/tasks/
points live in the browser's **`localStorage`**. Person‑to‑person matching works server‑free — your
card is **base64‑encoded into a share link/QR**; the other person opens it and connects. Sample
attendees, requests, sponsor leads and leaderboard peers are seeded placeholders a backend would supply.

### Challenges
Building solo in one session — kept logic framework‑free so features stacked cleanly. Real matching
with no backend — solved with the card‑in‑URL share flow + "reveal only chosen contacts." Caught a
React 19 StrictMode bug doubling points (moved side effects out of the state updater). Heavy mobile
polish (safe‑area header, overscroll edges, exact tints).

### Accomplishments
A **real, deployed product** with CI/CD on the first try; a full loop with value for attendees,
organisers, sponsors and communities; **two‑device matching with zero backend**; **55 passing unit
tests** and a clean branded UI — built with AI as my pair, under real time pressure.

### Next Steps
**Weekend:** thin **Supabase** backend for live cross‑device sync. **Month:** push notifications,
organiser attendee/agenda import, post‑event "who you met" + vCard export. **Year:** native iOS/Android
(logic ports cleanly), Apple Wallet badge, sponsor analytics, communities that outlive the event.
