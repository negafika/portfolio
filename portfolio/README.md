# Negaye Fikadu — Portfolio

Personal portfolio website + contact API.
Static site (HTML/CSS/JS + React islands) served by a dependency-free Python server.

## Run locally

```bash
python3 server.py
# → http://localhost:8000
```

## Deploy (Render)

1. Push this folder to a GitHub repository.
2. On https://render.com → **New → Web Service** → connect the repo.
3. Settings Render detects automatically:
   - Runtime: **Python**
   - Build Command: *(leave empty)*
   - Start Command: `python server.py`
   - Plan: **Free**
4. Deploy → your site goes live at `https://<your-app>.onrender.com`.

> **After deploy:** replace `https://example.dev/` in `robots.txt` / `sitemap.xml`
> and the relative `og:image` paths in `index.html` with your real URL.

## Contact API

- `POST /api/contact` — JSON `{name, email, subject, message}` → stores to `data/messages.json`
- `GET /api/messages/count` — unread count
- Spam protection: honeypot field + 20s/IP rate limit

> Note: Render's free filesystem is ephemeral — the inbox file resets on redeploys.
