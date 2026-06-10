# 10AMPRO Shorts Analytics — Status & Monthly Update Process

**Repo:** `10amalpha/10ampro-shorts-analytics`
**Live:** https://10ampro-shorts-analytics.vercel.app/
**Last status update:** Jun 9, 2026
**Last code commit:** `61a8d00` — "feat: load TikTok via Studio API item_list, 63 clips, shares populated" (Jun 9, 2026)
**Last data update:** Jun 9, 2026 — (1) +30 clips from Gordo_clips xlsx (ids 162-191), total 152. (2) X Analytics loaded (Mar12-Jun9 export): 64 clips, 28/30 new. (3) TikTok loaded via Studio internal API item_list (hooked XHR/fetch, parsed item_list JSON): 63 clips, 29/30 new clips. TikTok mapping: views=play_count, likes=like_count, comments=comment_count, shares=share_count. Shares now populated (previously all 0 from old DOM load). REMAINING GAPS: id162-163 (Mar5-6) X=0 (predate X CSV); id164 (Mar31) TikTok=0 (its page cursor 30-50 / Mar25-Apr7 was fetched before the capture hook installed and never re-fetched). All other 151 clips full across 4 platforms.

---

## ⚠️ Pendientes inmediatos (Jun 9, 2026)

1. **`IG_ACCESS_TOKEN` CONFIRMADO VIVO Jun 9** — health check devolvió reels hasta Jun 7. Fue renovado en algún momento tras la estimación de mayo. Re-verificar ~Ago 2026.
2. **TikTok + X de los 30 clips nuevos están en 0** — la hoja de Gordo solo trae URLs, no números. Cuando haya screenshots de TT Studio / export de X Analytics, cargar los números (merge por id, nunca reemplazar).

---

## Architecture

Single-page React app (`index.html`) con 3 Vercel serverless APIs:

| File | What it does | Auto/Manual |
|---|---|---|
| `index.html` | Dashboard — UI, data, analytics | `SAMPLE_DATA` es manual (TikTok + X) |
| `/api/fetch-yt.js` | YouTube views/likes/comments | ✅ AUTO en page load |
| `/api/fetch-ig.js` | Instagram views/likes/comments/shares + captions como title fallback | ✅ AUTO en page load (Batch API) |
| `/api/fetch-gsheet.js` | Proxy del Google Sheet (NO usado por el dashboard) | ⏸ Deployed but unused |

**Data flow on page load:**
1. `SAMPLE_DATA` array renderiza inmediato (TikTok + X hardcoded, titles hardcoded)
2. `/api/fetch-yt` dispara → llena YT stats → dispatch `yt-data-updated`
3. `/api/fetch-ig` dispara → llena IG stats + sobrescribe títulos con captions IG (si caption > 5 chars) → dispatch `yt-data-updated`
4. React re-renderiza todas las pestañas

**Health check (verified May 2, 2026):**
- `GET /api/fetch-yt?ids=LZTTyOad7Iw,V2pwKu1TbjU,ws6m6HoGZuc` → 200, retorna datos reales
- `GET /api/fetch-ig` → 200, retorna 100 reels (rango Feb 8 → Jun 7, verified Jun 9)

**Tabs (todas dinámicas, no requieren update manual):**
- **Overview** — KPIs, distribución por plataforma, top 5, weekly performance, 🧠 Insights para El Gordo
- **Rankings** — tabla sortable de todos los clips
- **Platforms** — breakdown por plataforma
- **Strategy** — recomendaciones de contenido
- **Conversión** — análisis de conversión
- **Patrones** — análisis de títulos/temas

---

## 🧠 Insights para El Gordo (Overview tab)

5 insights dinámicos que recalculan por período. Coach style, no sugarcoated:

1. **🔥 El hook que funcionó** — Top clip, cuántas X arriba del promedio, push a replicar la energía del opening
2. **💀 La realidad incómoda** — Worst clip + bottom 3 average, llama la atención cuando el tema no fue suficientemente polémico
3. **🎯 Tasa de hooks que pegan** — % de clips arriba de 5K views, coaching específico por bracket
4. **📅 Tu mejor día** — Mejor día de la semana por avg views, scheduling advice
5. **⚡ Cadencia y ritmo** — Clips/semana, última semana vs anterior, challenge de no publicar sin calidad

---

## Monthly Update Checklist

### Lo que necesita Hernán (3 items):

1. **Google Sheet CSV** — spreadsheet de El Gordo con fechas + URLs para las 4 plataformas
   - Source: `https://docs.google.com/spreadsheets/d/1huw_MXpES-fNRJ2jKka5uISFjifCqNKIHFvQudbSTW8/`
   - Contiene: date, YT short URL, X post URL, IG reel URL, TikTok URL
   - NOTA: la columna de título no se necesita — los títulos reales van de TikTok Studio

2. **X Analytics CSV** — export desde analytics.x.com
   - Columnas: Post id, Impressions, Likes, Replies, Reposts
   - Match a clips por Post id (extraído del URL `/status/{id}`)

3. **TikTok Studio screenshots** — Content tab, sorted por más reciente
   - El CSV de TikTok Studio solo exporta top ~14 videos, NO todos
   - Screenshots muestran TODOS con views/likes/comments + títulos reales
   - No hay columna de shares — set shares to 0

4. **Nada de YouTube ni Instagram** — son APIs en vivo, auto-fetch en page load

### Step-by-step process:

```
STEP 1: Clone repo
─────────────────
git clone --depth=1 https://x-access-token:${PAT}@github.com/10amalpha/10ampro-shorts-analytics.git /tmp/10ampro-shorts-analytics

STEP 2: Parse Google Sheet CSV
──────────────────────────────
- Extract clips NUEVOS (fechas que no estén en SAMPLE_DATA)
- Por cada clip: date, yt URL, ig URL, tiktok URL, x URL
- Limpia URLs (strip ?utm_source, ?s=20, ?feature=share, etc.)

STEP 3: Match X Analytics
─────────────────────────
- Extract status ID de cada X URL: split("/status/")[1]
- Find matching row en X Analytics CSV por Post id
- Extract: Impressions→views, Likes→likes, Replies→comments, Reposts→shares

STEP 4: Extract TikTok data + titles desde screenshots
──────────────────────────────────────────────────────
- Read views/likes/comments de los screenshots de TikTok Studio
- Match por fecha de post (TikTok muestra "Mar 15, 3:00 PM" etc.)
- No shares disponible — set to 0
- USA EL TÍTULO DE TIKTOK STUDIO — es el título real del clip

STEP 5: Build SAMPLE_DATA entries
──────────────────────────────────
For each new clip:
{ id: N, title: "from TikTok Studio", date: "YYYY-MM-DD",
  tiktok: "clean URL", yt: "clean URL", ig: "clean URL", x: "clean URL",
  views: { tiktok: N, yt: 0, ig: 0, x: N },
  likes: { tiktok: N, yt: 0, ig: 0, x: N },
  comments: { tiktok: N, yt: 0, ig: 0, x: N },
  shares: { tiktok: 0, yt: 0, ig: 0, x: N } },

- YT y IG → 0 (auto-filled por las APIs)
- TikTok y X → números reales de los exports
- Titles → de TikTok Studio (NUNCA generic episode name)

STEP 6: Insert into index.html
───────────────────────────────
- Add entries al TOP del array SAMPLE_DATA (mes más reciente primero)
- Period filters auto-computan de las dates — no manual config
- Las 6 tabs + insights auto-update

STEP 7: Push
────────────
git add index.html
git commit -m "feat: add [MONTH] [YEAR] clips ([N] clips)"
git push
# Vercel auto-deploys on push to main
```

---

## Critical Rules

1. **NUNCA borrar TikTok ni X data** — no hay APIs para esos, data es manual
2. **NUNCA usar episode name como clip title** — usa TikTok Studio titles (IG captions son fallback, truncadas a 80 chars)
3. **YT e IG values en SAMPLE_DATA deben ser 0** — las APIs llenan en page load
4. **TikTok shares siempre 0** — TikTok Studio no expone esa métrica
5. **X shares = columna Reposts** del X Analytics CSV
6. **IG captions sobreescriben títulos** en page load (si caption > 5 chars) — pero siempre hardcode un buen título de TikTok Studio como primario

---

## API Credentials & Tokens

| Item | Value | Expiry |
|---|---|---|
| YT API Key | `AIzaSyANRsjsV-WdoLxM9yEz-yIgBFBdoUYPXCw` | No expiry |
| IG Access Token | Vercel env var `IG_ACCESS_TOKEN` | **Vivo Jun 9, 2026 — re-verificar ~Ago 2026** |
| Meta App (10ampro-analytics) | ID: `1467796011515050` / Secret: `cb0a910adfb960054167df0681bb5b3a` | — |
| FB Page ID | `1060185473841846` | — |
| IG Business Account ID | `17841455171483266` | — |

### IG Token Refresh (URGENTE — antes del 11 de mayo, 2026):
1. Graph API Explorer (`developers.facebook.com/tools/explorer`) → seleccionar app **10ampro-analytics**
2. Permisos: `pages_show_list`, `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`
3. Generate Access Token → autorizar → copiar short-lived token
4. Exchange por long-lived (paste en browser):
   ```
   https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=1467796011515050&client_secret=cb0a910adfb960054167df0681bb5b3a&fb_exchange_token=SHORT_TOKEN
   ```
5. Copiar `access_token` del JSON
6. Vercel: `vercel.com/10amalpha/10ampro-shorts-analytics/settings/environment-variables` → update `IG_ACCESS_TOKEN`
7. Redeploy

---

## fetch-ig.js — Batch API (fixed April 1, 2026)

La versión original hacía 100+ HTTP calls (1 por reel) → 504 timeout en Vercel free tier (10s limit).

**Versión actual usa Facebook Batch API:**
- 1 call para get page token
- 1 call para get media list (100 reels)
- 2 batch calls para insights (50 por batch)
- 1 fallback batch para reels con zero views
- **Total: ~5 HTTP calls en lugar de 100+**

---

## Data Coverage (verified May 2, 2026)

| Mes | Clips en `SAMPLE_DATA` | TikTok | X | YouTube | Instagram |
|---|---|---|---|---|---|
| Dec 2025 | 15 | ✅ hardcoded | ✅ hardcoded | ✅ live API | ✅ live API |
| Jan 2026 | 35 | ✅ hardcoded | ✅ hardcoded | ✅ live API | ✅ live API |
| Feb 2026 | 26 | ✅ hardcoded | ✅ hardcoded | ✅ live API | ✅ live API |
| Mar 2026 | 24 | ✅ hardcoded | ✅ hardcoded | ✅ live API | ✅ live API |
| **Apr 2026** | **22** | ✅ TT Studio screenshots | ✅ X Analytics CSV | ✅ live API | ✅ live API |

**Total actual: 122 clips tracked.**

**Lo que se cargó para abril (22 clips, ids 104-125):**
- ✅ X Analytics CSV (`account_analytics_content_*`): 21/22 matched (1 clip del 20 Abr no tenía X URL en el GSheet)
- ✅ YouTube IDs from GSheet → API llena views/likes/comments en page load
- ✅ Instagram URLs from GSheet → API llena views/likes/comments/shares + sobrescribe títulos con captions
- ✅ TikTok Studio screenshots: 22/22 matched (Apr 12 mapped to TT's Apr 13 — mismo clip "China/Estrecho", publicado un día después en TikTok)
- ✅ Títulos reales hardcoded desde TT Studio (IG captions todavía pueden override en page load si caption > 5 chars)

---

## Lessons Learned

1. TikTok Studio CSV solo exporta top ~14 videos — screenshots son la única forma de obtener todos los clips
2. Google Sheet episode titles ≠ clip titles — el sheet hereda un título por bloque de episodio; siempre obtener títulos reales de TikTok Studio
3. `fetch-ig.js` debe usar Batch API — calls individuales por reel hacen timeout en Vercel free tier (10s)
4. `googleapis.com` está bloqueado en el container de Claude — nunca llamar YouTube API desde Claude; solo funciona en serverless de Vercel
5. No hay dominios externos accesibles desde el container de Claude — Vercel, googleapis, graph.facebook.com bloqueados; testing solo via Vercel MCP `web_fetch_vercel_url` o el browser
6. X Analytics CSV tiene toda la data necesaria — Post id matches el status ID en el URL
7. IG API retorna últimos 100 posts solo — clips más viejos no obtienen IG data en vivo
8. YouTube API es la única fuente verdaderamente automática — no pidas YT data a Hernán, no intentes fetch manual
9. Instagram API también es automática — no pidas IG data, solo asegúrate que el token no esté expirado
10. Para updates mensuales, Hernán entrega exactamente 3 cosas: GSheet CSV, X Analytics CSV, TikTok Studio screenshots. Eso es todo.
11. **(May 2)** El `_STATUS.md` puede desviarse del código real — el conteo de clips por mes y total deben verificarse con `grep -c "id: " index.html` antes de afirmar nada.
12. **(May 2)** El IG token largo (60 días) significa que el refresh debe agendarse antes del día 50 — no esperar al 60.
