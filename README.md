# vCISO Advisory Landing Page

Production-ready static landing page for **Disruptivv.AI vCISO Advisory**, packaged for Azure App Service deployment.

## Local run

```bash
npm start
```

Then open `http://localhost:8080`.

## Health check

```bash
curl http://localhost:8080/healthz
```

## Azure App Service deploy notes

- Runtime stack: **Node 20 LTS**.
- Startup command (Linux): `npm start`.
- App listens on `process.env.PORT` for Azure compatibility.
- Includes `web.config` for IISNode compatibility on Windows App Service.

## Identified/fixed issues from provided HTML

- Removed stray Markdown code fences (```), which break HTML/CSS parsing.
- Added semantic `main` container and accessibility hints (`aria-hidden` on decorative elements).
- Added meta description and preconnect optimizations for Google Fonts.
- Added secure static server with path traversal protection and security response headers.
