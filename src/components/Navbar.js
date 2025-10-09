// src/components/Navbar.js
import React from 'react';

function Navbar({ role, username, dashboardView, setDashboardView, setRole, setUserId }) {

    const handleLogout = () => {
        // Clear all localStorage
        localStorage.clear();
        
        // Clear state
        setRole('');
        setUserId('');
        setDashboardView('');
        
        // Redirect to login
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
                    <i className="bi bi-mortarboard-fill me-2"></i>
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
                                    {item === 'Monitoring' && <i className="bi bi-graph-up me-1"></i>}
                                    {item === 'My Classes' && <i className="bi bi-book me-1"></i>}
                                    {item === 'Submit Report' && <i className="bi bi-file-earmark-text me-1"></i>}
                                    {item === 'Courses' && <i className="bi bi-journal-code me-1"></i>}
                                    {item === 'Reports' && <i className="bi bi-file-text me-1"></i>}
                                    {item === 'Classes' && <i className="bi bi-collection me-1"></i>}
                                    {item === 'Lecturers' && <i className="bi bi-people me-1"></i>}
                                    {item === 'Ratings' && <i className="bi bi-star me-1"></i>}
                                    {item === 'View Ratings' && <i className="bi bi-star me-1"></i>}
                                    {item === 'Rate Classes' && <i className="bi bi-star-fill me-1"></i>}
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="d-flex align-items-center">
                        {username && (
                            <div className="me-3">
                                <span className="navbar-text">
                                    <i className="bi bi-person-circle me-1"></i>
                                    <strong>{username}</strong>
                                    <span className="badge bg-primary ms-2">{role}</span>
                                </span>
                            </div>
                        )}
                        <button 
                            className="btn btn-outline-danger btn-sm" 
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;