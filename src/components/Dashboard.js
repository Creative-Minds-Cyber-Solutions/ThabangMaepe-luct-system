import React, { useState, useEffect } from 'react';
import ReportForm from './ReportForm';
import Classes from './Classes';
import Ratings from './Ratings';
import Courses from './Courses';
import Navbar from './Navbar';

function Dashboard({ role, userId, username, setRole, setUserId }) {
    const [dashboardView, setDashboardView] = useState('');

    const menuItems = {
        Student: ['Monitor Classes', 'Rate Lectures'],
        Lecturer: ['Submit Report', 'Monitor Classes', 'Ratings'],
        PRL: ['Courses', 'Reports', 'Monitor Classes', 'Ratings'],
        PL: ['Courses', 'Reports', 'Monitor Classes', 'Ratings'],
    };

    useEffect(() => {
        if (role) {
            setDashboardView(menuItems[role][0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]); 

    const renderComponent = () => {
        switch (dashboardView) {
            case 'Submit Report':
                return <ReportForm lecturerId={userId} />;
            case 'Monitor Classes':
                return <Classes role={role} userId={userId} />;
            case 'Rate Lectures':
                return <Ratings userId={userId} />;
            case 'Courses':
                return <Courses role={role} />;
            case 'Reports':
                return <Classes role={role} showReports={true} />;
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

                {renderComponent()}
            </div>
        </>
    );
}

export default Dashboard;
