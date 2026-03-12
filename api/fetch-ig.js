// /api/fetch-ig.js — Vercel Serverless Function
// Fetches Instagram Reels metrics via Instagram Graph API
// Requires: IG_ACCESS_TOKEN env var (long-lived user token)
// Uses Page ID 1060185473841846 → instagram_business_account 17841455171483266

const FB_PAGE_ID = "1060185473841846";
const IG_USER_ID = "17841455171483266";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");

  if (req.method === "OPTIONS") return res.status(200).end();

  const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

  if (!IG_ACCESS_TOKEN) {
    return res.status(500).json({ error: "Missing IG_ACCESS_TOKEN env var" });
  }

  try {
    // Step 1: Get Page Access Token from User Token
    const pageTokenUrl = `https://graph.facebook.com/v25.0/${FB_PAGE_ID}?fields=access_token&access_token=${IG_ACCESS_TOKEN}`;
    const pageTokenResp = await fetch(pageTokenUrl);
    
    if (!pageTokenResp.ok) {
      const errText = await pageTokenResp.text();
      return res.status(pageTokenResp.status).json({ error: `Page token error: ${errText}` });
    }
    
    const pageTokenData = await pageTokenResp.json();
    const pageToken = pageTokenData.access_token;
    
    if (!pageToken) {
      return res.status(500).json({ error: "Could not get page access token" });
    }

    // Step 2: Get all media (reels) from the IG account using page token
    const mediaUrl = `https://graph.facebook.com/v25.0/${IG_USER_ID}/media?fields=id,caption,timestamp,media_type,permalink,like_count,comments_count&limit=100&access_token=${pageToken}`;
    
    const mediaResp = await fetch(mediaUrl);
    if (!mediaResp.ok) {
      const errText = await mediaResp.text();
      return res.status(mediaResp.status).json({ error: `IG API error: ${errText}` });
    }

    const mediaData = await mediaResp.json();
    
    // Step 3: For each reel, get insights (views, shares, saves)
    const results = [];
    
    for (const item of (mediaData.data || [])) {
      if (item.media_type !== "VIDEO" && item.media_type !== "REEL") continue;
      
      let views = 0, shares = 0, saves = 0;
      
      try {
        const insightsUrl = `https://graph.facebook.com/v25.0/${item.id}/insights?metric=plays,shares,saved&access_token=${pageToken}`;
        const insResp = await fetch(insightsUrl);
        if (insResp.ok) {
          const insData = await insResp.json();
          for (const metric of (insData.data || [])) {
            if (metric.name === "plays" || metric.name === "views") {
              views = metric.values?.[0]?.value || 0;
            }
            if (metric.name === "shares") {
              shares = metric.values?.[0]?.value || 0;
            }
            if (metric.name === "saved") {
              saves = metric.values?.[0]?.value || 0;
            }
          }
        }
      } catch (e) {
        // Skip insights errors for individual posts
      }

      results.push({
        id: item.id,
        permalink: item.permalink,
        caption: (item.caption || "").substring(0, 80),
        timestamp: item.timestamp,
        likes: item.like_count || 0,
        comments: item.comments_count || 0,
        views,
        shares,
        saves,
      });
    }

    return res.status(200).json({
      data: results,
      fetchedAt: new Date().toISOString(),
      count: results.length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
