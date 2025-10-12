// src/components/Navbar.js
import React from 'react';

function Navbar({ role, username, dashboardView, setDashboardView, setRole, setUserId }) {

    const handleLogout = () => {
        localStorage.clear();
        setRole('');
        setUserId('');
        setDashboardView('');
        window.location.href = '/';
    };

    const menuItems = {
        Student: ['Monitoring', 'My Classes', 'Rate Classes'],
        Lecturer: ['Monitoring', 'Submit Report', 'My Classes', 'View Ratings'],
        PRL: ['Monitoring', 'Courses', 'Reports', 'Classes', 'Ratings'],
        PL: ['Monitoring', 'Courses', 'Reports', 'Classes', 'Lecturers', 'Ratings']
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top mb-3 shadow-sm">
            <div className="container-fluid">
                <span className="navbar-brand fw-bold">
                    LUCT Dashboard
                </span>
                
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {role && menuItems[role]?.map(item => (
                            <li key={item} className="nav-item">
                                <button
                                    className={`nav-link btn btn-link ${dashboardView === item ? 'active fw-bold text-primary' : 'text-dark'}`}
                                    onClick={() => setDashboardView(item)}
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="d-flex align-items-center">
                        {username && (
                            <div className="me-3">
                                <span className="navbar-text">
                                    <strong>{username}</strong>
                                    <span className="badge bg-primary ms-2">{role}</span>
                                </span>
                            </div>
                        )}
                        <button 
                            className="btn btn-outline-danger btn-sm" 
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;