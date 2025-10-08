import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import Classes from './Classes';
import ReportForm from './ReportForm';
import Reports from './Reports';
import Ratings from './Ratings';
import Courses from './Courses';

function Dashboard({ role, userId, username, department, faculty, setRole, setUserId }) {
    const [dashboardView, setDashboardView] = useState('');

    const menuItems = useMemo(() => ({
        Student: ['Monitor Classes', 'Rate Lectures'],
        Lecturer: ['Submit Report', 'Monitor Classes', 'Ratings'],
        PRL: ['Courses', 'Reports', 'Monitor Classes', 'Ratings'],
        PL: ['Courses', 'Reports', 'Monitor Classes', 'Ratings'],
    }), []);

    useEffect(() => {
        if (role) setDashboardView(menuItems[role][0]);
    }, [role, menuItems]);

    const renderComponent = () => {
        switch (dashboardView) {
            case 'Submit Report':
                return <ReportForm lecturerId={userId} />;
            case 'Monitor Classes':
                return (
                    <Classes
                        role={role}
                        userId={userId}
                        department={department}
                        faculty={faculty}
                    />
                );
            case 'Rate Lectures':
                return <Ratings userId={userId} />;
            case 'Courses':
                return <Courses role={role} department={department} faculty={faculty} />;
            case 'Reports':
                return <Reports role={role} department={department} faculty={faculty} />;
            default:
                return null;
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
                <h3>Welcome, {username}!</h3>
                <p>Department: {department} ({faculty})</p>
                <p>Select an option from the menu:</p>

                <div className="d-flex flex-wrap justify-content-center mb-4">
                    {menuItems[role]?.map((item) => (
                        <button
                            key={item}
                            className={`btn btn-outline-primary m-1 ${dashboardView === item ? 'fw-bold' : ''}`}
                            onClick={() => setDashboardView(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="dashboard-content">
                    {renderComponent()}
                </div>
            </div>
        </>
    );
}

export default Dashboard;
