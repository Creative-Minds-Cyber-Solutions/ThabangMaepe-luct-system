import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


function App() {
    const [role, setRole] = useState(localStorage.getItem('role') || '');
    const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
    const [username, setUsername] = useState(localStorage.getItem('username') || '');

    return (
        <Router>
            <div className="d-flex flex-column min-vh-100 App">
                <div className="flex-grow-1">
                    <Routes>
                        <Route 
                            path="/" 
                            element={
                                <div className="login-container card-container">
                                    <Login 
                                        setRole={setRole} 
                                        setUserId={setUserId} 
                                        setUsername={setUsername} 
                                    />
                                </div>
                            } 
                        />
                        <Route 
                            path="/dashboard" 
                            element={
                                <Dashboard 
                                    role={role} 
                                    userId={userId} 
                                    username={username} 
                                    setRole={setRole} 
                                    setUserId={setUserId} 
                                />
                            } 
                        />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
