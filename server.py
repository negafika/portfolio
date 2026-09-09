#!/usr/bin/env python3
"""
Negaye Fikadu — Portfolio backend
Serves the static site AND handles the contact form API.

  GET  /*               -> static files (index.html, css, js, images, CV)
  POST /api/contact     -> accepts JSON {name, email, subject, message}
                           validates it, stores it in data/messages.json,
                           returns {"ok": true}
  GET  /api/messages/count -> returns {"count": N}  (how many messages received)

Run:  python3 server.py   (listens on 0.0.0.0:8000)
"""
import http.server
import json
import os
import socketserver
import time
from datetime import datetime, timezone

LAST_SUBMIT = {}  # ip -> unix timestamp of last accepted contact submit

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
MESSAGES_FILE = os.path.join(DATA_DIR, "messages.json")
PORT = int(os.environ.get("PORT", 8000))  # host platforms inject PORT; 8000 locally

os.makedirs(DATA_DIR, exist_ok=True)


def load_messages():
    try:
        with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_message(entry):
    msgs = load_messages()
    msgs.append(entry)
    with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
        json.dump(msgs, f, indent=2, ensure_ascii=False)
    return len(msgs)


class PortfolioHandler(http.server.SimpleHTTPRequestHandler):
    server_version = "NegayePortfolio/2.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # ---------- helpers ----------
    def send_json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):  # keep the console clean
        pass

    def end_headers(self):  # always serve fresh files (no stale browser cache)
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # ---------- API ----------
    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/api/messages/count":
            return self.send_json(200, {"count": len(load_messages())})
        return super().do_GET()

    def do_POST(self):
        path = self.path.split("?")[0]
        if path != "/api/contact":
            return self.send_json(404, {"ok": False, "error": "not found"})
        try:
            length = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(length) if length else b"{}"
            data = json.loads(raw.decode("utf-8") or "{}")

            # --- spam gate 1: honeypot — bots fill the invisible "website" field.
            # Silently pretend success so the bot moves on; store nothing.
            if str(data.get("website", "")).strip():
                print(f"[contact] honeypot tripped from {self.client_address[0]} — dropped")
                return self.send_json(200, {"ok": True})

            # --- spam gate 2: rate limit, one message per 20s per IP.
            ip = self.client_address[0]
            now = time.time()
            last = LAST_SUBMIT.get(ip, 0)
            if now - last < 20:
                return self.send_json(429, {"ok": False, "error": "slow down"})
            LAST_SUBMIT[ip] = now

            name = str(data.get("name", "")).strip()[:120]
            email = str(data.get("email", "")).strip()[:160]
            subject = str(data.get("subject", "")).strip()[:200]
            message = str(data.get("message", "")).strip()[:5000]

            if not name or "@" not in email or "." not in email or len(message) < 10:
                return self.send_json(400, {"ok": False, "error": "invalid input"})

            entry = {
                "name": name,
                "email": email,
                "subject": subject or "(no subject)",
                "message": message,
                "received": datetime.now(timezone.utc).isoformat(),
            }
            total = save_message(entry)
            print(f"[contact] new message from {name} <{email}> — total: {total}")
            return self.send_json(200, {"ok": True, "message": "Message received. Thank you!"})
        except Exception as exc:  # noqa: BLE001
            print("[contact] error:", exc)
            return self.send_json(500, {"ok": False, "error": "server error"})


class ThreadingServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with ThreadingServer(("0.0.0.0", PORT), PortfolioHandler) as server:
        print(f"Portfolio + contact API running on 0.0.0.0:{PORT}")
        print(f"  site:      http://localhost:{PORT}/")
        print(f"  messages:  {MESSAGES_FILE}")
        server.serve_forever()
