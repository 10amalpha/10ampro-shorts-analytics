# 10AMPRO Shorts Analytics — Status & Monthly Update Process

**Repo:** `10amalpha/10ampro-shorts-analytics`
**Live:** https://10ampro-shorts-analytics.vercel.app/
**Last update:** April 1, 2026 — March 2026 data added (24 clips)
**Last commit:** `57bb174` — "feat: rewrite insights as aggressive coach-style analysis for El Gordo"

---

## Architecture

Single-page React app (`index.html`) with 3 Vercel serverless APIs:

| File | What it does | Auto/Manual |
|---|---|---|
| `index.html` | Dashboard — all UI, data, analytics | SAMPLE_DATA is manual |
| `/api/fetch-yt.js` | YouTube views/likes/comments | ✅ AUTO on page load |
| `/api/fetch-ig.js` | Instagram views/likes/comments/shares + captions as title fallback | ✅ AUTO on page load (batch API) |
| `/api/fetch-gsheet.js` | Google Sheet proxy (NOT used by dashboard yet) | ⏸ Deployed but unused |

**Data flow on page load:**
1. `SAMPLE_DATA` array renders immediately (hardcoded TikTok, X, titles)
2. `/api/fetch-yt` fires → fills YT stats → dispatches `yt-data-updated` event
3. `/api/fetch-ig` fires → fills IG stats + overwrites titles with IG captions (if caption > 5 chars) → dispatches `yt-data-updated` event
4. React re-renders all tabs with complete data

**All 6 tabs are 100% dynamic** — computed from `SAMPLE_DATA` filtered by period. No tab needs manual updates.

**Tabs:**
- **Overview** — KPI cards, platform distribution, top 5, weekly performance, 🧠 Insights para El Gordo (5 dynamic coach-style insights)
- **Rankings** — sortable table of all clips
- **Platforms** — per-platform breakdown
- **Strategy** — content strategy recommendations
- **Conversión** — conversion analysis
- **Patrones** — title/topic pattern analysis

---

## 🧠 Insights para El Gordo (Overview tab)

5 dynamic insights that recalculate per period. Coach-style, not sugarcoated:

1. **🔥 El hook que funcionó** — Top clip, how many X above average, push to replicate the opening energy
2. **💀 La realidad incómoda** — Worst clip + bottom 3 average, calls out when topic wasn't polemic enough
3. **🎯 Tasa de hooks que pegan** — % of clips above 5K views, with specific coaching per ratio bracket
4. **📅 Tu mejor día** — Best day of week by avg views, scheduling advice
5. **⚡ Cadencia y ritmo** — Clips/week, last week vs previous momentum, challenges to not publish without quality

---

## Monthly Update Checklist

### What you need from Hernán (3 items):

1. **Google Sheet CSV** — El Gordo's clip spreadsheet with dates + URLs for all 4 platforms
   - Source: `https://docs.google.com/spreadsheets/d/1huw_MXpES-fNRJ2jKka5uISFjifCqNKIHFvQudbSTW8/`
   - Contains: date, YT short URL, X post URL, IG reel URL, TikTok URL
   - NOTE: Episode title column is NOT needed — get real titles from TikTok Studio screenshots

2. **X Analytics CSV** — export from analytics.x.com
   - Columns needed: Post id, Impressions, Likes, Replies, Reposts
   - Match to clips via Post id (extracted from X URL `/status/{id}`)

3. **TikTok Studio screenshots** — Content tab, sorted by most recent
   - TikTok Studio CSV only exports top ~14 videos, NOT all
   - Screenshots show ALL videos with views/likes/comments + real clip titles
   - No shares column in TikTok Studio — set shares to 0

4. **Nothing for YouTube or Instagram** — these are LIVE APIs, auto-fetch on page load

### Step-by-step process:

```
STEP 1: Clone repo
─────────────────
git clone --depth=1 https://x-access-token:${PAT}@github.com/10amalpha/10ampro-shorts-analytics.git /tmp/10ampro-shorts-analytics

STEP 2: Parse Google Sheet CSV
──────────────────────────────
- Extract all NEW clips (dates not already in SAMPLE_DATA)
- For each clip: date, yt URL, ig URL, tiktok URL, x URL
- Clean URLs (strip ?utm_source, ?s=20, ?feature=share, etc.)

STEP 3: Match X Analytics
─────────────────────────
- Extract status ID from each clip's X URL: split("/status/")[1]
- Find matching row in X Analytics CSV by Post id
- Extract: Impressions→views, Likes→likes, Replies→comments, Reposts→shares

STEP 4: Extract TikTok data + titles from screenshots
──────────────────────────────────────────────────────
- Read views/likes/comments from TikTok Studio screenshots
- Match by post date (TikTok shows "Mar 15, 3:00 PM" etc.)
- No shares available — set to 0
- USE THE TITLE FROM TIKTOK STUDIO — this is the real clip title

STEP 5: Build SAMPLE_DATA entries
──────────────────────────────────
For each new clip:
{ id: N, title: "from TikTok Studio", date: "YYYY-MM-DD",
  tiktok: "clean URL", yt: "clean URL", ig: "clean URL", x: "clean URL",
  views: { tiktok: N, yt: 0, ig: 0, x: N },
  likes: { tiktok: N, yt: 0, ig: 0, x: N },
  comments: { tiktok: N, yt: 0, ig: 0, x: N },
  shares: { tiktok: 0, yt: 0, ig: 0, x: N } },

- YT and IG → 0 (auto-filled by live APIs)
- TikTok and X → real numbers from exports
- Titles → from TikTok Studio (NEVER generic episode name)

STEP 6: Insert into index.html
───────────────────────────────
- Add entries at TOP of SAMPLE_DATA array (newest month first)
- Period filters auto-compute from dates — no manual config needed
- All 6 tabs + insights auto-update

STEP 7: Push
────────────
git add index.html
git commit -m "feat: add [MONTH] [YEAR] clips ([N] clips)"
git push
# Vercel auto-deploys on push to main
```

---

## Critical Rules

1. **NEVER delete TikTok or X data** — no APIs for these, data is manual
2. **NEVER use episode name as clip title** — use TikTok Studio titles (IG captions are fallback only, truncated to 80 chars)
3. **YT and IG values in SAMPLE_DATA should be 0** — live APIs fill them on page load
4. **TikTok shares are always 0** — TikTok Studio doesn't expose this metric
5. **X shares = Reposts column** from X Analytics CSV
6. **IG captions override titles on page load** (if caption > 5 chars) — but always hardcode a good title from TikTok Studio as primary

---

## API Credentials & Tokens

| Item | Value | Expiry |
|---|---|---|
| YT API Key | `AIzaSyANRsjsV-WdoLxM9yEz-yIgBFBdoUYPXCw` | No expiry |
| IG Access Token | Vercel env var `IG_ACCESS_TOKEN` | ~May 11, 2026 |
| Meta App (10ampro-analytics) | ID: `1467796011515050` / Secret: `cb0a910adfb960054167df0681bb5b3a` | — |
| FB Page ID | `1060185473841846` | — |
| IG Business Account ID | `17841455171483266` | — |

### IG Token Refresh (before May 11, 2026):
1. Graph API Explorer → app **10ampro-analytics** → add permissions → generate token
2. Exchange for long-lived: `https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=1467796011515050&client_secret=cb0a910adfb960054167df0681bb5b3a&fb_exchange_token=SHORT_TOKEN`
3. Update `IG_ACCESS_TOKEN` in Vercel env vars → redeploy

---

## fetch-ig.js — Batch API (fixed April 1, 2026)

The original version made 100+ individual HTTP calls (1 per reel) → 504 timeout on Vercel free tier (10s limit).

**Current version uses Facebook Batch API:**
- 1 call to get page token
- 1 call to get media list (100 reels)
- 2 batch calls for insights (50 per batch)
- 1 fallback batch for zero-view reels
- **Total: ~5 HTTP calls instead of 100+**

---

## Data Coverage

| Month | Clips | TikTok | X | YouTube | Instagram |
|---|---|---|---|---|---|
| Dec 2025 | 15 | ✅ hardcoded | ✅ hardcoded | ✅ live API | ✅ live API |
| Jan 2026 | 39 | ✅ hardcoded | ✅ hardcoded | ✅ live API | ✅ live API |
| Feb 2026 | 26 | ✅ hardcoded | ✅ hardcoded | ✅ live API | ✅ live API |
| Mar 2026 | 24 | ✅ hardcoded | ✅ hardcoded | ✅ live API | ✅ live API |

**Total: 104 clips tracked across 4 platforms**

---

## Lessons Learned

1. **TikTok Studio CSV only exports top ~14 videos** — screenshots are the only way to get all clips
2. **Google Sheet episode titles ≠ clip titles** — the sheet inherits one title per episode block; always get real titles from TikTok Studio
3. **fetch-ig.js must use Batch API** — individual calls per reel timeout on Vercel free tier (10s limit)
4. **googleapis.com is blocked in Claude's execution container** — never try to call YouTube API from Claude; it only works in Vercel's serverless environment
5. **No external domains accessible from Claude container** — Vercel, googleapis, graph.facebook.com all blocked; all API testing must happen in browser or Vercel
6. **X Analytics CSV has all the data needed** — Post id matches the status ID in the X URL
7. **IG API returns last 100 posts only** — older clips won't get live IG data (currently covers ~3 months)
8. **YouTube API is the only truly automatic data source** — don't ask Hernán for YT data, don't try to fetch it manually
9. **Instagram API is also automatic** — don't ask for IG data either, just make sure token isn't expired
10. **For monthly updates, Hernán provides exactly 3 things**: GSheet CSV, X Analytics CSV, TikTok screenshots. That's it. No back and forth.
