# BloodMC Control Center V2

Responsive Arabic RTL dashboard and Android/Windows wrappers for BloodMC. Designed & developed by DEV_ABOUDI.

## Backend setup
Deploy this Node.js project on a separate Node.js hosting service with persistent private storage and HTTPS. Set these private environment variables before starting:

- `PANEL_URL=https://panel.primehost.cc`
- `PANEL_SERVER_ID=cb21b17b`
- `SETUP_SECRET`: a long, unique one-time setup phrase (at least 24 random characters).
- `PORT`: supplied by the host.

Open the HTTPS app URL. In **الإعداد الأول**, enter SETUP_SECRET, a newly generated PrimeHost Client API key, and a unique dashboard password (12+ characters). The backend writes the key and dashboard password to a private `.env` file with restrictive file permissions. The setup endpoint locks after first successful setup. Keep persistent disk enabled; if the host has ephemeral storage, use its private environment variables instead and do not rely on the in-app file setup.

Never paste API keys into GitHub, source files, APK/EXE, or chat. Revoke any previously exposed key. Use a least-privilege Client API key and HTTPS only.

## Build Android APK and Windows installer
1. Deploy the backend first and confirm its HTTPS URL works.
2. In GitHub, open **Settings → Secrets and variables → Actions → Variables**.
3. Add repository variable `BLOODMC_APP_URL` with the public HTTPS dashboard URL (not the API key).
4. Open **Actions → Build BloodMC apps → Run workflow**.
5. Download artifacts `BloodMC-Android-APK` and `BloodMC-Windows-EXE` after both jobs succeed.

Android produces a debug APK for testing. Windows produces an NSIS installer. These builds are wrappers around the deployed HTTPS dashboard, so the backend must remain online.

## Included now
- Authenticated backend proxy for server state/resources, power actions, and one-command console submission.
- In-app first-time setup form for the PrimeHost key.
- Responsive web dashboard and build workflows for Android and Windows.

## Not implemented yet
- Live WebSocket console output.
- Player list / player management.
- Signed Android release APK and code-signed Windows installer.
