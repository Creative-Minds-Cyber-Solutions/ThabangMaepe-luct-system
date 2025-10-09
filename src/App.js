// src/App.js
import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
    const [role, setRole] = useState(localStorage.getItem('role') || '');
    const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [department, setDepartment] = useState(localStorage.getItem('department') || '');
    const [faculty, setFaculty] = useState(localStorage.getItem('faculty') || '');

    const isLoggedIn = !!localStorage.getItem('token');

    return (
        <Router>
            <div className="d-flex flex-column min-vh-100 App">
                <div className="flex-grow-1">
                    <Routes>
                        {/* Login route */}
                        <Route
                            path="/"
                            element={isLoggedIn ? (
                                <Navigate to="/dashboard" />
                            ) : (
                                <div className="login-container card-container">
                                    <Login
                                        setRole={setRole}
                                        setUserId={setUserId}
                                        setUsername={setUsername}
                                        setDepartment={setDepartment}
                                        setFaculty={setFaculty}
                                    />
                                </div>
                            )}
                        />

                        {/* Login (explicit path) */}
                        <Route
                            path="/login"
                            element={isLoggedIn ? (
                                <Navigate to="/dashboard" />
                            ) : (
                                <div className="login-container card-container">
                                    <Login
                                        setRole={setRole}
                                        setUserId={setUserId}
                                        setUsername={setUsername}
                                        setDepartment={setDepartment}
                                        setFaculty={setFaculty}
                                    />
                                </div>
                            )}
                        />

                        {/* Register */}
                        <Route
                            path="/register"
                            element={isLoggedIn ? (
                                <Navigate to="/dashboard" />
                            ) : (
                                <div className="register-container card-container">
                                    <Register />
                                </div>
                            )}
                        />

                        {/* Dashboard */}
                        <Route
                            path="/dashboard"
                            element={isLoggedIn ? (
                                <Dashboard
                                    role={role}
                                    userId={userId}
                                    username={username}
                                    department={department}
                                    faculty={faculty}
                                    setRole={setRole}
                                    setUserId={setUserId}
                                />
                            ) : (
                                <Navigate to="/" />
                            )}
                        />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
}

export default App;