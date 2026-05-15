'use client'
import { useState, useEffect, useCallback } from 'react'

function getDays() {
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2025, 4, 16 + i)
    return {
      key: d.toISOString().split('T')[0],
      label: dayNames[d.getDay()],
      date: `${d.getDate()} May`,
      short: `${dayNames[d.getDay()]}\n${d.getDate()}`,
    }
  })
}

const HOURS = ['18:00', '19:00', '20:00']
const DAYS = getDays()
const WEEK1 = DAYS.slice(0, 7)
const WEEK2 = DAYS.slice(7)

function getCellStyle(count, max) {
  if (count === 0) return { background: '#f3f4f6', color: '#9ca3af' }
  const intensity = count / Math.max(max, 1)
  if (intensity < 0.33) return { background: '#bbf7d0', color: '#14532d' }
  if (intensity < 0.66) return { background: '#4ade80', color: '#14532d' }
  return { background: '#16a34a', color: 'white' }
}

function Heatmap({ days, heatmap, heatmapNames, maxCount }) {
  const cols = days.length
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `56px repeat(${cols}, 1fr)`,
      gap: 3,
    }}>
      <div />
      {days.map(d => (
        <div key={d.key} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#9ca3af', textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.2, padding: '2px 0' }}>
          {d.short}
        </div>
      ))}
      {HOURS.map(hour => (
        <>
          <div key={`lbl-${hour}`} style={{ fontSize: 12, fontWeight: 600, color: '#4b5563', display: 'flex', alignItems: 'center' }}>{hour}</div>
          {days.map(day => {
            const k = `${day.key}|${hour}`
            const count = heatmap[k] || 0
            return (
              <div key={k} style={{ ...getCellStyle(count, maxCount), borderRadius: 6, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, cursor: count > 0 ? 'pointer' : 'default' }} title={heatmapNames[k]?.join(', ') || ''}>
                {count > 0 ? count : ''}
              </div>
            )
          })}
        </>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch('/api/votes')
      const data = await res.json()
      setVotes(data)
      setLastUpdated(new Date())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchVotes() }, [fetchVotes])

  const deleteVote = async (name) => {
    if (!confirm(`¿Borrar la respuesta de ${name}?`)) return
    setDeleting(name)
    try {
      await fetch(`/api/votes?name=${encodeURIComponent(name)}`, { method: 'DELETE' })
      await fetchVotes()
    } catch {}
    setDeleting(null)
  }

  const heatmap = {}
  const heatmapNames = {}
  votes.forEach(v => {
    v.slots?.forEach(s => {
      const k = `${s.day}|${s.hour}`
      heatmap[k] = (heatmap[k] || 0) + 1
      if (!heatmapNames[k]) heatmapNames[k] = []
      heatmapNames[k].push(v.name)
    })
  })

  const maxCount = Math.max(...Object.values(heatmap), 0)
  const totalSlots = votes.reduce((acc, v) => acc + (v.slots?.length || 0), 0)

  const sortedSlots = Object.entries(heatmap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  function formatSlotKey(k) {
    const [dayKey, hour] = k.split('|')
    const day = DAYS.find(d => d.key === dayKey)
    return day ? `${day.label} ${day.date} · ${hour}` : k
  }

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="admin-header">
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--pitch)', letterSpacing: '0.03em' }}>
            PANEL CAPITÁN ⚽
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            {lastUpdated ? `Actualizado ${lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </div>
        </div>
        <button className="refresh-btn" onClick={fetchVotes}>↻ Actualizar</button>
      </div>

      <div className="stat-row">
        <div className="stat-card"><div className="num">{votes.length}</div><div className="lbl">Jugadores</div></div>
        <div className="stat-card"><div className="num">{totalSlots}</div><div className="lbl">Huecos totales</div></div>
        <div className="stat-card"><div className="num">{maxCount}</div><div className="lbl">Máx. coincidencias</div></div>
      </div>

      {sortedSlots.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">MEJORES FRANJAS</div>
          {sortedSlots.map(([k, count], i) => (
            <div key={k} className="best-slot" style={{ background: i === 0 ? 'var(--pitch)' : 'var(--grass)', opacity: i === 0 ? 1 : 0.85 }}>
              <div className="trophy">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
              <div>
                <h3>{formatSlotKey(k)}</h3>
                <p>{count} de {votes.length} jugadores · {heatmapNames[k]?.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-label">Mapa de disponibilidad — 16 al 22 May</div>
        {loading ? <div className="empty-state">Cargando...</div> : votes.length === 0 ? <div className="empty-state">Aún no hay respuestas</div> : (
          <Heatmap days={WEEK1} heatmap={heatmap} heatmapNames={heatmapNames} maxCount={maxCount} />
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-label">Mapa de disponibilidad — 23 al 27 May</div>
        {loading ? <div className="empty-state">Cargando...</div> : votes.length === 0 ? <div className="empty-state">Aún no hay respuestas</div> : (
          <Heatmap days={WEEK2} heatmap={heatmap} heatmapNames={heatmapNames} maxCount={maxCount} />
        )}
      </div>

      <div className="section-title">RESPUESTAS INDIVIDUALES</div>
      {loading ? <div className="empty-state">Cargando...</div> : votes.length === 0 ? <div className="empty-state">Aún no ha respondido nadie</div> : (
        votes.map((v, i) => (
          <div key={i} className="player-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div className="player-name" style={{ marginBottom: 0 }}>
                {v.name}
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--gray-400)', marginLeft: 8 }}>
                  {v.timestamp ? new Date(v.timestamp).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <button
                onClick={() => deleteVote(v.name)}
                disabled={deleting === v.name}
                style={{ background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer', opacity: deleting === v.name ? 0.5 : 1, whiteSpace: 'nowrap', marginLeft: 8 }}
              >
                {deleting === v.name ? '...' : '🗑 Borrar'}
              </button>
            </div>
            {v.slots?.length > 0 ? (
              <div className="slot-chips">
                {v.slots.map((s, j) => {
                  const day = DAYS.find(d => d.key === s.day)
                  return <span key={j} className="chip">{day ? `${day.label} ${day.date}` : s.day} · {s.hour}</span>
                })}
              </div>
            ) : <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Sin huecos disponibles</p>}
            {v.observations && <div className="obs">"{v.observations}"</div>}
          </div>
        ))
      )}
    </div>
  )
}