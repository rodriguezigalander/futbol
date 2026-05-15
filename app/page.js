'use client'
import { useState } from 'react'

// Generate next 7 days starting from tomorrow
function getNextWeekDays() {
  const days = []
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const today = new Date()
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      key: d.toISOString().split('T')[0],
      label: dayNames[d.getDay()],
      date: `${d.getDate()} ${monthNames[d.getMonth()]}`,
    })
  }
  return days
}

const HOURS = ['18:00', '19:00', '20:00']
const DAYS = getNextWeekDays()

export default function Home() {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState({})
  const [observations, setObservations] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const toggleSlot = (dayKey, hour) => {
    const k = `${dayKey}|${hour}`
    setSelected(prev => ({ ...prev, [k]: !prev[k] }))
  }

  const totalSelected = Object.values(selected).filter(Boolean).length

  const handleSubmit = async () => {
    if (!name.trim()) return
    setStatus('loading')
    const slots = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => { const [day, hour] = k.split('|'); return { day, hour } })

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slots, observations }),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="container">
        <div className="success-screen">
          <div className="icon">⚽</div>
          <h2>¡APUNTADO!</h2>
          <p>Tu disponibilidad ha quedado guardada.<br />El capitán ya puede verla.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <div className="badge">⚽ Torneo de Peñas</div>
        <h1>¿CUÁNDO<br />PUEDES?</h1>
        <p>Semana del {DAYS[0].date} al {DAYS[6].date}</p>
      </div>

      {/* Name */}
      <div className="card">
        <div className="card-label">Tu nombre</div>
        <input
          className="name-input"
          type="text"
          placeholder="Escribe tu nombre..."
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={30}
        />
      </div>

      {/* Days grid */}
      <div className="card">
        <div className="card-label">Días y horas disponibles</div>
        {DAYS.map(day => (
          <div className="day-block" key={day.key}>
            <div className="day-name">{day.label} {day.date}</div>
            <div className="slots-row">
              {HOURS.map(hour => {
                const k = `${day.key}|${hour}`
                return (
                  <button
                    key={hour}
                    className={`slot-btn${selected[k] ? ' selected' : ''}`}
                    onClick={() => toggleSlot(day.key, hour)}
                    type="button"
                  >
                    <span className="time">{hour}</span>
                    <span className="label">{selected[k] ? '✓ OK' : 'puedo'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Observations */}
      <div className="card">
        <div className="card-label">Observaciones (opcional)</div>
        <textarea
          className="obs-input"
          placeholder="Ej: El jueves no puedo hasta después de las 19h..."
          value={observations}
          onChange={e => setObservations(e.target.value)}
          maxLength={200}
          rows={3}
        />
      </div>

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={!name.trim() || status === 'loading'}
      >
        {status === 'loading'
          ? 'ENVIANDO...'
          : totalSelected > 0
            ? `ENVIAR (${totalSelected} hueco${totalSelected !== 1 ? 's' : ''})`
            : 'ENVIAR DISPONIBILIDAD'}
      </button>

      {status === 'error' && (
        <p style={{ textAlign: 'center', color: 'red', marginTop: '1rem', fontSize: 14 }}>
          Algo ha fallado. Inténtalo de nuevo.
        </p>
      )}
    </div>
  )
}
