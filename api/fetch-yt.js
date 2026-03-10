// /api/fetch-yt.js — Vercel Serverless Function
// Fetches YouTube views/likes/comments for all shorts via YouTube Data API v3
// Called by the dashboard on page load to auto-update YT data

const YT_API_KEY = process.env.YT_API_KEY || "AIzaSyANRsjsV-WdoLxM9yEz-yIgBFBdoUYPXCw";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { ids } = req.query;
  if (!ids) {
    return res.status(400).json({ error: "Missing 'ids' query parameter" });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${YT_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `YouTube API error: ${errText}` });
    }
    
    const data = await response.json();
    
    // Transform to simple map: { videoId: { views, likes, comments } }
    const result = {};
    if (data.items) {
      for (const item of data.items) {
        result[item.id] = {
          views: parseInt(item.statistics.viewCount || "0"),
          likes: parseInt(item.statistics.likeCount || "0"),
          comments: parseInt(item.statistics.commentCount || "0"),
        };
      }
    }
    
    return res.status(200).json({
      data: result,
      fetchedAt: new Date().toISOString(),
      count: Object.keys(result).length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
