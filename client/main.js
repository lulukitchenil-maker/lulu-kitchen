// /client/main.js
async function fetchData() {
  try {
    const res = await fetch('/api/project-integration-supabase')
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    console.log("Supabase data:", data)
  } catch (err) {
    console.error("Client fetch error:", err)
  }
}

// הפעלת הפונקציה
fetchData()
