# Trevian Oar

Team app for New Trier Crew. Two core features: a **Hype Board** team feed and **Crew Call** instant push notifications for regattas.

## Features

### Hype Board (Team Feed)
- Coaches and coxswains post race results, personal records, photos, shoutouts, and general updates
- All team members can view the feed and react with emoji (toggle on/off)
- Post types: Result, PR, Photo, Shoutout, Update — each with a colored badge
- Chronological feed with author avatars, timestamps, and grouped reaction counts

### Crew Call (Push Notifications)
- Coaches and coxswains select a boat and send an instant push notification to everyone assigned to that boat
- Custom message support (defaults to "[Boat Name] — get to the dock NOW!")
- Notifications are loud, vibrate, and require interaction (won't auto-dismiss)
- Tapping a notification opens the app to the Crew Call page
- Shows delivery confirmation: "Sent to X of Y members"
- Recent call history visible to all team members

### Team Directory
- Searchable list of all approved team members
- Shows each member's role (Coach, Coxswain, Rower) and boat assignments
- Avatar initials with role-colored badges

### Admin Panel (Coaches Only)
- **Approvals**: New signups land in a pending queue. Coaches approve each user and assign their role (Rower, Coxswain, or Coach). Can also deny access.
- **Boat Management**: Create boats (e.g. Varsity 8+, JV 4+, Novice 8+). Assign/remove members with a tap-to-toggle interface.

### Authentication
- Magic link login — enter your email, receive a 6-digit code, enter it to sign in
- No passwords to remember or manage
- JWT cookie with 10-year expiry — once you log in on a device, you stay logged in
- New users require coach approval before accessing the app

### PWA (Progressive Web App)
- Installable on any phone (iOS, Android) via "Add to Home Screen"
- Service worker handles push notifications even when the app isn't open
- Mobile-optimized UI with bottom tab navigation and safe area handling

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (server-side) |
| Database | PostgreSQL 16 (Docker) |
| Auth | Magic link codes via SendGrid + JWT (jose) |
| Push | Web Push API with VAPID keys (web-push) |
| Deployment | Docker Compose (app + database) |

## Project Structure

```
src/
  app/
    feed/          # Hype Board — team feed with posts and reactions
    crew/          # Crew Call — send push notifications to boat crews
    directory/     # Team directory — searchable member list
    admin/         # Coach panel — approvals and boat management
    api/
      auth/        # login (send code), verify (check code), me, logout
      posts/       # GET feed, POST new post
      reactions/   # Toggle emoji reactions
      boats/       # GET boats with members, POST/PUT manage boats
      crew-call/   # POST send crew call, GET recent calls
      users/       # GET directory, pending list, approve/deny
      push-subscribe/  # Save browser push subscription
  components/
    AppShell.tsx   # Auth gate + layout (login, pending, approved states)
    LoginForm.tsx  # Magic link login flow
    Nav.tsx        # Bottom tab navigation
    PushSetup.tsx  # Push notification permission prompt
  lib/
    db.ts          # PostgreSQL connection pool
    auth.ts        # JWT creation + user lookup from cookie
    push.ts        # Web Push notification sender with VAPID
    useAuth.ts     # Client-side auth hook
scripts/
  schema.sql       # Database schema (6 tables)
  seed.sql         # Sample boats
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Members with name, email, role, approval status, push subscription |
| `boats` | Crew boats (Varsity 8+, JV 4+, etc.) |
| `boat_members` | Many-to-many: which rowers are on which boats |
| `posts` | Feed posts with type, title, body, optional image |
| `reactions` | Emoji reactions on posts (unique per user+post+emoji) |
| `crew_calls` | Log of sent crew call notifications |

## Roles

| Role | Feed | React | Post | Crew Call | Approve Users | Manage Boats |
|------|------|-------|------|-----------|---------------|-------------|
| Coach | View | Yes | Yes | Yes | Yes | Yes |
| Coxswain | View | Yes | Yes | Yes | No | No |
| Rower | View | Yes | No | No | No | No |

## Setup

### Prerequisites
- Docker and Docker Compose
- SendGrid API key (for magic link emails)
- VAPID keys (for web push — generate with `npx web-push generate-vapid-keys`)

### Environment Variables

Create a `.env` file:

```env
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM=noreply@yourdomain.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:you@example.com
JWT_SECRET=your_random_secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Run

```bash
docker compose up -d --build
```

The app runs on port 4075 and the database on port 5434.

### Seed a Coach Account

After first launch, manually approve a coach in the database:

```bash
docker exec trevian-oar-db-1 psql -U trevian -d trevian_oar \
  -c "INSERT INTO users (name, email, role, status) VALUES ('Coach Name', 'coach@email.com', 'coach', 'approved');"
```

Then log in with that email to access the admin panel and start approving other users.

### Local Development

```bash
npm install
npm run dev
```

Requires a `.env.local` with `DATABASE_URL` pointing to a running PostgreSQL instance.
