import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api'

const COLUMNS = ['todo', 'in_progress', 'done']
const LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }
const COLORS = { todo: 'bg-gray-100', in_progress: 'bg-blue-50', done: 'bg-green-50' }

export default function Kanban() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

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
    await API.post(`/tasks/${projectId}/tasks?title=${newTask}`)
    setNewTask('')
    fetchTasks()
  }

  const moveTask = async (task, newStatus) => {
    await API.put(`/tasks/${projectId}/tasks/${task.id}?title=${task.title}&status=${newStatus}`)
    fetchTasks()
  }

  const deleteTask = async (taskId) => {
    await API.delete(`/tasks/${projectId}/tasks/${taskId}`)
    fetchTasks()
  }

  const tasksByStatus = (status) => tasks.filter(t => t.status === status)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Back
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-3">
          <input
            className="flex-1 border p-2 rounded"
            placeholder="New task title..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createTask()}
          />
          <button onClick={createTask} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Task
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {COLUMNS.map(col => (
            <div key={col} className={`${COLORS[col]} rounded-lg p-4`}>
              <h2 className="font-semibold text-lg mb-4 text-gray-700">
                {LABELS[col]} <span className="text-sm text-gray-400">({tasksByStatus(col).length})</span>
              </h2>
              <div className="space-y-3">
                {tasksByStatus(col).map(task => (
                  <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="font-medium text-gray-800 mb-2">{task.title}</p>
                    <div className="flex gap-1 flex-wrap">
                      {COLUMNS.filter(c => c !== col).map(c => (
                        <button
                          key={c}
                          onClick={() => moveTask(task, c)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          → {LABELS[c]}
                        </button>
                      ))}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {tasksByStatus(col).length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}