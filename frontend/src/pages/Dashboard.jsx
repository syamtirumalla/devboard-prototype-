import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects/')
      setProjects(res.data)
    } catch (err) {
      navigate('/login')
    }
  }

  const createProject = async () => {
    if (!title) return
    await API.post(`/projects/?title=${title}`)
    setTitle('')
    fetchProjects()
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">DevBoard</h1>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Project</h2>
          <div className="flex gap-3">
            <input
              className="flex-1 border p-2 rounded"
              placeholder="Project title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <button
              onClick={createProject}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {projects.map(project => (
  <div
    key={project.id}
    className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition"
    onClick={() => navigate(`/kanban/${project.id}`)}
  >
    <h3 className="text-lg font-semibold">{project.title}</h3>
    <p className="text-gray-500 text-sm mt-1">{project.description}</p>
    <p className="text-blue-500 text-sm mt-2">Click to open board →</p>
  </div>
))}
          {projects.length === 0 && (
            <p className="text-center text-gray-400 mt-8">No projects yet. Create one above!</p>
          )}
        </div>
      </div>
    </div>
  )
}