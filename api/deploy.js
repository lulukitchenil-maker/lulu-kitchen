// /api/deploy.js
export default async function handler(req, res) {
  try {
    // כאן ייכנס הלוגיקת הפריסה שלך
    res.status(200).json({ message: "Deploy API working" });
  } catch (err) {
    console.error("Deploy API error:", err);
    res.status(500).json({ error: err.message });
  }
}
