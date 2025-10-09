// src/components/Dashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import Classes from './Classes';
import ReportForm from './ReportForm';
import Reports from './Reports';
import Ratings from './Ratings';
import Courses from './Courses';
import Monitoring from './Monitoring';

function Dashboard({ role, userId, username, department, faculty, setRole, setUserId }) {
    const [dashboardView, setDashboardView] = useState('');

    const menuItems = useMemo(() => ({
        Student: ['Monitoring', 'My Classes', 'Rate Classes'],
        Lecturer: ['Monitoring', 'Submit Report', 'My Classes', 'View Ratings'],
        PRL: ['Monitoring', 'Courses', 'Reports', 'Classes', 'Ratings'],
        PL: ['Monitoring', 'Courses', 'Reports', 'Classes', 'Lecturers', 'Ratings'],
    }), []);

    useEffect(() => {
        if (role) {
            setDashboardView(menuItems[role][0]);
        }
    }, [role, menuItems]);

    const renderComponent = () => {
        switch (dashboardView) {
            case 'Monitoring':
                return (
                    <Monitoring
                        role={role}
                        userId={userId}
                        department={department}
                        faculty={faculty}
                    />
                );

            case 'Submit Report':
                return <ReportForm lecturerId={userId} />;

            case 'My Classes':
            case 'Classes':
                return (
                    <Classes
                        role={role}
                        userId={userId}
                        department={department}
                        faculty={faculty}
                    />
                );

            case 'Rate Classes':
            case 'View Ratings':
            case 'Ratings':
                return <Ratings userId={userId} role={role} />;

            case 'Courses':
                return <Courses role={role} department={department} />;

            case 'Reports':
                return <Reports role={role} department={department} faculty={faculty} />;

            case 'Lecturers':
                return <Lecturers role={role} />;

            default:
                return (
                    <div className="alert alert-info">
                        Select an option from the menu above to get started.
                    </div>
                );
        }
    };

    return (
        <>
            <Navbar
                role={role}
                username={username}
                dashboardView={dashboardView}
                setDashboardView={setDashboardView}
                setRole={setRole}
                setUserId={setUserId}
            />

            <div className="dashboard card-container">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h3>Welcome, {username}!</h3>
                        <p className="mb-0 text-muted">
                            <strong>Role:</strong> {role} | 
                            <strong> Department:</strong> {department} | 
                            <strong> Faculty:</strong> {faculty}
                        </p>
                    </div>
                    <div className="text-end">
                        <span className="badge bg-primary">{role}</span>
                    </div>
                </div>

                <hr />

                {/* Quick Menu Buttons */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                    {menuItems[role]?.map((item) => (
                        <button
                            key={item}
                            className={`btn ${dashboardView === item ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setDashboardView(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="dashboard-content">
                    {renderComponent()}
                </div>
            </div>
        </>
    );
}

// Simple Lecturers Component (for PL)
function Lecturers({ role }) {
    const [lecturers, setLecturers] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        fetchLecturers();
    }, []);

    const fetchLecturers = async () => {
        setLoading(true);
        try {
            const api = (await import('../api')).default;
            const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
            const res = await api.get(`/users/lecturers${params}`);
            setLecturers(res.data);
        } catch (err) {
            console.error('Fetch lecturers error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (role !== 'PL') {
        return <div className="alert alert-warning">Access Denied</div>;
    }

    return (
        <div>
            <h4>Lecturers Management</h4>
            
            {/* Search */}
            <div className="card mb-3 p-3">
                <div className="row g-2">
                    <div className="col-md-9">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search lecturers..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && fetchLecturers()}
                        />
                    </div>
                    <div className="col-md-3">
                        <button className="btn btn-primary w-100" onClick={fetchLecturers}>
                            <i className="bi bi-search"></i> Search
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border"></div>
                </div>
            ) : lecturers.length === 0 ? (
                <div className="alert alert-info">No lecturers found</div>
            ) : (
                <div className="list-group">
                    {lecturers.map(lec => (
                        <div key={lec.id} className="list-group-item">
                            <h6>{lec.username}</h6>
                            <p className="mb-0">
                                <strong>Department:</strong> {lec.department} | 
                                <strong> Faculty:</strong> {lec.faculty}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;