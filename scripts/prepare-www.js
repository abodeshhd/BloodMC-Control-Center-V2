const fs = require("node:fs");
const path = require("node:path");
const target = "www";
fs.mkdirSync(target, { recursive: true });
for (const file of ["index.html", "styles.css", "app.js"]) {
  fs.copyFileSync(file, path.join(target, file));
}
