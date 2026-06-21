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

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activities, setActivities] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
    fetchActivities()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects/')
      setProjects(res.data)
    } catch (err) {
      navigate('/login')
    }
  }

  const fetchActivities = async () => {
    try {
      const res = await API.get('/activity/')
      setActivities(res.data)
    } catch (err) {
      console.log('No activity yet')
    }
  }

  const createProject = async () => {
    if (!title) return
    await API.post(`/projects/?title=${title}&description=${description}`)
    setTitle('')
    setDescription('')
    fetchProjects()
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

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
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'rgba(102,126,234,0.15)',
            color: '#a5b4fc', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
          }}>
            🗂️ Projects
          </div>
          <div
  onClick={() => navigate('/activity')}
  style={{
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '10px',
    color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
  }}
>
  📊 Activity
</div>
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
            <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: '700', margin: '0 0 8px', letterSpacing: '-0.5px' }}>My Projects</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '15px' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} total
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
            padding: '28px', marginBottom: '32px'
          }}>
            <h2 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: '600', margin: '0 0 16px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>New Project</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                placeholder="Project name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createProject()}
                style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
              />
              <input
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createProject()}
                style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
              />
              <button
                onClick={createProject}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '12px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >+ Create</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {projects.map((project, i) => (
              <div
                key={project.id}
                onClick={() => navigate(`/kanban/${project.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
                  padding: '24px', cursor: 'pointer', transition: 'all 0.2s',
                  position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.borderColor = 'rgba(102,126,234,0.5)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }}
              >
                <div style={{
                  width: '40px', height: '40px',
                  background: `linear-gradient(135deg, ${['#667eea, #764ba2', '#f093fb, #f5576c', '#4facfe, #00f2fe', '#43e97b, #38f9d7'][i % 4]})`,
                  borderRadius: '12px', marginBottom: '16px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                }}>🗂️</div>
                <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', margin: '0 0 6px' }}>{project.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 16px' }}>{project.description || 'No description'}</p>
                <div style={{ color: 'rgba(102,126,234,0.8)', fontSize: '13px', fontWeight: '500' }}>Open board →</div>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>No projects yet. Create one above!</p>
            </div>
          )}

          <div style={{
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
            padding: '24px', marginTop: '32px'
          }}>
            <h2 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: '600', margin: '0 0 16px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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