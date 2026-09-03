# Secret Heart Realtime Admin Dashboard V24

This update adds a private dashboard for watching the Secret Heart journey in realtime.

## What the dashboard shows

- Whether she is currently inside Secret Heart
- The exact section she is viewing
- How long she has been inside Secret Heart
- How long she has been on the current section
- Her Yes / No answer immediately after she selects it
- Last activity / heartbeat time
- Journey progress
- A realtime timeline of visited Secret Heart sections

## Open the dashboard

During local development:

- Website: `http://localhost:5173`
- Admin dashboard: `http://localhost:5173/secret-admin`
- Alternative URL if your production host does not rewrite SPA routes: `http://localhost:5173/?secret-admin=1`

The admin page is not linked anywhere in the birthday website.

## Realtime architecture

The visitor page sends tiny journey-state updates to the included Node realtime server. The admin dashboard receives changes through Server-Sent Events (SSE), so updates appear immediately without refreshing.

Tracked state:

- random session id
- entered time
- current scene
- current scene entered time
- last heartbeat
- online / offline state
- yes / no choice
- choice time
- visited scene history

No photos, camera data, microphone data, location, typed Secret Heart password, or private message text are sent by the tracker.

## Local setup

1. Install the existing project dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env`.

3. Copy `server/.env.example` to `server/.env` and change `ADMIN_PASSWORD`.

4. Start the frontend in terminal 1:

```bash
npm run dev
```

5. Start the realtime server in terminal 2:

```bash
npm run dev:server
```

Then open:

```text
http://localhost:5173/secret-admin
```

## Production setup

The realtime server must be hosted as a small Node.js service so that your own phone/laptop admin dashboard can receive activity from another device in realtime.

Frontend `.env` example:

```env
VITE_SECRET_TRACKING_URL=https://live.yourdomain.com
```

Server `server/.env` example:

```env
PORT=5050
ADMIN_PASSWORD=use-a-strong-private-password
CLIENT_ORIGIN=https://yourdomain.com
```

Multiple allowed frontend origins can be comma-separated in `CLIENT_ORIGIN`.

If the website uses HTTPS, the realtime endpoint must also be served through HTTPS in production.

## Same-browser preview fallback

The tracker also writes the same state to `localStorage` and `BroadcastChannel`. This means you can preview the dashboard in another tab on the same browser even without the Node server.

Set this only for preview testing:

```env
VITE_SECRET_ADMIN_PREVIEW_PASSWORD=preview-only-password
```

Frontend `VITE_...` values are visible in the built JavaScript, so this preview password is not a production security control. Cross-device realtime mode uses the server-side `ADMIN_PASSWORD` instead.

## Important files

- `src/components/SecretHeartAdmin.jsx`
- `src/secret-heart-admin.css`
- `src/services/secretHeartTracker.js`
- `src/components/SecretHeartExperience.jsx`
- `src/main.jsx`
- `server/index.js`
- `.env.example`
- `server/.env.example`
