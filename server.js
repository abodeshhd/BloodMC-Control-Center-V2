const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function loadEnv(file) {
  try {
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && process.env[match[1]] === undefined) {
        process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
      }
    }
  } catch {}
}
loadEnv(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 3000);
const PANEL_URL = (process.env.PANEL_URL || "https://panel.primehost.cc").replace(/\/$/, "");
const SERVER_ID = process.env.PANEL_SERVER_ID || "cb21b17b";
const API_KEY = process.env.PANEL_API_KEY || "";
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "";
const ROOT = __dirname;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(data));
}

function authorized(req) {
  const supplied = Buffer.from(req.headers["x-dashboard-password"] || "");
  const expected = Buffer.from(DASHBOARD_PASSWORD);
  return expected.length > 0 && supplied.length === expected.length &&
    crypto.timingSafeEqual(supplied, expected);
}

async function panelRequest(endpoint, options = {}) {
  if (!PANEL_URL || !SERVER_ID || !API_KEY) {
    const error = new Error("PrimeHost API is not configured.");
    error.status = 503;
    throw error;
  }
  const response = await fetch(`${PANEL_URL}/api/client/servers/${encodeURIComponent(SERVER_ID)}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "Application/vnd.pterodactyl.v1+json",
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    const error = new Error("Hosting panel request failed.");
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 4096) throw new Error("Request body too large.");
  }
  return body ? JSON.parse(body) : {};
}

async function handleApi(req, res, url) {
  if (url.pathname === "/api/health" && req.method === "GET") {
    return send(res, 200, { ok: true, app: "BloodMC Control Center" });
  }
  if (!DASHBOARD_PASSWORD) {
    return send(res, 503, { error: "Set DASHBOARD_PASSWORD in the private environment settings." });
  }
  if (!authorized(req)) return send(res, 401, { error: "كلمة مرور لوحة التحكم غير صحيحة." });

  try {
    if (url.pathname === "/api/server" && req.method === "GET") {
      return send(res, 200, await panelRequest(""));
    }
    if (url.pathname === "/api/resources" && req.method === "GET") {
      return send(res, 200, await panelRequest("/resources"));
    }
    if (url.pathname === "/api/power" && req.method === "POST") {
      const body = await readJson(req);
      if (!["start", "stop", "restart"].includes(body.signal)) {
        return send(res, 400, { error: "إجراء غير صالح." });
      }
      await panelRequest("/power", { method: "POST", body: JSON.stringify({ signal: body.signal }) });
      return send(res, 200, { ok: true, signal: body.signal });
    }
    if (url.pathname === "/api/command" && req.method === "POST") {
      const body = await readJson(req);
      const command = typeof body.command === "string" ? body.command.trim() : "";
      if (!command || command.length > 160 || /[\r\n\0]/.test(command)) {
        return send(res, 400, { error: "اكتب أمراً واحداً لا يتجاوز 160 حرفاً." });
      }
      await panelRequest("/command", { method: "POST", body: JSON.stringify({ command }) });
      return send(res, 200, { ok: true });
    }
    return send(res, 404, { error: "Not found" });
  } catch (error) {
    const status = error.status === 401 || error.status === 403 ? 502 : (error.status || 502);
    return send(res, status, {
      error: "تعذر الاتصال بلوحة الاستضافة.",
      detail: error.status ? `Panel HTTP ${error.status}` : error.message
    });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) return handleApi(req, res, url);

  const pathname = decodeURIComponent(url.pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(ROOT, relative);
  if (!file.startsWith(ROOT + path.sep)) {
    res.writeHead(403); return res.end("Forbidden");
  }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`BloodMC Control Center listening on port ${PORT}`);
  if (!API_KEY || !DASHBOARD_PASSWORD) {
    console.log("Set PANEL_API_KEY and DASHBOARD_PASSWORD in private environment variables.");
  }
});