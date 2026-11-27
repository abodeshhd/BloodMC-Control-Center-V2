const fs = require("node:fs");
const url = String(process.env.BLOODMC_APP_URL || "").trim();
if (!/^https:\/\//i.test(url)) {
  console.error("BLOODMC_APP_URL must be an HTTPS backend URL.");
  process.exit(1);
}
fs.writeFileSync("app-config.js", "window.BLOODMC_API_BASE_URL = " + JSON.stringify(url.replace(/\/$/, "")) + ";\n", "utf8");
