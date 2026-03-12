// /api/fetch-ig.js — Vercel Serverless Function
// Fetches Instagram Reels metrics via Instagram Graph API
// Requires: IG_USER_ID and IG_ACCESS_TOKEN env vars

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");

  if (req.method === "OPTIONS") return res.status(200).end();

  const IG_USER_ID = process.env.IG_USER_ID;
  const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    return res.status(500).json({ error: "Missing IG_ACCESS_TOKEN or IG_USER_ID env vars" });
  }

  try {
    // Step 1: Get all media (reels) from the IG account
    // The fields we need: id, caption, timestamp, media_type, permalink, like_count, comments_count, media_url
    const mediaUrl = `https://graph.facebook.com/v21.0/${IG_USER_ID}/media?fields=id,caption,timestamp,media_type,permalink,like_count,comments_count&limit=100&access_token=${IG_ACCESS_TOKEN}`;
    
    const mediaResp = await fetch(mediaUrl);
    if (!mediaResp.ok) {
      const errText = await mediaResp.text();
      return res.status(mediaResp.status).json({ error: `IG API error: ${errText}` });
    }

    const mediaData = await mediaResp.json();
    
    // Step 2: For each reel, get insights (views, shares, saves)
    const results = [];
    
    for (const item of (mediaData.data || [])) {
      if (item.media_type !== "VIDEO" && item.media_type !== "REEL") continue;
      
      let views = 0, shares = 0, saves = 0;
      
      try {
        const insightsUrl = `https://graph.facebook.com/v21.0/${item.id}/insights?metric=plays,shares,saved&access_token=${IG_ACCESS_TOKEN}`;
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
