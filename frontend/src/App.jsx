import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Kanban from './pages/Kanban'
import Activity from './pages/Activity'

function App() {
  const token = localStorage.getItem('token')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/kanban/:projectId" element={token ? <Kanban /> : <Navigate to="/login" />} />
        <Route path="/activity" element={token ? <Activity /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App