# BloodMC Control Center V2

Responsive Arabic RTL dashboard for the BloodMC Minecraft server on PrimeHost.

## Implemented
- Authenticated backend proxy to the hosting panel's Client API.
- Live server state, CPU, RAM, and disk readings.
- Start, stop, and restart controls.
- Send one console command at a time.
- API key is stored only in the Node.js server environment, never in browser JavaScript.

## Requirements
- Node.js 20 or newer.
- A Pterodactyl-compatible Client API enabled by the host.
- A Client API key with the least permissions required: server details, resource stats, power actions, and console command.
- A separate strong dashboard password.

## Configure on your Node.js hosting service
Set these as private environment variables in the hosting provider's application settings. Do not put secrets in GitHub.

| Variable | Value |
|---|---|
| `PORT` | Provided by your app host (usually automatic) |
| `PANEL_URL` | `https://panel.primehost.cc` |
| `PANEL_SERVER_ID` | `cb21b17b` |
| `PANEL_API_KEY` | A newly generated Client API key |
| `DASHBOARD_PASSWORD` | A long, unique password for this dashboard |

Then deploy the repository and run:

```bash
npm start
```

Open the app's HTTPS URL, enter the dashboard password, and test refresh first. Only test power controls when you intend to control the server.

## Important
- A previously shared API key must be revoked and replaced. Never paste API keys into chat, commit them, or put them in browser code.
- Use HTTPS and keep the dashboard private.
- If the API returns 401/403, verify the key type and its permissions with PrimeHost support.
- If the API returns 404, PrimeHost may use a customized API route; ask support for its Client API base path.
- The current build sends console commands but does not yet stream live console output. Live WebSocket console is a later stage.
- Player count/list is not included yet; it requires a supported query endpoint or a server-side Minecraft status integration.
