# 10AMPRO Shorts Analytics — Status & Monthly Update Process

**Repo:** `10amalpha/10ampro-shorts-analytics`
**Live:** https://10ampro-shorts-analytics.vercel.app/
**Last update:** April 1, 2026 — March 2026 data added (24 clips)

---

## Architecture

Single-page React app (`index.html`) with 3 Vercel serverless APIs:

| File | What it does | Auto/Manual |
|---|---|---|
| `index.html` | Dashboard — all UI, data, analytics | SAMPLE_DATA is manual |
| `/api/fetch-yt.js` | YouTube views/likes/comments | ✅ AUTO on page load |
| `/api/fetch-ig.js` | Instagram views/likes/comments/shares | ✅ AUTO on page load (batch API) |
| `/api/fetch-gsheet.js` | Google Sheet proxy (NOT used by dashboard yet) | ⏸ Deployed but unused |

**Data flow on page load:**
1. `SAMPLE_DATA` array renders immediately (hardcoded TikTok, X, and titles)
2. `/api/fetch-yt` fires → fills YT stats → dispatches `yt-data-updated` event
3. `/api/fetch-ig` fires → fills IG stats + overwrites titles with IG captions → dispatches `yt-data-updated` event
4. React re-renders all tabs with complete data

**All 6 tabs are 100% dynamic** — computed from `SAMPLE_DATA` filtered by period. No tab needs manual updates.

---

## Monthly Update Checklist

### What you need from Hernán (4 items):

1. **Google Sheet CSV** — El Gordo's clip spreadsheet with dates + URLs for all 4 platforms
   - Source: `https://docs.google.com/spreadsheets/d/1huw_MXpES-fNRJ2jKka5uISFjifCqNKIHFvQudbSTW8/`
   - Download as CSV or use published CSV link
   - Contains: date, YT short URL, X post URL, IG reel URL, TikTok URL

2. **X Analytics CSV** — export from X Analytics (analytics.x.com)
   - Columns needed: Post id, Impressions, Likes, Replies, Reposts
   - Match to clips via Post id (extracted from X URL `/status/{id}`)

3. **TikTok Studio screenshots** — Content tab, sorted by most recent
   - TikTok Studio only exports top ~14 videos in CSV, NOT all
   - Screenshots show ALL videos with views/likes/comments
   - No shares column in TikTok Studio — set shares to 0

4. **Nothing for YouTube or Instagram** — these are live APIs

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

STEP 4: Extract TikTok data from screenshots
─────────────────────────────────────────────
- Read views/likes/comments from TikTok Studio screenshots
- Match by post date (TikTok shows "Mar 15, 3:00 PM" etc.)
- No shares available — set to 0

STEP 5: Get titles from TikTok Studio
──────────────────────────────────────
- TikTok Studio shows the actual clip title for each video
- Use these as the `title` field (NOT the episode name from the Google Sheet)
- The Google Sheet inherits episode names, which are NOT individual clip titles

STEP 6: Build SAMPLE_DATA entries
──────────────────────────────────
For each new clip:
{ id: N, title: "from TikTok Studio", date: "YYYY-MM-DD",
  tiktok: "clean URL", yt: "clean URL", ig: "clean URL", x: "clean URL",
  views: { tiktok: N, yt: 0, ig: 0, x: N },
  likes: { tiktok: N, yt: 0, ig: 0, x: N },
  comments: { tiktok: N, yt: 0, ig: 0, x: N },
  shares: { tiktok: 0, yt: 0, ig: 0, x: N } },

- YT and IG set to 0 → auto-filled by live APIs on page load
- TikTok and X set to real numbers from exports
- Titles from TikTok Studio (never use generic episode name)

STEP 7: Insert into index.html
───────────────────────────────
- Add entries at TOP of SAMPLE_DATA array (newest month first)
- Period filters auto-compute from dates — no manual config needed

STEP 8: Push
────────────
git add index.html
git commit -m "feat: add [MONTH] [YEAR] clips ([N] clips)"
git push
# Vercel auto-deploys on push to main
```

---

## Critical Rules

1. **NEVER delete TikTok or X data** — no APIs for these, data is manual
2. **NEVER use episode name as clip title** — use TikTok Studio titles or IG captions
3. **YT and IG values in SAMPLE_DATA should be 0** — live APIs fill them
4. **Titles get overridden by IG captions on page load** (if caption > 5 chars) — but always hardcode a good title anyway as fallback
5. **TikTok shares are always 0** — TikTok Studio doesn't expose this metric
6. **X shares = Reposts column** from X Analytics CSV

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

---

## Lessons Learned

1. **TikTok Studio CSV only exports top ~14 videos** — screenshots are the only way to get all clips
2. **Google Sheet episode titles ≠ clip titles** — the sheet inherits one title per episode block; always get real titles from TikTok Studio or IG captions
3. **fetch-ig.js must use Batch API** — individual calls per reel timeout on Vercel free tier
4. **googleapis.com is blocked in Claude's execution container** — never try to call YouTube API from Claude; it only works in Vercel's serverless environment
5. **X Analytics CSV has all the data needed** — Post id matches the status ID in the X URL
6. **IG API returns last 100 posts only** — older clips won't get live IG data (currently covers ~3 months)
7. **No external domains accessible from Claude container** — Vercel, googleapis, graph.facebook.com all blocked; all API testing must happen in browser or Vercel
