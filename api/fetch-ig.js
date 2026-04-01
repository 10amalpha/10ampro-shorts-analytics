// /api/fetch-ig.js — Vercel Serverless Function
// Fetches Instagram Reels metrics via Instagram Graph API
// Uses Facebook Batch API to avoid timeout (50 requests per batch call)
// Requires: IG_ACCESS_TOKEN env var (long-lived user token)

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
    // Step 1: Get Page Access Token
    const pageTokenUrl = `https://graph.facebook.com/v22.0/${FB_PAGE_ID}?fields=access_token&access_token=${IG_ACCESS_TOKEN}`;
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

    // Step 2: Get all media (reels) — single call, limit 100
    const mediaUrl = `https://graph.facebook.com/v22.0/${IG_USER_ID}/media?fields=id,caption,timestamp,media_type,permalink,like_count,comments_count&limit=100&access_token=${pageToken}`;
    const mediaResp = await fetch(mediaUrl);
    if (!mediaResp.ok) {
      const errText = await mediaResp.text();
      return res.status(mediaResp.status).json({ error: `IG API error: ${errText}` });
    }
    const mediaData = await mediaResp.json();
    const reels = (mediaData.data || []).filter(
      (item) => item.media_type === "VIDEO" || item.media_type === "REEL"
    );

    // Step 3: Batch fetch insights — 50 per batch call
    const insightsMap = {};

    for (let i = 0; i < reels.length; i += 50) {
      const chunk = reels.slice(i, i + 50);
      const batch = chunk.map((item) => ({
        method: "GET",
        relative_url: `${item.id}/insights?metric=views,shares,saved`,
      }));

      const batchResp = await fetch(
        `https://graph.facebook.com/v22.0/?access_token=${encodeURIComponent(pageToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batch: JSON.stringify(batch) }),
        }
      );

      if (batchResp.ok) {
        const batchResults = await batchResp.json();
        batchResults.forEach((result, idx) => {
          const mediaId = chunk[idx].id;
          insightsMap[mediaId] = { views: 0, shares: 0, saves: 0 };
          if (result.code === 200) {
            try {
              const body = JSON.parse(result.body);
              for (const metric of body.data || []) {
                const val = metric.values?.[0]?.value || 0;
                if (metric.name === "views") insightsMap[mediaId].views = val;
                if (metric.name === "shares") insightsMap[mediaId].shares = val;
                if (metric.name === "saved") insightsMap[mediaId].saves = val;
              }
            } catch (e) { /* skip */ }
          }
        });
      }
    }

    // Step 4: Fallback batch for reels with 0 views
    const zeroViewReels = reels.filter((r) => !insightsMap[r.id]?.views);
    if (zeroViewReels.length > 0) {
      for (let i = 0; i < zeroViewReels.length; i += 50) {
        const chunk = zeroViewReels.slice(i, i + 50);
        const batch = chunk.map((item) => ({
          method: "GET",
          relative_url: `${item.id}/insights?metric=ig_reels_aggregated_all_plays_count`,
        }));

        const batchResp = await fetch(
          `https://graph.facebook.com/v22.0/?access_token=${encodeURIComponent(pageToken)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ batch: JSON.stringify(batch) }),
          }
        );

        if (batchResp.ok) {
          const batchResults = await batchResp.json();
          batchResults.forEach((result, idx) => {
            const mediaId = chunk[idx].id;
            if (result.code === 200) {
              try {
                const body = JSON.parse(result.body);
                for (const metric of body.data || []) {
                  const val = metric.values?.[0]?.value || 0;
                  if (val > 0) {
                    if (!insightsMap[mediaId]) insightsMap[mediaId] = { views: 0, shares: 0, saves: 0 };
                    insightsMap[mediaId].views = val;
                  }
                }
              } catch (e) { /* skip */ }
            }
          });
        }
      }
    }

    // Step 5: Assemble results
    const results = reels.map((item) => {
      const ins = insightsMap[item.id] || { views: 0, shares: 0, saves: 0 };
      return {
        id: item.id,
        permalink: item.permalink,
        caption: (item.caption || "").substring(0, 80),
        timestamp: item.timestamp,
        likes: item.like_count || 0,
        comments: item.comments_count || 0,
        views: ins.views,
        shares: ins.shares,
        saves: ins.saves,
      };
    });

    return res.status(200).json({
      data: results,
      fetchedAt: new Date().toISOString(),
      count: results.length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
