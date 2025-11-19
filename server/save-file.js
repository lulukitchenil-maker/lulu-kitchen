// /server/save-file.js
import { writeFileSync } from 'fs'

export default function handler(req, res) {
  try {
    // דוגמה לשמירת קובץ בצד השרת
    writeFileSync('file.txt', 'some content')
    res.status(200).json({ success: true })
  } catch (err) {
    console.error("Server save-file error:", err)
    res.status(500).json({ error: err.message })
  }
}
