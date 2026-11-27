# BloodMC Control Center V2

Responsive starter dashboard for managing the BloodMC Minecraft network.

## Current status

This first commit provides a responsive Arabic RTL dashboard for mobile and desktop. The displayed server status, player names, TPS, CPU, RAM, and logs are **demo data only**. No Minecraft server is contacted and no console commands are executed.

## Run locally

Requires Node.js 18 or newer.

```bash
npm start
```

Open `http://localhost:3000`.

## Planned integration

The next stage is a secure backend integration with the hosting provider's supported API. Keep API tokens in server-side environment variables; never place secrets in browser JavaScript or commit them to Git. Use least-privilege credentials and authenticated access.

## Project structure

- `index.html` — dashboard layout
- `styles.css` — responsive styling
- `app.js` — browser entry point
- `server.js` — minimal static HTTP server
