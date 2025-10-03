import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login({ setRole, setUserId, setUsername }) {
    const [username, setUserInput] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        try {
            const res = await api.post('/login', { username, password });

            // Store token and user info in localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('userId', res.data.id);
            localStorage.setItem('username', res.data.username);

            // Update state
            setRole(res.data.role);
            setUserId(res.data.id);
            setUsername(res.data.username);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-page">
            <div className="logo-container">
                <img src="/logo-dark.png" alt="LUCT Logo" />
            </div>
            <div className="login-container card-container">
                <h2 className="mb-4 text-center">LUCT Dashboard Login</h2>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter username" 
                        value={username} 
                        onChange={e => setUserInput(e.target.value)} 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        placeholder="Enter password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                    />
                </div>
                <button 
                    className="btn btn-primary w-100 mt-2" 
                    onClick={handleLogin}
                >
                    Login
                </button>
            </div>
        </div>
    );
}

export default Login;
