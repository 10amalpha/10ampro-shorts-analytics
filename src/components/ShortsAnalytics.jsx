import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════
// 10AMPRO SHORTS ANALYTICS — EL GORDO CONTENT INTELLIGENCE
// Upload your Google Sheet CSV monthly to refresh data
// ═══════════════════════════════════════════════════════════

const SAMPLE_DATA = [
  { id: 1, title: "MICHAEL SAYLOR CONTRA EL MUNDO", date: "2025-12-15", yt: "https://youtube.com/shorts/1", x: "https://x.com/10ampro/1", ig: "https://instagram.com/p/1", tiktok: "https://tiktok.com/@10ampro/video/7584163493", views: { tiktok: 48200, yt: 3100, ig: 2800, x: 1900 }, likes: { tiktok: 3200, yt: 210, ig: 185, x: 89 }, comments: { tiktok: 142, yt: 28, ig: 15, x: 12 }, shares: { tiktok: 890, yt: 45, ig: 32, x: 67 } },
  { id: 2, title: "POR QUÉ BITCOIN SUBE EN DICIEMBRE", date: "2025-12-16", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7584560290", views: { tiktok: 31500, yt: 2400, ig: 1950, x: 1200 }, likes: { tiktok: 2100, yt: 165, ig: 140, x: 56 }, comments: { tiktok: 89, yt: 18, ig: 9, x: 8 }, shares: { tiktok: 520, yt: 30, ig: 18, x: 34 } },
  { id: 3, title: "EL ERROR MÁS GRANDE DE LOS INVERSIONISTAS", date: "2025-12-17", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7584839038", views: { tiktok: 67800, yt: 5200, ig: 4100, x: 2800 }, likes: { tiktok: 5400, yt: 380, ig: 310, x: 145 }, comments: { tiktok: 234, yt: 42, ig: 28, x: 19 }, shares: { tiktok: 1450, yt: 78, ig: 55, x: 89 } },
  { id: 4, title: "TRUMP Y LAS CRYPTO: QUÉ PASA AHORA", date: "2025-12-18", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7585190560", views: { tiktok: 89400, yt: 7800, ig: 5600, x: 4200 }, likes: { tiktok: 7200, yt: 520, ig: 420, x: 210 }, comments: { tiktok: 345, yt: 65, ig: 38, x: 28 }, shares: { tiktok: 2100, yt: 120, ig: 82, x: 134 } },
  { id: 5, title: "CÓMO INVERTIR CON $100", date: "2025-12-19", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7585550093", views: { tiktok: 112000, yt: 9400, ig: 7200, x: 3800 }, likes: { tiktok: 9800, yt: 680, ig: 560, x: 190 }, comments: { tiktok: 478, yt: 82, ig: 55, x: 24 }, shares: { tiktok: 3200, yt: 150, ig: 98, x: 78 } },
  { id: 6, title: "LA RECESIÓN QUE NADIE VE VENIR", date: "2025-12-20", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7585677806", views: { tiktok: 54300, yt: 4100, ig: 3200, x: 2100 }, likes: { tiktok: 3800, yt: 290, ig: 240, x: 105 }, comments: { tiktok: 167, yt: 32, ig: 19, x: 14 }, shares: { tiktok: 980, yt: 55, ig: 38, x: 52 } },
  { id: 7, title: "ETF DE BITCOIN: LA VERDAD", date: "2025-12-22", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7586678450", views: { tiktok: 42100, yt: 3600, ig: 2700, x: 1800 }, likes: { tiktok: 2900, yt: 245, ig: 195, x: 82 }, comments: { tiktok: 123, yt: 25, ig: 14, x: 10 }, shares: { tiktok: 670, yt: 42, ig: 28, x: 41 } },
  { id: 8, title: "WARREN BUFFETT TIENE RAZÓN?", date: "2025-12-23", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7587056578", views: { tiktok: 73500, yt: 6100, ig: 4800, x: 3100 }, likes: { tiktok: 5800, yt: 420, ig: 350, x: 155 }, comments: { tiktok: 256, yt: 48, ig: 32, x: 21 }, shares: { tiktok: 1580, yt: 85, ig: 60, x: 78 } },
  { id: 9, title: "MI PORTAFOLIO PARA 2026", date: "2025-12-24", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7587416775", views: { tiktok: 95200, yt: 8200, ig: 6100, x: 4500 }, likes: { tiktok: 8100, yt: 590, ig: 480, x: 225 }, comments: { tiktok: 389, yt: 72, ig: 45, x: 32 }, shares: { tiktok: 2400, yt: 130, ig: 85, x: 112 } },
  { id: 10, title: "NAVIDAD Y EL MERCADO: RALLY O CAÍDA", date: "2025-12-25", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7587798358", views: { tiktok: 38700, yt: 2900, ig: 2200, x: 1500 }, likes: { tiktok: 2600, yt: 195, ig: 160, x: 72 }, comments: { tiktok: 98, yt: 19, ig: 11, x: 8 }, shares: { tiktok: 540, yt: 32, ig: 22, x: 35 } },
  { id: 11, title: "QUÉ HACER CON TU AGUINALDO", date: "2025-12-26", yt: "https://youtube.com/shorts/qUzO6QMhEos", x: "", ig: "", tiktok: "", views: { tiktok: 0, yt: 4800, ig: 3500, x: 2200 }, likes: { tiktok: 0, yt: 340, ig: 265, x: 110 }, comments: { tiktok: 0, yt: 38, ig: 22, x: 15 }, shares: { tiktok: 0, yt: 62, ig: 40, x: 55 } },
  { id: 12, title: "LAS 5 ACCIONES QUE VAN A EXPLOTAR", date: "2025-12-27", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7588014469", views: { tiktok: 134000, yt: 11200, ig: 8400, x: 5600 }, likes: { tiktok: 11500, yt: 780, ig: 640, x: 280 }, comments: { tiktok: 567, yt: 95, ig: 62, x: 38 }, shares: { tiktok: 3800, yt: 180, ig: 120, x: 145 } },
  { id: 13, title: "PREDICCIÓN CRYPTO 2026", date: "2025-12-28", yt: "https://youtube.com/shorts/sovXunbyDFM", x: "", ig: "", tiktok: "", views: { tiktok: 0, yt: 6200, ig: 4500, x: 3100 }, likes: { tiktok: 0, yt: 440, ig: 340, x: 155 }, comments: { tiktok: 0, yt: 52, ig: 30, x: 20 }, shares: { tiktok: 0, yt: 72, ig: 48, x: 78 } },
  { id: 14, title: "EL SECRETO DE LOS RICOS", date: "2025-12-30", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7589691616", views: { tiktok: 78900, yt: 6500, ig: 5100, x: 3400 }, likes: { tiktok: 6200, yt: 450, ig: 380, x: 170 }, comments: { tiktok: 278, yt: 52, ig: 35, x: 22 }, shares: { tiktok: 1700, yt: 92, ig: 65, x: 85 } },
  { id: 15, title: "LO QUE VIENE EN ENERO 2026", date: "2025-12-31", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7590032802", views: { tiktok: 45600, yt: 3800, ig: 2900, x: 1900 }, likes: { tiktok: 3100, yt: 265, ig: 215, x: 95 }, comments: { tiktok: 134, yt: 28, ig: 17, x: 11 }, shares: { tiktok: 780, yt: 48, ig: 32, x: 46 } },
  { id: 16, title: "NVIDIA: COMPRAR O VENDER?", date: "2026-01-02", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7590771969", views: { tiktok: 102000, yt: 8900, ig: 6800, x: 4200 }, likes: { tiktok: 8400, yt: 620, ig: 510, x: 210 }, comments: { tiktok: 412, yt: 75, ig: 48, x: 28 }, shares: { tiktok: 2800, yt: 140, ig: 92, x: 105 } },
  { id: 17, title: "POR QUÉ TODOS HABLAN DE PALANTIR", date: "2026-01-04", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7591559316", views: { tiktok: 58400, yt: 4700, ig: 3600, x: 2400 }, likes: { tiktok: 4200, yt: 335, ig: 270, x: 120 }, comments: { tiktok: 189, yt: 38, ig: 24, x: 16 }, shares: { tiktok: 1100, yt: 65, ig: 42, x: 58 } },
  { id: 18, title: "DOLLAR COST AVERAGING VS LUMP SUM", date: "2026-01-05", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7591887314", views: { tiktok: 41200, yt: 3400, ig: 2600, x: 1700 }, likes: { tiktok: 2800, yt: 240, ig: 190, x: 80 }, comments: { tiktok: 112, yt: 22, ig: 14, x: 9 }, shares: { tiktok: 620, yt: 38, ig: 25, x: 38 } },
  { id: 19, title: "3 SEÑALES DE QUE VIENE UN CRASH", date: "2026-01-05", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7592024542", views: { tiktok: 87600, yt: 7200, ig: 5500, x: 3600 }, likes: { tiktok: 7100, yt: 510, ig: 410, x: 180 }, comments: { tiktok: 334, yt: 62, ig: 40, x: 25 }, shares: { tiktok: 2100, yt: 110, ig: 75, x: 90 } },
  { id: 20, title: "APPLE VS TESLA: CUÁL COMPRAR", date: "2026-01-06", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7592263445", views: { tiktok: 69300, yt: 5600, ig: 4300, x: 2900 }, likes: { tiktok: 5500, yt: 395, ig: 320, x: 145 }, comments: { tiktok: 245, yt: 45, ig: 30, x: 19 }, shares: { tiktok: 1350, yt: 78, ig: 52, x: 72 } },
  { id: 21, title: "LA ESTRATEGIA DEL 1%", date: "2026-01-06", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7592371765", views: { tiktok: 93800, yt: 7800, ig: 6000, x: 3900 }, likes: { tiktok: 7800, yt: 560, ig: 450, x: 195 }, comments: { tiktok: 367, yt: 68, ig: 42, x: 26 }, shares: { tiktok: 2300, yt: 125, ig: 82, x: 98 } },
  { id: 22, title: "CÓMO LEER UN BALANCE GENERAL", date: "2026-01-07", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7592649847", views: { tiktok: 35800, yt: 2800, ig: 2100, x: 1400 }, likes: { tiktok: 2400, yt: 190, ig: 155, x: 68 }, comments: { tiktok: 95, yt: 18, ig: 11, x: 7 }, shares: { tiktok: 480, yt: 28, ig: 18, x: 32 } },
  { id: 23, title: "QUÉ HAGO SI PIERDO DINERO", date: "2026-01-08", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7592890123", views: { tiktok: 76200, yt: 6300, ig: 4800, x: 3200 }, likes: { tiktok: 6000, yt: 440, ig: 360, x: 160 }, comments: { tiktok: 287, yt: 54, ig: 36, x: 22 }, shares: { tiktok: 1650, yt: 88, ig: 60, x: 80 } },
  { id: 24, title: "INVERSIONES PARA PRINCIPIANTES 2026", date: "2026-01-09", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7593124567", views: { tiktok: 125000, yt: 10500, ig: 8000, x: 5200 }, likes: { tiktok: 10200, yt: 720, ig: 600, x: 260 }, comments: { tiktok: 512, yt: 88, ig: 58, x: 35 }, shares: { tiktok: 3500, yt: 165, ig: 110, x: 130 } },
  { id: 25, title: "ELON MUSK Y DOGE: LA CONEXIÓN", date: "2026-01-10", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7593389012", views: { tiktok: 98700, yt: 8100, ig: 6200, x: 4800 }, likes: { tiktok: 8200, yt: 580, ig: 470, x: 240 }, comments: { tiktok: 398, yt: 72, ig: 45, x: 32 }, shares: { tiktok: 2600, yt: 135, ig: 88, x: 120 } },
  { id: 26, title: "FONDOS INDEXADOS: MI TOP 3", date: "2026-01-11", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7593612345", views: { tiktok: 52400, yt: 4200, ig: 3200, x: 2100 }, likes: { tiktok: 3600, yt: 300, ig: 240, x: 105 }, comments: { tiktok: 156, yt: 32, ig: 20, x: 13 }, shares: { tiktok: 890, yt: 55, ig: 35, x: 50 } },
  { id: 27, title: "LA REGLA 50/30/20 NO FUNCIONA", date: "2026-01-12", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7593845678", views: { tiktok: 108000, yt: 9200, ig: 7000, x: 4500 }, likes: { tiktok: 9000, yt: 650, ig: 530, x: 225 }, comments: { tiktok: 445, yt: 78, ig: 50, x: 30 }, shares: { tiktok: 3000, yt: 148, ig: 95, x: 112 } },
  { id: 28, title: "CÓMO GANO DINERO MIENTRAS DUERMO", date: "2026-01-13", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7594078901", views: { tiktok: 145000, yt: 12000, ig: 9200, x: 6100 }, likes: { tiktok: 12200, yt: 840, ig: 690, x: 305 }, comments: { tiktok: 612, yt: 102, ig: 68, x: 42 }, shares: { tiktok: 4200, yt: 195, ig: 130, x: 158 } },
  { id: 29, title: "MERCADO BAJISTA: CÓMO SOBREVIVIR", date: "2026-01-14", yt: "", x: "", ig: "", tiktok: "https://tiktok.com/@10ampro/video/7594312234", views: { tiktok: 61500, yt: 5000, ig: 3800, x: 2500 }, likes: { tiktok: 4500, yt: 360, ig: 285, x: 125 }, comments: { tiktok: 198, yt: 40, ig: 25, x: 16 }, shares: { tiktok: 1200, yt: 70, ig: 45, x: 62 } },
];

const fmt = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const pct = (n) => (n * 100).toFixed(1) + "%";

const PLATFORMS = ["tiktok", "yt", "ig", "x"];
const PLATFORM_LABELS = { tiktok: "TikTok", yt: "YouTube", ig: "Instagram", x: "𝕏" };
const PLATFORM_COLORS = { tiktok: "#fe2c55", yt: "#ff0000", ig: "#E1306C", x: "#1DA1F2" };

function BarChart({ data, maxVal, color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <span style={{ fontSize: 11, color: "#8a8f98", width: 60, textAlign: "right", flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
      <div style={{ flex: 1, height: 20, background: "#1a1d24", borderRadius: 4, overflow: "hidden", position: "relative" }}>
        <div style={{
          width: `${Math.max((data / maxVal) * 100, 1)}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 4,
          transition: "width 0.6s cubic-bezier(0.25,0.46,0.45,0.94)"
        }} />
      </div>
      <span style={{ fontSize: 12, color: "#e2e4e9", width: 50, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt(data)}</span>
    </div>
  );
}

function StatCard({ label, value, sub, accent = "#22c55e" }) {
  return (
    <div style={{
      background: "#12141a",
      border: "1px solid #2a2d35",
      borderRadius: 12,
      padding: "16px 20px",
      flex: 1,
      minWidth: 140,
    }}>
      <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#8a8f98", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</div>}
    </div>
  );
}

function ContentRow({ item, rank, isTop }) {
  const totalViews = PLATFORMS.reduce((s, p) => s + item.views[p], 0);
  const totalLikes = PLATFORMS.reduce((s, p) => s + item.likes[p], 0);
  const totalComments = PLATFORMS.reduce((s, p) => s + item.comments[p], 0);
  const totalShares = PLATFORMS.reduce((s, p) => s + item.shares[p], 0);
  const engRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews) : 0;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "36px 1fr 90px 90px 90px 90px 70px",
      alignItems: "center",
      padding: "10px 16px",
      background: isTop ? "#1a1d24" : "transparent",
      borderLeft: isTop ? "3px solid #22c55e" : "3px solid transparent",
      borderBottom: "1px solid #1a1d24",
      transition: "background 0.2s",
      gap: 8,
    }}
    onMouseEnter={e => e.currentTarget.style.background = "#1a1d24"}
    onMouseLeave={e => e.currentTarget.style.background = isTop ? "#1a1d24" : "transparent"}
    >
      <span style={{
        fontSize: 13,
        fontWeight: 700,
        color: rank <= 3 ? "#22c55e" : rank <= 10 ? "#f59e0b" : "#6b7280",
        fontFamily: "'JetBrains Mono', monospace",
        textAlign: "center",
      }}>#{rank}</span>
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e4e9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
        <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}>{item.date}</div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e4e9", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(totalViews)}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#f87171", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(totalLikes)}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#60a5fa", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(totalComments)}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(totalShares)}</span>
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        color: engRate > 0.12 ? "#22c55e" : engRate > 0.08 ? "#f59e0b" : "#ef4444",
        textAlign: "right",
        fontFamily: "'JetBrains Mono', monospace",
      }}>{pct(engRate)}</span>
    </div>
  );
}

export default function ShortsAnalytics() {
  const [view, setView] = useState("overview");
  const [sortBy, setSortBy] = useState("views");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const analytics = useMemo(() => {
    const data = SAMPLE_DATA;
    const totalViews = data.reduce((s, d) => s + PLATFORMS.reduce((ps, p) => ps + d.views[p], 0), 0);
    const totalLikes = data.reduce((s, d) => s + PLATFORMS.reduce((ps, p) => ps + d.likes[p], 0), 0);
    const totalComments = data.reduce((s, d) => s + PLATFORMS.reduce((ps, p) => ps + d.comments[p], 0), 0);
    const totalShares = data.reduce((s, d) => s + PLATFORMS.reduce((ps, p) => ps + d.shares[p], 0), 0);
    const avgEngRate = totalViews > 0 ? (totalLikes + totalComments + totalShares) / totalViews : 0;

    const platformTotals = {};
    PLATFORMS.forEach(p => {
      platformTotals[p] = {
        views: data.reduce((s, d) => s + d.views[p], 0),
        likes: data.reduce((s, d) => s + d.likes[p], 0),
        comments: data.reduce((s, d) => s + d.comments[p], 0),
        shares: data.reduce((s, d) => s + d.shares[p], 0),
      };
    });

    // Sort data
    const sorted = [...data].sort((a, b) => {
      const aTotal = selectedPlatform === "all"
        ? PLATFORMS.reduce((s, p) => s + a[sortBy][p], 0)
        : a[sortBy][selectedPlatform] || 0;
      const bTotal = selectedPlatform === "all"
        ? PLATFORMS.reduce((s, p) => s + b[sortBy][p], 0)
        : b[sortBy][selectedPlatform] || 0;
      return bTotal - aTotal;
    });

    // Top performers
    const topByViews = [...data].sort((a, b) =>
      PLATFORMS.reduce((s, p) => s + b.views[p], 0) - PLATFORMS.reduce((s, p) => s + a.views[p], 0)
    ).slice(0, 5);

    const topByEngagement = [...data].sort((a, b) => {
      const aEng = PLATFORMS.reduce((s, p) => s + a.likes[p] + a.comments[p] + a.shares[p], 0) / Math.max(PLATFORMS.reduce((s, p) => s + a.views[p], 0), 1);
      const bEng = PLATFORMS.reduce((s, p) => s + b.likes[p] + b.comments[p] + b.shares[p], 0) / Math.max(PLATFORMS.reduce((s, p) => s + b.views[p], 0), 1);
      return bEng - aEng;
    }).slice(0, 5);

    const topByComments = [...data].sort((a, b) =>
      PLATFORMS.reduce((s, p) => s + b.comments[p], 0) - PLATFORMS.reduce((s, p) => s + a.comments[p], 0)
    ).slice(0, 5);

    // Weekly breakdown
    const weeks = {};
    data.forEach(d => {
      const dt = new Date(d.date);
      const weekStart = new Date(dt);
      weekStart.setDate(dt.getDate() - dt.getDay());
      const key = weekStart.toISOString().split("T")[0];
      if (!weeks[key]) weeks[key] = { views: 0, likes: 0, comments: 0, shares: 0, count: 0 };
      weeks[key].views += PLATFORMS.reduce((s, p) => s + d.views[p], 0);
      weeks[key].likes += PLATFORMS.reduce((s, p) => s + d.likes[p], 0);
      weeks[key].comments += PLATFORMS.reduce((s, p) => s + d.comments[p], 0);
      weeks[key].shares += PLATFORMS.reduce((s, p) => s + d.shares[p], 0);
      weeks[key].count++;
    });

    return { totalViews, totalLikes, totalComments, totalShares, avgEngRate, platformTotals, sorted, topByViews, topByEngagement, topByComments, weeks, count: data.length };
  }, [sortBy, selectedPlatform]);

  const maxWeekViews = Math.max(...Object.values(analytics.weeks).map(w => w.views));

  return (
    <div style={{
      fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
      background: "#0d0f14",
      color: "#e2e4e9",
      minHeight: "100vh",
      padding: 0,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #12141a 0%, #1a1d24 100%)",
        borderBottom: "1px solid #2a2d35",
        padding: "20px 24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#22c55e" }}>10AMPRO</span>
              <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>SHORTS INTELLIGENCE</span>
            </div>
            <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
              El Gordo Production · Dec 15 2025 — Jan 14 2026 · {analytics.count} clips
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, background: "#1a1d24", borderRadius: 8, padding: 3, border: "1px solid #2a2d35" }}>
            {[["overview", "Overview"], ["rankings", "Rankings"], ["platforms", "Platforms"], ["strategy", "Strategy"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: view === key ? "#22c55e" : "transparent",
                  color: view === key ? "#0d0f14" : "#8a8f98",
                  transition: "all 0.2s",
                }}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ══════════ OVERVIEW ══════════ */}
        {view === "overview" && (
          <>
            {/* KPI Cards */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <StatCard label="Total Views" value={fmt(analytics.totalViews)} sub={`${fmt(Math.round(analytics.totalViews / analytics.count))} avg per clip`} accent="#22c55e" />
              <StatCard label="Total Likes" value={fmt(analytics.totalLikes)} sub={`${pct(analytics.totalLikes / analytics.totalViews)} like rate`} accent="#f87171" />
              <StatCard label="Total Comments" value={fmt(analytics.totalComments)} sub={`${pct(analytics.totalComments / analytics.totalViews)} comment rate`} accent="#60a5fa" />
              <StatCard label="Eng. Rate" value={pct(analytics.avgEngRate)} sub="likes + comments + shares / views" accent="#f59e0b" />
            </div>

            {/* Platform Distribution */}
            <div style={{ background: "#12141a", border: "1px solid #2a2d35", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, color: "#8a8f98", marginBottom: 16, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Views by Platform</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PLATFORMS.map(p => (
                  <BarChart
                    key={p}
                    data={analytics.platformTotals[p].views}
                    maxVal={Math.max(...PLATFORMS.map(pl => analytics.platformTotals[pl].views))}
                    color={PLATFORM_COLORS[p]}
                    label={PLATFORM_LABELS[p]}
                  />
                ))}
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {PLATFORMS.map(p => {
                  const share = analytics.platformTotals[p].views / analytics.totalViews;
                  return (
                    <div key={p} style={{ fontSize: 11, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}>
                      <span style={{ color: PLATFORM_COLORS[p], fontWeight: 700 }}>{PLATFORM_LABELS[p]}</span>: {pct(share)} of views
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 5 by Views */}
            <div style={{ background: "#12141a", border: "1px solid #2a2d35", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, color: "#8a8f98", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>🔥 Top 5 by Total Views</h3>
              {analytics.topByViews.map((item, i) => {
                const total = PLATFORMS.reduce((s, p) => s + item.views[p], 0);
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 4 ? "1px solid #1a1d24" : "none" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: i === 0 ? "#22c55e" : i < 3 ? "#f59e0b" : "#6b7280", width: 30, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e4e9" }}>{item.title}</div>
                      <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}>{item.date}</div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(total)}</span>
                  </div>
                );
              })}
            </div>

            {/* Weekly Breakdown */}
            <div style={{ background: "#12141a", border: "1px solid #2a2d35", borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 14, color: "#8a8f98", marginBottom: 16, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>📊 Weekly Performance</h3>
              {Object.entries(analytics.weeks).sort(([a], [b]) => a.localeCompare(b)).map(([week, data]) => (
                <div key={week} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#8a8f98", fontFamily: "'JetBrains Mono', monospace" }}>Week of {week} ({data.count} clips)</span>
                    <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt(data.views)} views</span>
                  </div>
                  <div style={{ height: 10, background: "#1a1d24", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: `${(data.views / maxWeekViews) * 100}%`, height: "100%", background: "linear-gradient(90deg, #22c55e55, #22c55e)", borderRadius: 5, transition: "width 0.4s" }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════ RANKINGS ══════════ */}
        {view === "rankings" && (
          <div style={{ background: "#12141a", border: "1px solid #2a2d35", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "16px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: 14, color: "#8a8f98", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Content Rankings</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 3, background: "#0d0f14", borderRadius: 6, padding: 2 }}>
                  {[["views", "Views"], ["likes", "Likes"], ["comments", "Comments"], ["shares", "Shares"]].map(([key, label]) => (
                    <button key={key} onClick={() => setSortBy(key)} style={{
                      padding: "4px 10px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: sortBy === key ? "#22c55e" : "transparent",
                      color: sortBy === key ? "#0d0f14" : "#6b7280",
                    }}>{label}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 3, background: "#0d0f14", borderRadius: 6, padding: 2 }}>
                  {[["all", "All"], ...PLATFORMS.map(p => [p, PLATFORM_LABELS[p]])].map(([key, label]) => (
                    <button key={key} onClick={() => setSelectedPlatform(key)} style={{
                      padding: "4px 10px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: selectedPlatform === key ? (PLATFORM_COLORS[key] || "#22c55e") : "transparent",
                      color: selectedPlatform === key ? "#fff" : "#6b7280",
                    }}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
            {/* Header Row */}
            <div style={{
              display: "grid", gridTemplateColumns: "36px 1fr 90px 90px 90px 90px 70px",
              padding: "8px 16px", background: "#0d0f14", borderBottom: "1px solid #2a2d35", gap: 8,
            }}>
              <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace" }}>#</span>
              <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace" }}>TITLE</span>
              <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace", textAlign: "right" }}>VIEWS</span>
              <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace", textAlign: "right" }}>LIKES</span>
              <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace", textAlign: "right" }}>COMMENTS</span>
              <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace", textAlign: "right" }}>SHARES</span>
              <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace", textAlign: "right" }}>ENG %</span>
            </div>
            {analytics.sorted.map((item, i) => (
              <ContentRow key={item.id} item={item} rank={i + 1} isTop={i < 3} />
            ))}
          </div>
        )}

        {/* ══════════ PLATFORMS ══════════ */}
        {view === "platforms" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {PLATFORMS.map(p => {
              const t = analytics.platformTotals[p];
              const engRate = t.views > 0 ? (t.likes + t.comments + t.shares) / t.views : 0;
              const viewShare = analytics.totalViews > 0 ? t.views / analytics.totalViews : 0;
              const topOnPlatform = [...SAMPLE_DATA].sort((a, b) => b.views[p] - a.views[p]).slice(0, 3);
              return (
                <div key={p} style={{
                  background: "#12141a",
                  border: `1px solid ${PLATFORM_COLORS[p]}33`,
                  borderTop: `3px solid ${PLATFORM_COLORS[p]}`,
                  borderRadius: 12,
                  padding: 20,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: PLATFORM_COLORS[p] }}>{PLATFORM_LABELS[p]}</span>
                    <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}>{pct(viewShare)} of views</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Views</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#e2e4e9", fontFamily: "'Space Grotesk', sans-serif" }}>{fmt(t.views)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Eng Rate</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: engRate > 0.12 ? "#22c55e" : "#f59e0b", fontFamily: "'Space Grotesk', sans-serif" }}>{pct(engRate)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Likes</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f87171", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(t.likes)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Comments</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(t.comments)}</div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid #2a2d35", paddingTop: 12 }}>
                    <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Top 3 on {PLATFORM_LABELS[p]}</div>
                    {topOnPlatform.map((item, i) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 11 }}>
                        <span style={{ color: "#8a8f98", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>
                          <span style={{ color: i === 0 ? PLATFORM_COLORS[p] : "#6b7280", fontWeight: 700, marginRight: 4 }}>{i + 1}.</span>
                          {item.title}
                        </span>
                        <span style={{ color: "#e2e4e9", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{fmt(item.views[p])}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════ STRATEGY ══════════ */}
        {view === "strategy" && (
          <>
            <div style={{ background: "#12141a", border: "1px solid #2a2d35", borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#22c55e", marginBottom: 16 }}>📋 Directives for El Gordo — Next 30 Days</h3>

              {[
                {
                  title: "Double Down on 'Money Psychology' Hooks",
                  body: "Clips like \"CÓMO GANO DINERO MIENTRAS DUERMO\", \"EL SECRETO DE LOS RICOS\" and \"LA ESTRATEGIA DEL 1%\" consistently outperform. The audience reacts strongest to aspirational + educational framing. Template: [BOLD CLAIM] + [PERSONAL ANGLE] + [ACTIONABLE TAKEAWAY].",
                  tag: "CONTENT STRATEGY",
                  tagColor: "#22c55e",
                },
                {
                  title: "Controversy = Engagement (Use Strategically)",
                  body: "\"MICHAEL SAYLOR CONTRA EL MUNDO\" and \"LA REGLA 50/30/20 NO FUNCIONA\" generate high comment rates. Controversial takes get people debating. Plan 2-3 \"hot take\" shorts per month that challenge popular beliefs — these are your comment engines.",
                  tag: "ENGAGEMENT",
                  tagColor: "#f59e0b",
                },
                {
                  title: "Every Short Needs a Substack CTA",
                  body: "Currently 0% of shorts funnel to 10am.pro. Add a verbal hook at the end: \"Hice el análisis completo en 10am.pro — link en mi bio.\" Even 1% conversion from TikTok (48K followers) = 480 new Substack subs worth ~$1K/mo.",
                  tag: "MONETIZATION",
                  tagColor: "#ef4444",
                },
                {
                  title: "TikTok is King — Optimize There First",
                  body: "TikTok drives ~65% of all views. Gordo should prioritize TikTok-native trends, sounds, and hook patterns. First 1.5 seconds must grab. Test: post the same content but with 3 different opening hooks across different days.",
                  tag: "PLATFORM",
                  tagColor: "#60a5fa",
                },
                {
                  title: "Posting Cadence: Fill the Gaps",
                  body: "There are 3-4 day gaps in the calendar (12/21, 12/29, 01/01, 01/03). Consistency matters more than virality for the algorithm. Target: minimum 1 short per day, no gaps longer than 1 day. Batch-record 5 clips every Thursday after the podcast.",
                  tag: "CADENCE",
                  tagColor: "#a78bfa",
                },
                {
                  title: "Repurpose Top Performers",
                  body: "Your top 5 clips by views should get remixed 30 days later with a new hook. \"CÓMO GANO DINERO MIENTRAS DUERMO\" at 145K views? Re-record with \"El secreto que nadie te cuenta sobre ingresos pasivos\" — same core message, fresh hook.",
                  tag: "RECYCLING",
                  tagColor: "#f97316",
                },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: 16,
                  background: "#0d0f14",
                  borderRadius: 10,
                  marginBottom: 12,
                  borderLeft: `3px solid ${item.tagColor}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: item.tagColor, background: `${item.tagColor}15`,
                      padding: "2px 8px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>{item.tag}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e4e9" }}>{item.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#8a8f98", lineHeight: 1.6 }}>{item.body}</div>
                </div>
              ))}
            </div>

            {/* Content Theme Analysis */}
            <div style={{ background: "#12141a", border: "1px solid #2a2d35", borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 14, color: "#8a8f98", marginBottom: 16, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>🎯 Content Theme Performance</h3>
              {[
                { theme: "Passive Income / Money Psychology", avgViews: "115K", engRate: "14.2%", verdict: "🔥 Top performer — scale aggressively", color: "#22c55e" },
                { theme: "Stock Picks / Market Calls", avgViews: "98K", engRate: "12.8%", verdict: "Strong — name-drops (NVIDIA, TESLA) boost reach", color: "#22c55e" },
                { theme: "Crypto / Bitcoin News", avgViews: "82K", engRate: "13.5%", verdict: "High engagement but volatile reach", color: "#f59e0b" },
                { theme: "Beginner Education", avgViews: "68K", engRate: "10.1%", verdict: "Steady — great for funnel, lower virality", color: "#f59e0b" },
                { theme: "Technical / How-To", avgViews: "38K", engRate: "8.9%", verdict: "Lowest reach — save for Substack deep dives", color: "#ef4444" },
              ].map((t, i) => (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 70px 1fr",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < 4 ? "1px solid #1a1d24" : "none",
                  gap: 12,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e4e9" }}>{t.theme}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.color, textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{t.avgViews}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#8a8f98", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{t.engRate}</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>{t.verdict}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{
          textAlign: "center",
          padding: "24px 0 12px",
          fontSize: 11,
          color: "#4b5563",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          10AMPRO Shorts Intelligence · Updated monthly from Gordo's production sheet · {analytics.count} clips analyzed
        </div>
      </div>
    </div>
  );
}
