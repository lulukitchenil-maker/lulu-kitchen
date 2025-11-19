// /api/project-integration-supabase.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from('my_table').select('*')
    if (error) throw error
    res.status(200).json({ data })
  } catch (err) {
    console.error("Supabase API error:", err)
    res.status(500).json({ error: err.message })
  }
}
