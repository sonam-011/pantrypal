import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const GEMINI_KEY = 'AIzaSyD3OKsYeTOY0SylG4C5ud75JSIDdOxflEQ'
const SPOONACULAR_KEY = '72550ef469b74aa086124bd3354d77c9'

const STYLES = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { height: 100%; }
  body { font-family: 'DM Sans', system-ui, sans-serif !important; background: var(--bg-tertiary); margin: 0; padding: 0; overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
  :root {
    --bg-primary:    ${dark ? '#1a1f2e' : '#f0f6ff'};
    --bg-secondary:  ${dark ? '#222840' : '#dceeff'};
    --bg-tertiary:   ${dark ? '#161b2c' : '#c9e4ff'};
    --bg-card:       ${dark ? '#1e2538' : '#ffffff'};
    --text-primary:  ${dark ? '#e8eeff' : '#0d1b2e'};
    --text-secondary:${dark ? '#8899bb' : '#4a6080'};
    --border:        ${dark ? 'rgba(100,140,220,0.15)' : 'rgba(30,90,180,0.13)'};
    --border-hover:  ${dark ? 'rgba(100,140,220,0.35)' : 'rgba(30,90,180,0.3)'};
    --blue:          #4a90d9;
    --blue-light:    ${dark ? '#162340' : '#dceeff'};
    --blue-mid:      #5ba3e8;
    --blue-dark:     #2d6db5;
    --green:         #2e7d52;
    --green-light:   ${dark ? '#0e2a1a' : '#e0f5ea'};
    --green-mid:     #3da368;
    --amber:         #b07a10;
    --amber-light:   ${dark ? '#2a1e05' : '#fff3d4'};
    --amber-mid:     #e09b20;
    --red:           #b03030;
    --red-light:     ${dark ? '#2a0e0e' : '#fde8e8'};
    --teal:          #0e7490;
    --teal-light:    ${dark ? '#062830' : '#d4f5fc'};
    --radius-md: 8px;
    --radius-lg: 14px;
  }
  .pp-wrap { max-width: 920px; margin: 0 auto; padding: 1.5rem 1rem 4rem; font-family: 'DM Sans', system-ui, sans-serif; color: var(--text-primary); min-height: 100dvh; background: var(--bg-tertiary); }
  .pp-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1.75rem; }
  .pp-logo { font-size: 22px; font-weight: 600; letter-spacing: -0.4px; }
  .pp-logo span { color: var(--blue-mid); }
  .pp-header-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
  .pp-email { font-size: 12px; color: var(--text-secondary); background: var(--bg-secondary); padding: 4px 10px; border-radius: 20px; border: 0.5px solid var(--border); font-family: 'DM Mono', monospace; }
  .pp-icon-btn { font-size: 15px; padding: 5px 10px; border-radius: 20px; border: 0.5px solid var(--border); background: var(--bg-secondary); cursor: pointer; transition: all 0.13s; color: var(--text-primary); font-family: 'DM Sans', sans-serif; }
  .pp-icon-btn:hover { border-color: var(--border-hover); background: var(--bg-card); }
  .pp-logout { font-size: 12px; padding: 4px 12px; border-radius: 20px; border: 0.5px solid var(--border); background: transparent; color: var(--red); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.12s; }
  .pp-logout:hover { background: var(--red-light); border-color: var(--red); }
  .pp-alert { display: flex; justify-content: space-between; align-items: flex-start; background: var(--amber-light); border: 0.5px solid var(--amber-mid); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 1.25rem; font-size: 13px; color: var(--amber); }
  .pp-alert-close { background: none; border: none; cursor: pointer; color: var(--amber); font-size: 14px; }
  .pp-tabs { display: flex; gap: 4px; background: var(--bg-secondary); padding: 4px; border-radius: var(--radius-md); margin-bottom: 1.5rem; border: 0.5px solid var(--border); overflow-x: auto; scrollbar-width: none; }
  .pp-tabs::-webkit-scrollbar { display: none; }
  .pp-tab { flex: 1; min-width: 72px; padding: 8px 6px; border: none; background: transparent; cursor: pointer; font-size: 12px; border-radius: 6px; color: var(--text-secondary); font-family: 'DM Sans', sans-serif; transition: all 0.13s; white-space: nowrap; }
  .pp-tab:hover { color: var(--text-primary); }
  .pp-tab.active { background: var(--bg-card); color: var(--blue-mid); font-weight: 600; border: 0.5px solid var(--border); }
  .pp-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 1.25rem; }
  .pp-stat { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: var(--radius-md); padding: 12px; text-align: center; }
  .pp-stat-num { font-size: 22px; font-weight: 600; }
  .pp-stat-lbl { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
  .pp-filters { display: flex; gap: 6px; margin-bottom: 1rem; flex-wrap: wrap; }
  .pp-filter { font-size: 12px; padding: 5px 12px; border-radius: 20px; border: 0.5px solid var(--border); background: transparent; cursor: pointer; color: var(--text-secondary); font-family: 'DM Sans', sans-serif; transition: all 0.12s; }
  .pp-filter:hover { border-color: var(--border-hover); color: var(--text-primary); }
  .pp-filter.active { background: var(--blue-light); color: var(--blue-dark); border-color: var(--blue-mid); font-weight: 500; }
  .pp-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(200px,1fr)); gap: 10px; }
  .pp-card { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: var(--radius-lg); padding: 1rem; transition: border-color 0.15s; }
  .pp-card:hover { border-color: var(--border-hover); }
  .pp-card.expired { border-color: var(--red); background: var(--red-light); }
  .pp-card.expiring { border-color: var(--amber-mid); background: var(--amber-light); }
  .pp-card-icon { font-size: 22px; margin-bottom: 6px; }
  .pp-card-name { font-weight: 500; font-size: 15px; margin-bottom: 3px; }
  .pp-card-meta { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
  .pp-badge { display: inline-block; font-size: 11px; padding: 2px 9px; border-radius: 20px; font-weight: 500; }
  .pp-badge.fresh { background: var(--green-light); color: var(--green); }
  .pp-badge.expiring { background: var(--amber-light); color: var(--amber); }
  .pp-badge.expired { background: var(--red-light); color: var(--red); }
  .pp-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
  .pp-expiry-lbl { font-size: 11px; color: var(--text-secondary); }
  .pp-del { font-size: 11px; color: var(--red); background: none; border: none; cursor: pointer; padding: 2px 6px; border-radius: 4px; font-family: 'DM Sans', sans-serif; transition: background 0.1s; }
  .pp-del:hover { background: var(--red-light); }
  .pp-empty { grid-column: 1/-1; text-align: center; padding: 2.5rem; color: var(--text-secondary); font-size: 14px; background: var(--bg-card); border: 0.5px dashed var(--border); border-radius: var(--radius-lg); }
  .pp-box { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.25rem; }
  .pp-box-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .pp-box-sub { font-size: 13px; color: var(--text-secondary); margin-bottom: 1rem; }
  .pp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .pp-form-row.three { grid-template-columns: 2fr 1fr 1fr; }
  .pp-field { display: flex; flex-direction: column; gap: 4px; }
  .pp-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
  .pp-input { width: 100%; padding: 8px 10px; border: 0.5px solid var(--border); border-radius: var(--radius-md); font-size: 14px; background: var(--bg-secondary); color: var(--text-primary); font-family: 'DM Sans', sans-serif; transition: border-color 0.12s; outline: none; }
  .pp-input:focus { border-color: var(--blue-mid); }
  .pp-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  .pp-btn { padding: 8px 16px; border-radius: var(--radius-md); font-size: 13px; cursor: pointer; border: 0.5px solid var(--border); background: var(--bg-card); color: var(--text-primary); font-family: 'DM Sans', sans-serif; transition: all 0.13s; }
  .pp-btn:hover { background: var(--bg-secondary); border-color: var(--border-hover); }
  .pp-btn.primary { background: var(--blue-mid); color: #fff; border-color: var(--blue-dark); }
  .pp-btn.primary:hover { background: var(--blue-dark); }
  .pp-btn.full { width: 100%; }
  .pp-btn:disabled { opacity: 0.5; cursor: default; }
  .pp-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .pp-chip { font-size: 12px; padding: 5px 12px; border-radius: 20px; border: 0.5px solid var(--border); background: var(--bg-secondary); cursor: pointer; color: var(--text-secondary); font-family: 'DM Sans', sans-serif; transition: all 0.12s; }
  .pp-chip:hover { background: var(--blue-light); color: var(--blue-dark); border-color: var(--blue-mid); }
  .pp-chip.ingr { background: var(--blue-light); color: var(--blue-dark); border-color: transparent; }
  .pp-nutrition { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin: 10px 0; background: var(--bg-secondary); border-radius: var(--radius-md); padding: 10px; border: 0.5px solid var(--border); }
  .pp-nutr-item { text-align: center; }
  .pp-nutr-val { font-size: 15px; font-weight: 600; color: var(--blue-mid); }
  .pp-nutr-lbl { font-size: 10px; color: var(--text-secondary); margin-top: 2px; }
  .pp-chat { margin-bottom: 1rem; }
  .pp-msg { display: flex; margin-bottom: 10px; }
  .pp-msg.user { justify-content: flex-end; }
  .pp-bubble { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.65; white-space: pre-wrap; }
  .pp-bubble.user { background: var(--blue-mid); color: #fff; border-radius: 14px 14px 4px 14px; }
  .pp-bubble.ai { background: var(--bg-secondary); color: var(--text-primary); border: 0.5px solid var(--border); border-radius: 14px 14px 14px 4px; }
  .pp-save-recipe { font-size: 11px; padding: 3px 10px; border-radius: 20px; border: 0.5px solid var(--blue-mid); background: var(--blue-light); color: var(--blue-dark); cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 5px; margin-left: 4px; }
  .pp-chat-empty { text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 13px; }
  .pp-typing { display: flex; gap: 4px; padding: 12px 14px; background: var(--bg-secondary); border: 0.5px solid var(--border); border-radius: 14px 14px 14px 4px; width: fit-content; margin-bottom: 10px; }
  .pp-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue-mid); animation: ppbounce 1s infinite; }
  .pp-dot:nth-child(2) { animation-delay: 0.2s; }
  .pp-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes ppbounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  .pp-input-row { display: flex; gap: 8px; position: sticky; bottom: 0; background: var(--bg-tertiary); padding-top: 8px; padding-bottom: 8px; }
  .pp-recipe-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(190px,1fr)); gap: 10px; margin-top: 12px; }
  .pp-recipe-card { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; transition: border-color 0.15s; }
  .pp-recipe-card:hover { border-color: var(--blue-mid); }
  .pp-recipe-img { width: 100%; height: 110px; object-fit: cover; display: block; }
  .pp-recipe-info { padding: 8px 10px; }
  .pp-recipe-name { font-size: 12px; font-weight: 500; line-height: 1.4; margin-bottom: 4px; }
  .pp-recipe-meta { font-size: 11px; color: var(--text-secondary); }
  .pp-recipe-matched { font-size: 11px; color: var(--green-mid); }
  .pp-detail-back { display: block; width: 100%; padding: 9px 14px; text-align: left; font-size: 13px; background: var(--bg-secondary); border: none; border-bottom: 0.5px solid var(--border); cursor: pointer; color: var(--text-secondary); font-family: 'DM Sans', sans-serif; }
  .pp-detail-img { width: 100%; height: 200px; object-fit: cover; display: block; }
  .pp-detail-body { padding: 1rem; }
  .pp-detail-title { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
  .pp-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
  .pp-pill { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: var(--bg-secondary); color: var(--text-secondary); border: 0.5px solid var(--border); }
  .pp-pill.blue { background: var(--blue-light); color: var(--blue-dark); }
  .pp-pill.green { background: var(--green-light); color: var(--green); }
  .pp-ingr-list { font-size: 13px; color: var(--text-secondary); padding-left: 18px; line-height: 1.9; margin-bottom: 12px; }
  .pp-shop-item { display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 0.5px solid var(--border); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 8px; }
  .pp-shop-cb { accent-color: var(--blue-mid); width: 16px; height: 16px; cursor: pointer; }
  .pp-shop-text { flex: 1; font-size: 14px; }
  .pp-shop-text.done { text-decoration: line-through; color: var(--text-secondary); }
  .pp-cookbook-card { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 10px; }
  .pp-cookbook-title { font-size: 14px; font-weight: 500; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
  .pp-cookbook-content { font-size: 12px; color: var(--text-secondary); line-height: 1.65; white-space: pre-wrap; max-height: 160px; overflow: auto; background: var(--bg-secondary); border-radius: var(--radius-md); padding: 10px; border: 0.5px solid var(--border); }
  .pp-cookbook-date { font-size: 11px; color: var(--text-secondary); margin-top: 8px; font-family: 'DM Mono', monospace; }
  .pp-toast { background: var(--blue-light); border: 0.5px solid var(--blue-mid); color: var(--blue-dark); border-radius: var(--radius-md); padding: 9px 14px; font-size: 13px; font-weight: 500; margin-bottom: 12px; }
  .pp-section-lbl { font-size: 12px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; }
  .pp-auth-wrap { min-height: 100dvh; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); font-family: 'DM Sans', sans-serif; color: var(--text-primary); padding: 1rem; }
  .pp-auth-box { width: 100%; max-width: 380px; }
  .pp-auth-logo { text-align: center; margin-bottom: 2rem; }
  .pp-auth-logo-icon { font-size: 48px; display: block; margin-bottom: 8px; }
  .pp-auth-logo-name { font-size: 24px; font-weight: 600; letter-spacing: -0.5px; }
  .pp-auth-logo-name span { color: var(--blue-mid); }
  .pp-auth-logo-sub { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
  .pp-auth-card { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; }
  .pp-auth-title { font-size: 18px; font-weight: 500; margin-bottom: 1.25rem; }
  .pp-auth-error { background: var(--red-light); border: 0.5px solid var(--red); color: var(--red); border-radius: var(--radius-md); padding: 9px 12px; font-size: 13px; margin-bottom: 12px; }
  .pp-auth-success { background: var(--green-light); border: 0.5px solid var(--green-mid); color: var(--green); border-radius: var(--radius-md); padding: 9px 12px; font-size: 13px; margin-bottom: 12px; }
  .pp-auth-switch { text-align: center; margin-top: 12px; font-size: 13px; color: var(--text-secondary); }
  .pp-auth-switch button { background: none; border: none; color: var(--blue-mid); cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; text-decoration: underline; }
  .pp-loading { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-tertiary); font-family: 'DM Sans', sans-serif; color: var(--text-secondary); font-size: 14px; gap: 12px; }

  @media (max-width: 600px) {
    .pp-wrap { padding: 0.75rem 0.75rem 5rem; }
    .pp-header { margin-bottom: 1rem; }
    .pp-logo { font-size: 18px; }
    .pp-email { display: none; }
    .pp-tabs { gap: 2px; padding: 3px; }
    .pp-tab { font-size: 10px; padding: 7px 3px; min-width: 44px; }
    .pp-stats { grid-template-columns: repeat(2,1fr); gap: 6px; }
    .pp-stat-num { font-size: 18px; }
    .pp-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .pp-card { padding: 0.75rem; }
    .pp-form-row { grid-template-columns: 1fr; }
    .pp-form-row.three { grid-template-columns: 1fr; }
    .pp-box { padding: 0.875rem; }
    .pp-recipe-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .pp-nutrition { grid-template-columns: repeat(2,1fr); }
    .pp-input-row { padding-bottom: 1rem; }
    .pp-bubble { max-width: 92%; font-size: 12px; }
    .pp-detail-img { height: 160px; }
  }

  @media (min-width: 601px) and (max-width: 900px) {
    .pp-grid { grid-template-columns: repeat(3,1fr); }
    .pp-stats { grid-template-columns: repeat(4,1fr); }
  }
`

// ── AI (Gemini) ──────────────────────────────────────────────
async function askAI(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  )
  const data = await res.json()
  if (!data.candidates) throw new Error('Gemini error: ' + JSON.stringify(data))
  return data.candidates[0].content.parts[0].text
}

// ── Spoonacular ──────────────────────────────────────────────
async function searchSpoonacular(ingredients) {
  const res = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=6&ranking=1&apiKey=${SPOONACULAR_KEY}`)
  return await res.json()
}
async function getRecipeDetails(id) {
  const res = await fetch(`https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${SPOONACULAR_KEY}`)
  return await res.json()
}
async function searchRecipesByName(query) {
  const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=6&addRecipeInformation=true&addRecipeNutrition=true&apiKey=${SPOONACULAR_KEY}`)
  const data = await res.json()
  return data.results || []
}

// ── Helpers ──────────────────────────────────────────────────
function getNutrient(nutrients, name) {
  const n = nutrients?.find(x => x.name === name)
  return n ? `${Math.round(n.amount)}${n.unit}` : '—'
}
function getStatus(expiry) {
  if (!expiry) return 'fresh'
  const days = Math.ceil((new Date(expiry) - new Date()) / (1000*60*60*24))
  if (days < 0) return 'expired'
  if (days <= 3) return 'expiring'
  return 'fresh'
}
function daysLabel(expiry) {
  if (!expiry) return 'No expiry set'
  const days = Math.ceil((new Date(expiry) - new Date()) / (1000*60*60*24))
  if (days < 0) return `Expired ${Math.abs(days)}d ago`
  if (days === 0) return 'Expires today!'
  if (days === 1) return 'Expires tomorrow'
  return `Expires in ${days} days`
}
function catIcon(cat) {
  if (!cat) return '📦'
  const c = cat.toLowerCase()
  if (c.includes('vegetable')) return '🥦'
  if (c.includes('fruit')) return '🍎'
  if (c.includes('meat') || c.includes('fish')) return '🥩'
  if (c.includes('dairy')) return '🧀'
  if (c.includes('grain')) return '🌾'
  if (c.includes('spice')) return '🫙'
  if (c.includes('canned')) return '🥫'
  if (c.includes('frozen')) return '🧊'
  if (c.includes('condiment')) return '🧴'
  return '📦'
}
const QUICK_ITEMS = ['Garlic','Ginger','Potato','Spinach','Eggs','Butter','Flour','Cumin','Oil','Lemon','Onion','Salt','Sugar']

// ── Nutrition Box ────────────────────────────────────────────
function NutritionBox({ nutrients }) {
  if (!nutrients) return null
  return (
    <div className="pp-nutrition">
      {[{label:'Calories',key:'Calories'},{label:'Protein',key:'Protein'},{label:'Carbs',key:'Carbohydrates'},{label:'Fat',key:'Fat'}].map(n => (
        <div key={n.label} className="pp-nutr-item">
          <div className="pp-nutr-val">{getNutrient(nutrients, n.key)}</div>
          <div className="pp-nutr-lbl">{n.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Auth Screen ──────────────────────────────────────────────
function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!email || !password) { setError('Please enter email and password'); return }
    setLoading(true); setError(''); setMessage('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('✅ Account created! Check your email to confirm, then log in.')
    }
    setLoading(false)
  }

  return (
    <div className="pp-auth-wrap">
      <div className="pp-auth-box">
        <div className="pp-auth-logo">
          <span className="pp-auth-logo-icon">🥦</span>
          <div className="pp-auth-logo-name">Pantry<span>Pal</span></div>
          <div className="pp-auth-logo-sub">Your smart kitchen assistant</div>
        </div>
        <div className="pp-auth-card">
          <div className="pp-auth-title">{isLogin ? '👋 Welcome back' : '🎉 Create account'}</div>
          {error && <div className="pp-auth-error">❌ {error}</div>}
          {message && <div className="pp-auth-success">{message}</div>}
          <div className="pp-field" style={{marginBottom:'10px'}}>
            <label className="pp-label">Email</label>
            <input className="pp-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
          </div>
          <div className="pp-field" style={{marginBottom:'16px'}}>
            <label className="pp-label">Password</label>
            <input className="pp-input" type="password" placeholder="Min 6 characters" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
          </div>
          <button className="pp-btn primary full" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Please wait…' : isLogin ? '🔐 Log In' : '🚀 Create Account'}
          </button>
          <div className="pp-auth-switch">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={()=>{setIsLogin(!isLogin);setError('');setMessage('')}}>{isLogin?'Sign up':'Log in'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────
function MainApp({ user, dark, setDark }) {
  const [items, setItems] = useState([])
  const [activeTab, setActiveTab] = useState('pantry')
  const [filter, setFilter] = useState('all')
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [category, setCategory] = useState('Vegetables')
  const [expiry, setExpiry] = useState('')
  const [notes, setNotes] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [spoonRecipes, setSpoonRecipes] = useState([])
  const [loadingSpoon, setLoadingSpoon] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [spoonMode, setSpoonMode] = useState('pantry')
  const [savedRecipes, setSavedRecipes] = useState([])
  const [shopItems, setShopItems] = useState(()=>{try{return JSON.parse(localStorage.getItem('pp_shop'))||[]}catch{return[]}})
  const [shopInput, setShopInput] = useState('')
  const [showBanner, setShowBanner] = useState(true)

  useEffect(()=>{fetchItems();fetchRecipes()},[])
  useEffect(()=>{localStorage.setItem('pp_shop',JSON.stringify(shopItems))},[shopItems])

  async function fetchItems(){const{data}=await supabase.from('pantry_items').select('*').eq('user_id',user.id);setItems(data||[])}
  async function fetchRecipes(){const{data}=await supabase.from('recipes').select('*').eq('user_id',user.id).order('created_at',{ascending:false});setSavedRecipes(data||[])}

  async function addItem(){
    if(!name.trim())return
    await supabase.from('pantry_items').insert([{name,quantity:qty,category,expiry_date:expiry,notes,user_id:user.id}])
    setName('');setQty('');setExpiry('');setNotes('');fetchItems();setActiveTab('pantry')
  }
  async function deleteItem(id){await supabase.from('pantry_items').delete().eq('id',id);fetchItems()}
  async function deleteRecipe(id){await supabase.from('recipes').delete().eq('id',id);fetchRecipes()}

  async function saveRecipe(text,nutrition){
    const title=text.split('\n')[0].replace(/[#*🍛🍜🍝🍲]/g,'').trim()||'AI Recipe'
    const nutrNote=nutrition?`\n\n📊 Nutrition per serving:\nCalories: ${nutrition.calories} | Protein: ${nutrition.protein} | Carbs: ${nutrition.carbs} | Fat: ${nutrition.fat}`:''
    await supabase.from('recipes').insert([{title:title.slice(0,80),content:text+nutrNote,user_id:user.id}])
    setSaveSuccess(true);setTimeout(()=>setSaveSuccess(false),3000);fetchRecipes()
  }

  async function saveSpoonRecipe(recipe){
    const nutr=recipe.nutrition?.nutrients
    const nutrNote=nutr?`\n\n📊 Nutrition per serving:\nCalories: ${getNutrient(nutr,'Calories')} | Protein: ${getNutrient(nutr,'Protein')} | Carbs: ${getNutrient(nutr,'Carbohydrates')} | Fat: ${getNutrient(nutr,'Fat')}`:''
    const content=`🍽️ ${recipe.title}\n⏱ Ready in: ${recipe.readyInMinutes||'?'} mins\n👥 Servings: ${recipe.servings||'?'}\n🔗 Source: ${recipe.sourceUrl||''}${nutrNote}`
    await supabase.from('recipes').insert([{title:recipe.title,content,user_id:user.id}])
    setSaveSuccess(true);setTimeout(()=>setSaveSuccess(false),3000);fetchRecipes()
  }

  async function handleAIPrompt(){
    if(!userPrompt.trim())return
    setLoadingAI(true)
    const pantryList=items.length>0?`My pantry has: ${items.map(i=>i.name).join(', ')}.`:''
    const fullPrompt=`You are a smart kitchen assistant called Pantry Pal.\n${pantryList}\nUser says: "${userPrompt}"\nGive a helpful, friendly response. If they ask for a recipe provide:\n- Recipe name with emoji\n- Cooking time and difficulty\n- Ingredients list\n- Step by step instructions\n- Estimated nutrition per serving in this exact format on its own line: NUTRITION: calories=XXX protein=XXXg carbs=XXXg fat=XXXg\n- A tip at the end`
    try {
      const response=await askAI(fullPrompt)
      const nutrMatch=response.match(/NUTRITION:\s*calories=(\d+)\s*protein=([\d.]+g?)\s*carbs=([\d.]+g?)\s*fat=([\d.]+g?)/i)
      let nutrition=null
      let cleanResponse=response
      if(nutrMatch){
        nutrition={calories:nutrMatch[1],protein:nutrMatch[2],carbs:nutrMatch[3],fat:nutrMatch[4]}
        cleanResponse=response.replace(/NUTRITION:.*$/m,'').trim()
      }
      setChatHistory(prev=>[...prev,{role:'user',text:userPrompt},{role:'ai',text:cleanResponse,nutrition}])
      setUserPrompt('')
    } catch(err) {
      setChatHistory(prev=>[...prev,{role:'user',text:userPrompt},{role:'ai',text:'❌ Something went wrong. Check your Gemini API key.'}])
    }
    setLoadingAI(false)
  }

  async function searchFromPantry(){if(!items.length){alert('Add pantry items first!');return}setLoadingSpoon(true);setSelectedRecipe(null);const data=await searchSpoonacular(items.map(i=>i.name).join(','));setSpoonRecipes(data);setLoadingSpoon(false)}
  async function searchByName(){if(!searchQuery.trim())return;setLoadingSpoon(true);setSelectedRecipe(null);const data=await searchRecipesByName(searchQuery);setSpoonRecipes(data);setLoadingSpoon(false)}
  async function openRecipeDetails(id){setLoadingDetails(true);setSelectedRecipe(null);const data=await getRecipeDetails(id);setSelectedRecipe(data);setLoadingDetails(false)}

  function addShopItem(){if(!shopInput.trim())return;setShopItems([...shopItems,{id:Date.now(),text:shopInput,checked:false}]);setShopInput('')}
  function toggleShopItem(id){setShopItems(shopItems.map(i=>i.id===id?{...i,checked:!i.checked}:i))}
  function deleteShopItem(id){setShopItems(shopItems.filter(i=>i.id!==id))}
  function addExpiringToShop(){const exp=items.filter(i=>getStatus(i.expiry_date)==='expiring');setShopItems([...shopItems,...exp.map(i=>({id:Date.now()+Math.random(),text:i.name,checked:false}))])}

  const total=items.length
  const expired=items.filter(i=>getStatus(i.expiry_date)==='expired').length
  const expiring=items.filter(i=>getStatus(i.expiry_date)==='expiring').length
  const fresh=total-expired-expiring
  const categoryCounts=items.reduce((acc,i)=>{const c=i.category||'Other';acc[c]=(acc[c]||0)+1;return acc},{})
  const alerts=items.filter(i=>i.expiry_date&&Math.ceil((new Date(i.expiry_date)-new Date())/(1000*60*60*24))<=3)
  const filtered=items.filter(i=>filter==='all'||getStatus(i.expiry_date)===filter)
  const TABS=[{id:'pantry',label:'🏠 Pantry'},{id:'add',label:'➕ Add'},{id:'search',label:'🔍 Search'},{id:'ai',label:'✨ AI'},{id:'shop',label:'🛒 Shop'},{id:'stats',label:'📊 Stats'},{id:'saved',label:`📖 (${savedRecipes.length})`}]

  return (
    <div className="pp-wrap">
      <div className="pp-header">
        <div className="pp-logo">🥦 Pantry<span>Pal</span></div>
        <div className="pp-header-right">
          <span className="pp-email">{user.email}</span>
          <button className="pp-icon-btn" onClick={()=>setDark(!dark)}>{dark?'☀️':'🌙'}</button>
          <button className="pp-logout" onClick={()=>supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>

      {alerts.length>0&&showBanner&&(
        <div className="pp-alert">
          <div>
            <strong>⏰ Expiry alert</strong>
            {alerts.map(item=>{const days=Math.ceil((new Date(item.expiry_date)-new Date())/(1000*60*60*24));return<div key={item.id} style={{marginTop:'3px',fontSize:'12px'}}>• <strong>{item.name}</strong> — {days<0?'Expired!':days===0?'Expires today!':`Expires in ${days} day(s)`}</div>})}
          </div>
          <button className="pp-alert-close" onClick={()=>setShowBanner(false)}>✕</button>
        </div>
      )}

      <div className="pp-tabs">
        {TABS.map(t=><button key={t.id} className={`pp-tab ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>{t.label}</button>)}
      </div>

      {/* PANTRY */}
      {activeTab==='pantry'&&(
        <>
          <div className="pp-stats">
            <div className="pp-stat"><div className="pp-stat-num">{total}</div><div className="pp-stat-lbl">Total</div></div>
            <div className="pp-stat"><div className="pp-stat-num" style={{color:'var(--green-mid)'}}>{fresh}</div><div className="pp-stat-lbl">Fresh</div></div>
            <div className="pp-stat"><div className="pp-stat-num" style={{color:'var(--amber)'}}>{expiring}</div><div className="pp-stat-lbl">Expiring</div></div>
            <div className="pp-stat"><div className="pp-stat-num" style={{color:'var(--red)'}}>{expired}</div><div className="pp-stat-lbl">Expired</div></div>
          </div>
          <div className="pp-filters">
            {['all','fresh','expiring','expired'].map(f=><button key={f} className={`pp-filter ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>{f==='all'?'All':f==='fresh'?'🟢 Fresh':f==='expiring'?'🟡 Expiring':'🔴 Expired'}</button>)}
          </div>
          <div className="pp-grid">
            {filtered.length===0&&<div className="pp-empty">No items found. Add some from the Add tab!</div>}
            {filtered.map(item=>{const s=getStatus(item.expiry_date);return(
              <div key={item.id} className={`pp-card ${s}`}>
                <div className="pp-card-icon">{catIcon(item.category)}</div>
                <div className="pp-card-name">{item.name}</div>
                <div className="pp-card-meta">{item.quantity||'–'}{item.notes?' · '+item.notes:''}</div>
                <span className={`pp-badge ${s}`}>{s==='expired'?'Expired':s==='expiring'?'Expiring':'Fresh'}</span>
                <div className="pp-card-footer">
                  <span className="pp-expiry-lbl">{daysLabel(item.expiry_date)}</span>
                  <button className="pp-del" onClick={()=>deleteItem(item.id)}>✕</button>
                </div>
              </div>
            )})}
          </div>
        </>
      )}

      {/* ADD */}
      {activeTab==='add'&&(
        <div className="pp-box">
          <div className="pp-box-title">Add to Pantry</div>
          <div className="pp-box-sub">Track a new ingredient with expiry date</div>
          <div className="pp-form-row three">
            <div className="pp-field"><label className="pp-label">Item name *</label><input className="pp-input" placeholder="e.g. Tomatoes" value={name} onChange={e=>setName(e.target.value)}/></div>
            <div className="pp-field"><label className="pp-label">Quantity</label><input className="pp-input" placeholder="e.g. 500g" value={qty} onChange={e=>setQty(e.target.value)}/></div>
            <div className="pp-field"><label className="pp-label">Category</label><select className="pp-input" value={category} onChange={e=>setCategory(e.target.value)}>{['Vegetables','Fruits','Meat & Fish','Dairy','Grains','Spices','Canned','Frozen','Condiments','Other'].map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="pp-form-row">
            <div className="pp-field"><label className="pp-label">Expiry date</label><input className="pp-input" type="date" value={expiry} onChange={e=>setExpiry(e.target.value)}/></div>
            <div className="pp-field"><label className="pp-label">Notes (optional)</label><input className="pp-input" placeholder="e.g. Organic" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
          </div>
          <div className="pp-actions">
            <button className="pp-btn" onClick={()=>{setName('');setQty('');setExpiry('');setNotes('')}}>Clear</button>
            <button className="pp-btn primary" onClick={addItem}>Add to Pantry</button>
          </div>
          <div style={{marginTop:'1.25rem'}}>
            <div className="pp-section-lbl">Quick-add common ingredients</div>
            <div className="pp-chips">{QUICK_ITEMS.map(q=><button key={q} className="pp-chip" onClick={()=>setName(q)}>{q}</button>)}</div>
          </div>
        </div>
      )}

      {/* SEARCH */}
      {activeTab==='search'&&(
        <div className="pp-box">
          <div className="pp-box-title">Recipe Search</div>
          <div className="pp-box-sub">Real recipes with photos + nutrition info</div>
          <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
            <button className={`pp-btn ${spoonMode==='pantry'?'primary':''}`} onClick={()=>setSpoonMode('pantry')}>🧺 From My Pantry</button>
            <button className={`pp-btn ${spoonMode==='search'?'primary':''}`} onClick={()=>setSpoonMode('search')}>🔍 Search by Name</button>
          </div>
          {spoonMode==='pantry'&&(<><div style={{fontSize:'13px',color:'var(--text-secondary)',marginBottom:'12px',background:'var(--bg-secondary)',padding:'10px 12px',borderRadius:'var(--radius-md)',border:'0.5px solid var(--border)'}}>Using: <strong style={{color:'var(--text-primary)'}}>{items.map(i=>i.name).join(', ')||'No items yet'}</strong></div><button className="pp-btn primary" onClick={searchFromPantry}>🔍 Find Recipes</button></>)}
          {spoonMode==='search'&&(<div style={{display:'flex',gap:'8px'}}><input className="pp-input" style={{flex:1}} placeholder="e.g. biryani, pasta, dal" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchByName()}/><button className="pp-btn primary" onClick={searchByName}>Search</button></div>)}
          {loadingSpoon&&<div style={{textAlign:'center',padding:'2rem',color:'var(--text-secondary)',fontSize:'13px'}}><div className="pp-typing" style={{margin:'0 auto 12px'}}><div className="pp-dot"/><div className="pp-dot"/><div className="pp-dot"/></div>Finding recipes…</div>}
          {loadingDetails&&<div style={{textAlign:'center',padding:'2rem',color:'var(--text-secondary)',fontSize:'13px'}}>Loading details…</div>}
          {selectedRecipe&&!loadingDetails&&(
            <div style={{border:'0.5px solid var(--border)',borderRadius:'var(--radius-lg)',overflow:'hidden',marginTop:'12px'}}>
              <button className="pp-detail-back" onClick={()=>setSelectedRecipe(null)}>← Back</button>
              <img className="pp-detail-img" src={selectedRecipe.image} alt={selectedRecipe.title}/>
              <div className="pp-detail-body">
                <div className="pp-detail-title">{selectedRecipe.title}</div>
                <div className="pp-pills">
                  <span className="pp-pill blue">⏱ {selectedRecipe.readyInMinutes} mins</span>
                  <span className="pp-pill">👥 {selectedRecipe.servings} servings</span>
                  {selectedRecipe.vegetarian&&<span className="pp-pill green">🌿 Veg</span>}
                </div>
                {selectedRecipe.nutrition?.nutrients&&(<><div className="pp-section-lbl">📊 Nutrition per serving</div><NutritionBox nutrients={selectedRecipe.nutrition.nutrients}/></>)}
                <div className="pp-section-lbl">Ingredients</div>
                <ul className="pp-ingr-list">{selectedRecipe.extendedIngredients?.map((ing,i)=><li key={i}>{ing.original}</li>)}</ul>
                <div style={{display:'flex',gap:'8px'}}>
                  <button className="pp-btn primary" style={{flex:1}} onClick={()=>saveSpoonRecipe(selectedRecipe)}>💾 Save</button>
                  <a href={selectedRecipe.sourceUrl} target="_blank" rel="noreferrer" style={{flex:1,background:'var(--bg-secondary)',color:'var(--text-primary)',border:'0.5px solid var(--border)',padding:'8px 16px',borderRadius:'var(--radius-md)',fontSize:'13px',textAlign:'center',textDecoration:'none',display:'inline-block'}}>🔗 Full Recipe</a>
                </div>
              </div>
            </div>
          )}
          {!loadingSpoon&&!selectedRecipe&&spoonRecipes.length>0&&(
            <div className="pp-recipe-grid">
              {spoonRecipes.map(recipe=>{const nutr=recipe.nutrition?.nutrients;return(
                <div key={recipe.id} className="pp-recipe-card" onClick={()=>openRecipeDetails(recipe.id)}>
                  <img className="pp-recipe-img" src={recipe.image} alt={recipe.title}/>
                  <div className="pp-recipe-info">
                    <div className="pp-recipe-name">{recipe.title}</div>
                    {recipe.usedIngredientCount!==undefined&&<div className="pp-recipe-matched">✅ {recipe.usedIngredientCount} matched</div>}
                    {recipe.readyInMinutes&&<div className="pp-recipe-meta">⏱ {recipe.readyInMinutes} mins</div>}
                    {nutr&&<div className="pp-recipe-meta" style={{color:'var(--blue-mid)'}}>🔥 {getNutrient(nutr,'Calories')}</div>}
                  </div>
                </div>
              )})}
            </div>
          )}
          {!loadingSpoon&&spoonRecipes.length===0&&!selectedRecipe&&<div className="pp-empty" style={{marginTop:'16px'}}>Search for recipes above!</div>}
        </div>
      )}

      {/* AI CHEF */}
      {activeTab==='ai'&&(
        <>
          <div className="pp-box" style={{marginBottom:'10px'}}>
            <div className="pp-box-title">✨ AI Chef</div>
            <div className="pp-box-sub">Ask anything — recipes, tips, nutrition included!</div>
            <div className="pp-chips">
              {['Make me a quick 15 min dinner','What can I cook with tomatoes?','Give me a healthy breakfast'].map((ex,i)=><button key={i} className="pp-chip" onClick={()=>setUserPrompt(ex)}>💬 {ex}</button>)}
              <button className="pp-chip ingr" onClick={()=>setUserPrompt(`Suggest recipes with: ${items.map(i=>i.name).join(', ')}`)}>🧺 From my pantry</button>
            </div>
          </div>
          {saveSuccess&&<div className="pp-toast">✅ Recipe saved to your cookbook!</div>}
          <div className="pp-chat">
            {chatHistory.length===0&&<div className="pp-chat-empty"><div style={{fontSize:'36px',marginBottom:'8px'}}>👨‍🍳</div>Ask me anything about cooking!</div>}
            {chatHistory.map((msg,i)=>(
              <div key={i}>
                <div className={`pp-msg ${msg.role}`}><div className={`pp-bubble ${msg.role}`}>{msg.text}</div></div>
                {msg.role==='ai'&&(
                  <div style={{paddingLeft:'4px',marginBottom:'4px'}}>
                    {msg.nutrition&&(
                      <div style={{maxWidth:'92%',marginBottom:'6px'}}>
                        <div className="pp-section-lbl" style={{marginBottom:'4px'}}>📊 Estimated nutrition per serving</div>
                        <div className="pp-nutrition">
                          {[{label:'Calories',val:msg.nutrition.calories},{label:'Protein',val:msg.nutrition.protein},{label:'Carbs',val:msg.nutrition.carbs},{label:'Fat',val:msg.nutrition.fat}].map(n=>(
                            <div key={n.label} className="pp-nutr-item"><div className="pp-nutr-val">{n.val}</div><div className="pp-nutr-lbl">{n.label}</div></div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button className="pp-save-recipe" onClick={()=>saveRecipe(msg.text,msg.nutrition)}>💾 Save to cookbook</button>
                  </div>
                )}
              </div>
            ))}
            {loadingAI&&<div className="pp-msg"><div className="pp-typing"><div className="pp-dot"/><div className="pp-dot"/><div className="pp-dot"/></div></div>}
          </div>
          <div className="pp-input-row">
            <input className="pp-input" style={{flex:1}} placeholder="Ask anything…" value={userPrompt} onChange={e=>setUserPrompt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAIPrompt()}/>
            <button className="pp-btn primary" onClick={handleAIPrompt} disabled={loadingAI}>{loadingAI?'⏳':'→'}</button>
          </div>
        </>
      )}

      {/* SHOPPING */}
      {activeTab==='shop'&&(
        <div className="pp-box">
          <div className="pp-box-title">🛒 Shopping List</div>
          <div className="pp-box-sub">Keep track of what you need to buy</div>
          <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
            <input className="pp-input" style={{flex:1}} placeholder="Add item…" value={shopInput} onChange={e=>setShopInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addShopItem()}/>
            <button className="pp-btn primary" onClick={addShopItem}>Add</button>
          </div>
          <button className="pp-btn full" style={{marginBottom:'16px',background:'var(--amber-light)',color:'var(--amber)',borderColor:'var(--amber-mid)'}} onClick={addExpiringToShop}>⚠️ Add expiring items</button>
          {shopItems.length===0&&<div className="pp-empty">Your shopping list is empty!</div>}
          {shopItems.map(item=>(
            <div key={item.id} className="pp-shop-item">
              <input type="checkbox" className="pp-shop-cb" checked={item.checked} onChange={()=>toggleShopItem(item.id)}/>
              <span className={`pp-shop-text ${item.checked?'done':''}`}>{item.text}</span>
              <button className="pp-del" onClick={()=>deleteShopItem(item.id)}>✕</button>
            </div>
          ))}
          {shopItems.some(i=>i.checked)&&<button className="pp-btn full" style={{marginTop:'8px'}} onClick={()=>setShopItems(shopItems.filter(i=>!i.checked))}>🧹 Clear checked ({shopItems.filter(i=>i.checked).length})</button>}
        </div>
      )}

      {/* STATS */}
      {activeTab==='stats'&&(
        <>
          <div className="pp-stats">
            <div className="pp-stat"><div className="pp-stat-num">{total}</div><div className="pp-stat-lbl">Total</div></div>
            <div className="pp-stat"><div className="pp-stat-num" style={{color:'var(--green-mid)'}}>{fresh}</div><div className="pp-stat-lbl">Fresh</div></div>
            <div className="pp-stat"><div className="pp-stat-num" style={{color:'var(--amber)'}}>{expiring}</div><div className="pp-stat-lbl">Expiring</div></div>
            <div className="pp-stat"><div className="pp-stat-num" style={{color:'var(--red)'}}>{expired}</div><div className="pp-stat-lbl">Expired</div></div>
          </div>
          <div className="pp-box">
            <div className="pp-box-title">📦 By Category</div>
            {Object.keys(categoryCounts).length===0&&<div style={{fontSize:'13px',color:'var(--text-secondary)'}}>No items yet</div>}
            {Object.entries(categoryCounts).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>(
              <div key={cat} style={{marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'4px'}}><span>{catIcon(cat)} {cat}</span><span style={{fontWeight:'500',color:'var(--blue-mid)'}}>{count}</span></div>
                <div style={{background:'var(--bg-secondary)',borderRadius:'4px',height:'5px',border:'0.5px solid var(--border)'}}><div style={{background:'var(--blue-mid)',borderRadius:'4px',height:'5px',width:`${(count/total)*100}%`,transition:'width 0.3s'}}/></div>
              </div>
            ))}
          </div>
          {expiring>0&&(
            <div className="pp-box" style={{background:'var(--amber-light)',border:'0.5px solid var(--amber-mid)'}}>
              <div className="pp-box-title" style={{color:'var(--amber)'}}>⏰ Use These Soon</div>
              {items.filter(i=>getStatus(i.expiry_date)==='expiring').map(item=>(
                <div key={item.id} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'6px 0',borderBottom:'0.5px solid var(--amber-mid)',color:'var(--amber)'}}><span>{item.name}</span><span>{daysLabel(item.expiry_date)}</span></div>
              ))}
            </div>
          )}
        </>
      )}

      {/* COOKBOOK */}
      {activeTab==='saved'&&(
        <>
          <div className="pp-box-title" style={{marginBottom:'12px'}}>📖 My Cookbook</div>
          {savedRecipes.length===0&&<div className="pp-empty">No saved recipes yet! Save from AI Chef or Search tab.</div>}
          {savedRecipes.map(recipe=>(
            <div key={recipe.id} className="pp-cookbook-card">
              <div className="pp-cookbook-title"><span>{recipe.title}</span><button className="pp-del" onClick={()=>deleteRecipe(recipe.id)}>✕ Delete</button></div>
              <div className="pp-cookbook-content">{recipe.content}</div>
              <div className="pp-cookbook-date">Saved {new Date(recipe.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(()=>{
    const saved=localStorage.getItem('pp_dark')
    if(saved!==null)return saved==='true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  useEffect(()=>{localStorage.setItem('pp_dark',dark)},[dark])
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user??null);setLoading(false)})
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{setUser(session?.user??null)})
    return()=>subscription.unsubscribe()
  },[])
  return (
    <>
      <style>{STYLES(dark)}</style>
      {loading?(
        <div className="pp-loading"><span style={{fontSize:'40px'}}>🥦</span>Loading Pantry Pal…</div>
      ):user?(
        <MainApp user={user} dark={dark} setDark={setDark}/>
      ):(
        <AuthScreen/>
      )}
    </>
  )
}
