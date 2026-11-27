const appUrl = process.env.BLOODMC_APP_URL || "https://YOUR-DEPLOYED-DASHBOARD.example";

module.exports = {
  appId: "cc.bloodmc.controlcenter",
  appName: "BloodMC Control Center",
  webDir: "www",
  server: {
    url: appUrl,
    cleartext: false,
    allowNavigation: [new URL(appUrl).hostname]
  },
  android: {
    allowMixedContent: false
  }
};
