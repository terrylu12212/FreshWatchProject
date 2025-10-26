import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './Recipes.css'

const API_BASE = 'http://localhost:4000'

export default function Recipes() {
  const [text, setText] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('Give me a simple recipe using common pantry ingredients.')
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    async function fetchAI(q) {
      setLoading(true)
      setError(null)
      try {
        const url = q ? `${API_BASE}/api/openAI?q=${encodeURIComponent(q)}` : `${API_BASE}/api/openAI`
        const res = await fetch(url)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
        if (mounted) setText(data.text)
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // If navigation state contains items, use them to build the prompt
    const navItems = location?.state?.items
    if (navItems && Array.isArray(navItems) && navItems.length > 0) {
      const names = navItems.map(i => i.name || i).filter(Boolean)
      const itemsList = names.join(', ')
      const built = `You are a helpful cooking assistant. Given the following pantry items: ${itemsList}. Suggest 4 easy meal ideas that primarily use these ingredients. For each idea, provide a short ingredient list and 3-5 concise steps. Keep servings for 2 people.`
      setPrompt(built)
      fetchAI(built)
    } else {
      // No items passed, fetch default recipe
      fetchAI()
    }

    return () => { mounted = false }
  }, [location])

  async function handleSubmit(e) {
    e.preventDefault()
    setText(null)
    setError(null)
    setLoading(true)
    try {
      const url = `${API_BASE}/api/openAI?q=${encodeURIComponent(prompt)}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setText(data.text)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="recipes-page">
      <h1>Recipes (OpenAI)</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 18 }}>
        <label htmlFor="prompt">Prompt</label>
        <textarea id="prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} rows={3} style={{ width: '100%', marginTop: 6 }} />
        <div style={{ marginTop: 8 }}>
          <button type="submit">Send</button>
        </div>
      </form>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {text && <div className="ai-output"><pre>{text}</pre></div>}
    </div>
  )
}
