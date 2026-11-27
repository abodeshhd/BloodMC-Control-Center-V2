# BloodMC Control Center V2

Installable Android and Windows clients for BloodMC. The app interface is bundled locally and sends Client API requests directly to PrimeHost. Designed & developed by DEV_ABOUDI.

## Connection
- Panel: `https://panel.primehost.cc`
- Server identifier: `cb21b17b`
- API: PrimeHost / Pterodactyl Client API (`/api/client/servers/{server}/...`).
- Enter a PrimeHost Client API key in the app at login. The key is kept in memory only and cleared when logging out or closing the app.
- Never commit or share API keys. Use a dedicated least-privilege Client API key and revoke it if exposed.
- Android uses Capacitor's native HTTPS transport and Windows uses Electron's native HTTPS bridge, so the app does not depend on browser CORS. The API key is sent directly to PrimeHost and is not routed through Render.

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
