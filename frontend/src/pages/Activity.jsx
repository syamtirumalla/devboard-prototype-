import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

function timeAgo(dateStr) {
  const diff = (new Date() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function buildGrid(days) {
  const countMap = {}
  days.forEach(d => { countMap[d.date] = d.count })

  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - 364)
  // align start to a Sunday so columns are clean weeks
  const startDay = start.getDay()
  start.setDate(start.getDate() - startDay)

  const weeks = []
  let cursor = new Date(start)
  while (cursor <= today) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const dateStr = cursor.toISOString().split('T')[0]
      week.push({
        date: dateStr,
        count: countMap[dateStr] || 0,
        future: cursor > today
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function levelColor(count) {
  if (count === 0) return 'rgba(255,255,255,0.06)'
  if (count === 1) return 'rgba(102,126,234,0.35)'
  if (count <= 3) return 'rgba(102,126,234,0.6)'
  if (count <= 6) return 'rgba(102,126,234,0.85)'
  return '#667eea'
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Activity() {
  const [activities, setActivities] = useState([])
  const [heatmap, setHeatmap] = useState({ days: [], total: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    fetchActivities()
    fetchHeatmap()
  }, [])

  const fetchActivities = async () => {
    try {
      const res = await API.get('/activity/')
      setActivities(res.data)
    } catch {
      navigate('/login')
    }
  }

  const fetchHeatmap = async () => {
    try {
      const res = await API.get('/activity/heatmap')
      setHeatmap(res.data)
    } catch {
      console.log('No heatmap data yet')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const weeks = buildGrid(heatmap.days)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Segoe UI', sans-serif",
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '240px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px', marginBottom: '32px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '9px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '16px'
          }}>📋</div>
          <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700' }}>DevBoard</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
            }}
          >🗂️ Projects</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'rgba(102,126,234,0.15)',
            color: '#a5b4fc', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
          }}>📊 Activity</div>
        </div>

        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5', fontSize: '14px', fontWeight: '500',
            cursor: 'pointer', width: '100%', textAlign: 'left'
          }}
        >🚪 Sign out</button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '40px 32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: '700', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Activity</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '15px' }}>
              {heatmap.total} action{heatmap.total !== 1 ? 's' : ''} in the last year
            </p>
          </div>

          {/* Heatmap */}
          <div style={{
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
            padding: '28px', marginBottom: '32px', overflowX: 'auto'
          }}>
            <div style={{ display: 'flex', gap: '3px', minWidth: 'max-content' }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {week.map((day, di) => (
                    <div
                      key={di}
                      title={day.future ? '' : `${day.count} action${day.count !== 1 ? 's' : ''} on ${day.date}`}
                      style={{
                        width: '11px', height: '11px', borderRadius: '2px',
                        background: day.future ? 'transparent' : levelColor(day.count)
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              <span>Less</span>
              {[0, 1, 3, 6, 8].map(c => (
                <div key={c} style={{ width: '11px', height: '11px', borderRadius: '2px', background: levelColor(c) }} />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* Feed */}
          <div style={{
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
            padding: '24px'
          }}>
            <h2 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: '600', margin: '0 0 16px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Recent Activity
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activities.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: a.action === 'deleted' ? '#ef4444' : a.action === 'created' ? '#22c55e' : '#667eea',
                    flexShrink: 0
                  }}/>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0, flex: 1 }}>
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>{a.task_title}</span> {a.action}
                  </p>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{timeAgo(a.created_at)}</span>
                </div>
              ))}
              {activities.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No activity yet</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}