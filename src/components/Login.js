import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Login({ setRole, setUserId, setUsername, setDepartment, setFaculty }) {
  const [username, setUserInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/login', { username, password });

      const { token, role, id, username: name, department, faculty } = res.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', id);
      localStorage.setItem('username', name);
      localStorage.setItem('department', department);
      localStorage.setItem('faculty', faculty);

      // Update parent states
      setRole(role);
      setUserId(id);
      setUsername(name);
      setDepartment(department);
      setFaculty(faculty);

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="logo-container text-center mb-3">
        <img src="/logo-dark.png" alt="LUCT Logo" />
      </div>

      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h2 className="mb-4 text-center">LUCT Dashboard Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={e => setUserInput(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-3 text-center">
          Don’t have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
