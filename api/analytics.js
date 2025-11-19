// /api/analytics.js
export default async function handler(req, res) {
  try {
    // כאן תוכל להוסיף את לוגיקת האנליטיקה שלך
    res.status(200).json({ message: "Analytics API working" });
  } catch (err) {
    console.error("Analytics API error:", err);
    res.status(500).json({ error: err.message });
  }
}
