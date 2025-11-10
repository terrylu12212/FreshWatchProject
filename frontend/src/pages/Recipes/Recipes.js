import React, { useEffect, useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../../components/header'
import './Recipes.css'
import { Chip, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'

const API_BASE = 'http://localhost:4000'

// Lightweight Markdown -> HTML converter for readable full response
function mdToHtml(md = '') {
  let html = String(md)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (m, code) => `<pre><code>${code.trim()}</code></pre>`)
  // Headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
    .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
  // Emphasis
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
  // Links
  html = html.replace(/\[(.+?)\]\((https?:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  // Lists
  html = html.replace(/(?:^|\n)([-*] .+(?:\n[-*] .+)*)/g, (_m, block) => {
    const items = block.split('\n').map(l => l.replace(/^[-*]\s+/, '')).map(li => `<li>${li}</li>`).join('')
    return `\n<ul>${items}</ul>`
  })
  html = html.replace(/(?:^|\n)((?:\d+\. .+(?:\n\d+\. .+)*))/g, (_m, block) => {
    const items = block.split('\n').map(l => l.replace(/^\d+\.\s+/, '')).map(li => `<li>${li}</li>`).join('')
    return `\n<ol>${items}</ol>`
  })
  // Paragraphs
  html = html.replace(/\n{2,}/g, '</p><p>')
  html = `<p>${html}</p>`
  html = html
    .replace(/<p>(\s*<(?:h\d|ul|ol|pre)[^>]*>)/g, '$1')
    .replace(/(<\/ul>|<\/ol>|<\/pre>)\s*<\/p>/g, '$1')
  return html
}

export default function Recipes() {
  const [text, setText] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  // Structured form state
  const [mealType, setMealType] = useState('any')
  const [servings, setServings] = useState(2)
  // Always generate a single idea now (can be expanded later)
  const [complexity, setComplexity] = useState('any') // any | easy | medium | advanced
  const [maxTime, setMaxTime] = useState(30) // minutes
  const [dietary, setDietary] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
  })
  const [selectedItems, setSelectedItems] = useState([]) // array of item names
  const [allItemNames, setAllItemNames] = useState([]) // all pantry item names for dropdown
  const [showItemDropdown, setShowItemDropdown] = useState(false)

  // Build the AI prompt from current state
  const builtPrompt = useMemo(() => {
    const itemsList = selectedItems.length > 0
      ? `Use primarily these pantry items if possible: ${selectedItems.join(', ')}.`
      : 'Use common pantry ingredients available in most homes.'

    const prefs = Object.entries(dietary)
      .filter(([_, v]) => v)
      .map(([k]) => (
        k === 'glutenFree' ? 'gluten-free'
        : k === 'dairyFree' ? 'dairy-free'
        : k === 'nutFree' ? 'nut-free'
        : k
      ))
    const prefsText = prefs.length ? ` Dietary preferences to respect: ${prefs.join(', ')}.` : ''

  const timeText = maxTime > 0 ? ` Target maximum total cook time: ${maxTime} minutes.` : ''

  const complexityText = complexity && complexity !== 'any' ? ` Target difficulty: ${complexity}.` : ''

    // Final instruction structure for consistent formatting
  const structure = ` For each idea, provide: a short title, a concise ingredient list (mark which ones come from the provided items), and 3-5 clear steps. Keep instructions compact and easy to follow. Assume ${servings} servings.`

  const typeText = mealType === 'any' ? `Generate a meal idea for ${servings} people. ` : `Generate a ${mealType} meal idea for ${servings} people. `

    return (
      `You are a helpful cooking assistant. ` +
      typeText +
      itemsList +
      prefsText +
      timeText +
      complexityText +
      structure
    )
  }, [selectedItems, mealType, servings, dietary, complexity, maxTime])

  useEffect(() => {
    let mounted = true
    const navItems = location?.state?.items
    if (navItems && Array.isArray(navItems) && navItems.length > 0) {
      const names = navItems.map(i => i.name || i).filter(Boolean)
      if (mounted) setSelectedItems(names)
    } else {
      if (mounted) setSelectedItems([])
    }
    return () => { mounted = false }
  }, [location])

  // Fetch all pantry items to populate the dropdown checklist
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:4000/api/items', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        if (!res.ok) return
        const items = await res.json()
        const uniqueNames = Array.from(new Set(items.map(it => (it && it.name ? String(it.name) : '').trim()).filter(Boolean)))
        if (active) setAllItemNames(uniqueNames)
      } catch (e) {
        // silent fail; dropdown will just have no items
      }
    })()
    return () => { active = false }
  }, [])

  const toggleSelectedItem = (name) => {
    setSelectedItems(prev => prev.includes(name)
      ? prev.filter(n => n !== name)
      : [...prev, name]
    )
  }

  const removeSelectedItem = (name) => {
    setSelectedItems(prev => prev.filter(n => n !== name))
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setText(null)
    setError(null)
    setLoading(true)
    try {
      const url = `${API_BASE}/api/openAI?q=${encodeURIComponent(builtPrompt)}`
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

  // Compute if current generated text is already saved
  const alreadySaved = useMemo(() => {
    if (!text) return false
    try {
      const list = JSON.parse(localStorage.getItem('savedMeals') || '[]')
      return list.some(m => (m.raw || '') === text)
    } catch { return false }
  }, [text])

    

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 80,
        backgroundImage: "url('/images/plantBackground.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header />

      <div
        className="container"
        style={{
          marginBottom: 24,
          padding: '24px 24px 40px',
          background: 'rgba(0,0,0,0.45)',
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'saturate(120%) blur(8px)',
          WebkitBackdropFilter: 'saturate(120%) blur(8px)',
          color: '#fff'
        }}
      >
        <h1 style={{ fontSize: 42, margin: '20px 0 12px', textAlign: 'center' }}>Meal Ideas</h1>

        {/* Selected pantry items */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#86efac', marginBottom: 6 }}>Pantry items from selection</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedItems.length > 0 ? (
              selectedItems.map((name, idx) => (
                <Chip
                  key={`${name}-${idx}`}
                  label={name}
                  onDelete={() => removeSelectedItem(name)}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.25)',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              ))
            ) : (
              <span style={{
                padding: '6px 10px',
                background: 'rgba(255,255,255,0.12)',
                color: '#ddd',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600
              }}>No specific items provided</span>
            )}
          </div>

          {/* Dropdown checklist to add/remove items */}
          <div style={{ position: 'relative', marginTop: 12, display: 'inline-block' }}>
            <button
              type="button"
              className="input"
              onClick={() => setShowItemDropdown(s => !s)}
              style={{
                width: 320,
                height: 40,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                cursor: 'pointer',
                borderWidth: 2,
                borderColor: '#22c55e'
              }}
            >
              <span style={{ opacity: 0.9 }}>Add or remove items…</span>
              <span aria-hidden>▾</span>
            </button>
            {showItemDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 'auto',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.98)',
                color: '#111',
                borderRadius: 8,
                boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                border: '1px solid rgba(0,0,0,0.08)',
                zIndex: 10,
                maxHeight: 260,
                overflow: 'hidden'
              }}>
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {allItemNames.length === 0 && (
                    <div style={{ padding: '12px 14px', color: '#666' }}>No items found</div>
                  )}
                  {allItemNames.map(name => (
                    <label key={name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                      cursor: 'pointer'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(name)}
                        onChange={() => toggleSelectedItem(name)}
                        style={{ width: 18, height: 18, accentColor: '#22c55e', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 14 }}>{name}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '8px 10px', background: 'rgba(0,0,0,0.03)' }}>
                  <button
                    type="button"
                    onClick={() => setShowItemDropdown(false)}
                    className="btn"
                    style={{ padding: '8px 14px', fontSize: 14 }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form controls (plain elements) */}
        <form onSubmit={handleGenerate} style={{ marginTop: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#86efac' }}>Meal Type</label>
              <select className="input" value={mealType} onChange={(e)=>setMealType(e.target.value)} style={{ width:'100%', height: 44 }}>
                <option value="any">Any</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#86efac' }}>Servings</label>
              <input type="number" className="input" min="1" max="12" value={servings} onChange={(e)=>setServings(Math.max(1, parseInt(e.target.value)||1))} style={{ width:'100%' }} />
            </div>
            {/* Removed number of ideas input – fixed at 1 */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#86efac' }}>Difficulty</label>
              <select className="input" value={complexity} onChange={(e)=>setComplexity(e.target.value)} style={{ width:'100%', height: 44 }}>
                <option value="any">Any</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#86efac' }}>Max Time (min)</label>
              <input type="number" className="input" min="0" step="5" value={maxTime} onChange={(e)=>setMaxTime(Math.max(0, parseInt(e.target.value)||0))} style={{ width:'100%' }} />
            </div>
            
          </div>

          {/* Dietary preferences */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#86efac', marginBottom: 10 }}>Dietary Preferences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              {[
                ['vegetarian','Vegetarian'],
                ['vegan','Vegan'],
                ['glutenFree','Gluten-free'],
                ['dairyFree','Dairy-free'],
                ['nutFree','Nut-free']
              ].map(([key,label]) => (
                <label key={key} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:500, color:'#fff' }}>
                  <input
                    type="checkbox"
                    checked={dietary[key]}
                    onChange={(e)=>setDietary(p=>({...p, [key]: e.target.checked}))}
                    style={{ width:18, height:18, accentColor:'#22c55e', cursor:'pointer' }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 30, display:'flex', justifyContent:'center' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.25,
                px: 3.5,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: 'none',
                '&.Mui-disabled': { background: 'rgba(102,102,102,0.8)' }
              }}
            >
              {loading ? (
                <span style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
                  <CircularProgress size={18} sx={{ color: '#fff' }} />
                  Generating…
                </span>
              ) : (
                'Generate Recipes'
              )}
            </Button>
          </div>
        </form>

        {error && <p style={{ color: '#ff6b6b', textAlign: 'center' }}>Error: {error}</p>}
        {text && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
              <h2 style={{ fontSize:28, margin:0, fontWeight:600 }}>Generated Meal Idea</h2>
            </div>
            <div className="ai-output" style={{ 
              marginTop: 12, 
              padding: 20, 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ color:'#fff', fontSize:15, lineHeight:1.7 }}
                   dangerouslySetInnerHTML={{ __html: mdToHtml(text) }} />
            </div>
            <div style={{ marginTop: 12, display:'flex', justifyContent:'center' }}>
              <Button
                variant="outlined"
                disabled={alreadySaved}
                onClick={() => {
                  if (alreadySaved) return
                  const parsed = parseMealIdea(text) || { title: 'Meal Idea', raw: text }
                  handleSaveIdea(parsed)
                }}
                sx={{ borderColor:'#22c55e', color:'#22c55e', textTransform:'none', fontWeight:600 }}
              >
                {alreadySaved ? 'Saved' : 'Save this meal'}
              </Button>
            </div>
          </div>
        )}
        <SavedMealsSection />
      </div>
    </div>
  )
}

// Parse the generated markdown/plain text into a structured object (very simple heuristic)
function parseMealIdea(raw="") {
  const lines = raw.split(/\n+/).map(l=>l.trim()).filter(Boolean)
  if (!lines.length) return null
  // Title: first non-empty line
  const title = lines[0].replace(/^#+\s*/, '')
  // Ingredients: find first block starting with 'Ingredients'
  let ingredients = []
  let steps = []
  let mode = null
  for (const l of lines.slice(1)) {
    const lower = l.toLowerCase()
    if (lower.startsWith('ingredients')) { mode='ingredients'; continue }
    if (lower.startsWith('steps') || lower.startsWith('instructions')) { mode='steps'; continue }
    if (mode === 'ingredients') {
      if (/^[-*]/.test(l)) ingredients.push(l.replace(/^[-*]\s*/, ''))
      else if (/^\d+\./.test(l)) { mode='steps'; steps.push(l.replace(/^\d+\.\s*/, '')) } // switch if numbered starts
    } else if (mode === 'steps') {
      if (/^\d+\./.test(l)) steps.push(l.replace(/^\d+\.\s*/, ''))
      else if (/^[-*]/.test(l)) steps.push(l.replace(/^[-*]\s*/, ''))
    }
  }
  return { title, ingredients, steps, raw }
}

// removed unused MealIdeaCards component

// Saved meal ideas (local-only for now)
function SavedMealsSection() {
  const [saved, setSaved] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('savedMeals')||'[]') } catch { return [] }
  })
  const [open, setOpen] = useState(false)
  const [viewing, setViewing] = useState(null)

  useEffect(()=>{
    localStorage.setItem('savedMeals', JSON.stringify(saved))
  }, [saved])

  const remove = (idx) => setSaved(s => s.filter((_,i)=>i!==idx))

  const addIdeaUnique = (idea) => {
    if (!idea) return
    setSaved(s => {
      const exists = s.some(x => (x.raw || '') === (idea.raw || ''))
      return exists ? s : [...s, { ...idea, savedAt: Date.now() }]
    })
  }

  // Expose save function via window for parent call
  useEffect(()=>{
    window.__saveMealIdea = (idea) => addIdeaUnique(idea)
  }, [])

  if (!saved.length) return <div style={{ marginTop:40 }}><h2 style={{ fontSize:26, margin:'0 0 12px' }}>Saved Meal Ideas</h2><p style={{ opacity:0.7 }}>No saved meals yet.</p></div>

  return (
    <div style={{ marginTop:40 }}>
      <h2 style={{ fontSize:26, margin:'0 0 18px' }}>Saved Meal Ideas</h2>
      <div style={{ display:'grid', gap:18, gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))' }}>
        {saved.map((m,idx)=>(
          <div key={idx} className="card" style={{
              padding:16,
              background:'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.04) 100%)',
              border:'1px solid rgba(255,255,255,0.16)',
              borderRadius:16,
              display:'flex', flexDirection:'column',
              transition:'transform 120ms ease, box-shadow 120ms ease',
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 24px rgba(0,0,0,0.18)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'}}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
              <div style={{ fontWeight:700, fontSize:18, lineHeight:1.25, flex:1, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{m.title}</div>
              <button onClick={()=>remove(idx)} title="Delete"
                style={{ background:'transparent', border:'none', color:'#ff8c8c', cursor:'pointer', fontWeight:800, fontSize:18, lineHeight:1 }}>×</button>
            </div>
            <div style={{ marginTop:10, display:'flex', gap:10 }}>
              <Button size="small" variant="outlined" onClick={()=>{ setViewing(m); setOpen(true) }}
                sx={{ borderColor:'rgba(255,255,255,0.35)', color:'#fff', textTransform:'none', fontWeight:600 }}>
                View
              </Button>
            </div>
            <div style={{ marginTop:'auto', fontSize:12, opacity:0.6 }}>Saved {new Date(m.savedAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{viewing?.title || 'Meal Idea'}</DialogTitle>
        <DialogContent dividers>
          <div
            style={{ fontSize:14, lineHeight:1.7 }}
            dangerouslySetInnerHTML={{ __html: mdToHtml(viewing?.raw || '') }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

function handleSaveIdea(idea) {
  if (!idea) return
  try {
    const current = JSON.parse(localStorage.getItem('savedMeals')||'[]')
    const exists = current.some(x => (x.raw || '') === (idea.raw || ''))
    if (exists) return
    current.push({ ...idea, savedAt: Date.now() })
    localStorage.setItem('savedMeals', JSON.stringify(current))
    // trigger refresh if section mounted
    if (window.__saveMealIdea) window.__saveMealIdea(idea)
  } catch {}
}
