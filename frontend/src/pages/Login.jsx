import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
  try {
    const form = new FormData()
    form.append('username', username)
    form.append('password', password)
    const res = await API.post('/auth/login', form)
    localStorage.setItem('token', res.data.access_token)
    window.location.href = '/dashboard'
  } catch (err) {
    setError('Invalid credentials')
  }
}

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">DevBoard</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input
          className="w-full border p-2 rounded mb-4"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  )
}