import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api'

const COLUMNS = ['todo', 'in_progress', 'done']
const LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }
const DOT_COLORS = { todo: '#ef4444', in_progress: '#fbbf24', done: '#22c55e' }

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'done') return false
  return new Date(dueDate) < new Date()
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Kanban() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [newDueDate, setNewDueDate] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/${projectId}/tasks`)
      setTasks(res.data)
    } catch {
      navigate('/dashboard')
    }
  }

  const createTask = async () => {
    if (!newTask) return
    const dueParam = newDueDate ? `&due_date=${newDueDate}` : ''
    await API.post(`/tasks/${projectId}/tasks?title=${newTask}${dueParam}`)
    setNewTask('')
    setNewDueDate('')
    fetchTasks()
  }

  const moveTask = async (task, newStatus) => {
    const dueParam = task.due_date ? `&due_date=${task.due_date}` : ''
    await API.put(`/tasks/${projectId}/tasks/${task.id}?title=${task.title}&status=${newStatus}${dueParam}`)
    fetchTasks()
  }

  const deleteTask = async (taskId) => {
    await API.delete(`/tasks/${projectId}/tasks/${taskId}`)
    fetchTasks()
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const tasksByStatus = (status) => tasks.filter(t => t.status === status)

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
          >
            ← Back to projects
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'rgba(102,126,234,0.15)',
            color: '#a5b4fc', fontSize: '14px', fontWeight: '500', cursor: 'default'
          }}>
            🗃️ Board
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
      <div style={{ flex: 1, padding: '32px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
          padding: '20px 24px', marginBottom: '28px', display: 'flex', gap: '12px', maxWidth: '700px'
        }}>
          <input
            placeholder="Add a new task..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createTask()}
            style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
          />
          <input
            type="date"
            value={newDueDate}
            onChange={e => setNewDueDate(e.target.value)}
            style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', colorScheme: 'dark' }}
          />
          <button onClick={createTask} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '10px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Add Task</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {COLUMNS.map(col => (
            <div key={col} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: DOT_COLORS[col] }}/>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{LABELS[col]}</span>
                <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: '20px', padding: '2px 8px', fontSize: '12px' }}>{tasksByStatus(col).length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasksByStatus(col).map(task => {
                  const overdue = isOverdue(task.due_date, task.status)
                  return (
                    <div key={task.id} style={{
                      background: overdue ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)',
                      border: overdue ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '14px', padding: '14px 16px'
                    }}>
                      <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500', margin: '0 0 8px', lineHeight: '1.4' }}>{task.title}</p>
                      {task.due_date && (
                        <div style={{ fontSize: '11px', color: overdue ? '#fca5a5' : 'rgba(255,255,255,0.4)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {overdue ? '⚠️ Overdue:' : '📅'} {formatDate(task.due_date)}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {COLUMNS.filter(c => c !== col).map(c => (
                          <button key={c} onClick={() => moveTask(task, c)} style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '20px', color: '#a5b4fc', cursor: 'pointer', fontWeight: '500' }}>→ {LABELS[c]}</button>
                        ))}
                        <button onClick={() => deleteTask(task.id)} style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', color: '#fca5a5', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
                      </div>
                    </div>
                  )
                })}
                {tasksByStatus(col).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}