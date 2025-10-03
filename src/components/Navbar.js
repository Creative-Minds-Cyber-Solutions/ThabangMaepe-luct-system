import React from 'react';

function Navbar({ role, username, dashboardView, setDashboardView, setRole, setUserId }) {

    const handleLogout = () => {
        localStorage.clear();
        setRole('');
        setUserId('');
        setDashboardView('');
        window.location.href = '/'; // go back to login
    };

    const menuItems = {
        Student: ['Monitor Classes', 'Rate Lectures'],
        Lecturer: ['Submit Report', 'Monitor Classes', 'Ratings'],
        PRL: ['Courses', 'Reports', 'Monitor Classes', 'Ratings'],
        PL: ['Courses', 'Reports', 'Monitor Classes', 'Ratings']
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top mb-3 rounded">
            <div className="container-fluid">
                <span className="navbar-brand fw-bold">LUCT Dashboard</span>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {role && menuItems[role]?.map(item => (
                            <li key={item} className="nav-item">
                                <button
                                    className={`nav-link btn btn-link ${dashboardView === item ? 'active fw-bold' : ''}`}
                                    onClick={() => setDashboardView(item)}
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="d-flex align-items-center">
                        {username && (
                            <span className="navbar-text me-3">
                                Signed in as: <strong>{username}</strong>
                            </span>
                        )}
                        <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
