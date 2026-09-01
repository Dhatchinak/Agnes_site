# Secret Heart Proposal Update

The existing Secret Heart key is unchanged: `Myprincess`.

## New proposal flow

1. Secret key unlock
2. Press-and-hold glowing heart interaction
3. Four-photo cinematic memory sequence
4. Animated private love letter
5. Optional voice-note moment
6. Full-screen proposal: “Will you be mine?”
7. “Yes, always” rose-gold celebration with confetti
8. “Give me a little time” respectful response screen
9. Accepted answer is stored locally and reopens as a keepsake
10. Replay controls are included

## Optional voice note

To add your own voice, place an MP3 here:

`public/audio/secret-heart-voice.mp3`

The proposal still works if this file is not added. The voice screen gracefully becomes a reserved voice-note moment and the user can continue.

## Photos currently used in Secret Heart

- `public/photos/special.jpg`
- `public/photos/photo-04.jpg`
- `public/photos/childhood-smile.jpg`
- `public/photos/hero.jpg`

Change the `MEMORY_SLIDES` array near the top of `src/components/SecretHeartProposal.jsx` if you want different photos or text.

## Main updated files

- `src/App.jsx`
- `src/styles.css`
- `src/components/SecretHeartProposal.jsx` (new)

## Run

```bash
npm install
npm run dev
```

This ZIP intentionally does not include `node_modules`; install dependencies on the machine where the project will run.
