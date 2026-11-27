# BloodMC Control Center V2

Installable Android and Windows clients for BloodMC. The app interface is bundled locally and sends Client API requests directly to PrimeHost. Designed & developed by DEV_ABOUDI.

## Connection
- Panel: `https://panel.primehost.cc`
- Server identifier: `cb21b17b`
- API: PrimeHost / Pterodactyl Client API (`/api/client/servers/{server}/...`).
- Enter a PrimeHost Client API key in the app at login. The key is kept in memory only and cleared when logging out or closing the app.
- Never commit or share API keys. Use a dedicated least-privilege Client API key and revoke it if exposed.
- Direct API access requires the panel to allow requests from the app origin. If the panel blocks CORS, the hosting provider must enable the app origin or provide a supported native API route; do not put a private API key in a public proxy.

## Build Android APK and Windows installer
1. Open **Actions → Build BloodMC apps → Run workflow** in GitHub, or let the workflow start after a push to `main`.
2. Wait for both Android and Windows jobs to succeed.
3. Download `BloodMC-Android-APK` and `BloodMC-Windows-EXE` from the completed workflow run.

## Current features
- Arabic RTL interface with BloodMC branding and DEV_ABOUDI credits.
- Direct PrimeHost Client API connection using a key entered by the user.
- Server status and resource metrics.
- Start, stop, restart, and one-command console submission.

## Not implemented yet
- Live WebSocket console stream.
- Player list and player management.
- Signed Android release APK and Windows code signing.
