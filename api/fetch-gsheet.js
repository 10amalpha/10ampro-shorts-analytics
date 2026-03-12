// /api/fetch-gsheet.js — Vercel Serverless Function
// Fetches Google Sheets published CSV and returns parsed clip data
// Avoids CORS issues by proxying through server

const GSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR5oMVX5Vdn90diFdW9Y-REdMTy5_CwaINUA4_fGLUyYkL5a5qs_L0qQROlw63xp0AFQ2NevnyVXyxh/pub?output=csv";

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [m, d, y] = parts.map(Number);
  const year = y < 50 ? 2000 + y : 1900 + y;
  return `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function cleanURL(url) {
  if (!url) return "";
  return url.split('?')[0].split('#')[0];
}

function extractIGPermalink(url) {
  const clean = cleanURL(url);
  const match = clean.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/);
  return match ? `https://www.instagram.com/reel/${match[1]}/` : "";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const resp = await fetch(GSHEET_CSV_URL);
    if (!resp.ok) throw new Error(`Google Sheets fetch failed: ${resp.status}`);
    const text = await resp.text();
    const lines = text.split('\n').filter(l => l.trim());

    const clips = [];
    let lastTitle = "";
    let lastDate = null;

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const title = cols[0] || lastTitle || "";
      if (cols[0]) lastTitle = cols[0];

      const date = parseDate(cols[1]) || lastDate;
      if (parseDate(cols[1])) lastDate = date;
      
      const yt = cleanURL(cols[2] || "");
      const x = cleanURL(cols[3] || "");
      const ig = extractIGPermalink(cols[4] || "");
      const tiktok = cleanURL(cols[5] || "");

      if (!yt && !x && !ig && !tiktok) continue;
      if (!date) continue;

      clips.push({ id: i, title: title.replace(/^["']|["']$/g, '').substring(0, 80), date, tiktok, yt, ig, x });
    }

    return res.status(200).json({ data: clips, fetchedAt: new Date().toISOString(), count: clips.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
