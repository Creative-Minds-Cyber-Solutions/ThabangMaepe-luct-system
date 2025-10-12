import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student'); // default Student
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError('');
    const faculty = 'FICT'; // Automatically set faculty
    if (!username || !password || !role || !department) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Send password as-is (allow numeric values)
      await api.post('/auth/register', { username, password, role, faculty, department });
      alert('Registration successful! You can now log in.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="mb-3">
        <Link to="/" className="btn btn-outline-secondary">
          Back to Home
        </Link>
      </div>
      
      <div className="logo-container text-center mb-3">
        <img src="/logo-dark.png" alt="LUCT Logo" style={{ maxWidth: '120px' }} />
      </div>

      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h2 className="mb-4 text-center">Register Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
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

        <div className="mb-3">
          <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
            <option value="Student">Student</option>
            <option value="Lecturer">Lecturer</option>
          </select>
        </div>

        <div className="mb-3">
          <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">Select Department</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Business Information Technology">Business Information Technology</option>
            <option value="Software Engineering">Software Engineering</option>
          </select>
        </div>

        <div className="mb-3">
          <input type="text" className="form-control" value="FICT" disabled readOnly />
        </div>

        <button className="btn btn-success w-100" onClick={handleRegister} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="mt-3 text-center">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
