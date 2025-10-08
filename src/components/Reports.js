import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';

function Reports({ role, department, showReports }) {
    const [reports, setReports] = useState([]);

    const authHeader = useMemo(() => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }), []);

    useEffect(() => {
        if (!showReports) return;

        api.get('/reports', { headers: authHeader })
            .then(res => {
                const filtered = role === 'PRL' 
                    ? res.data.filter(r => r.department === department) 
                    : res.data;
                setReports(filtered);
            })
            .catch(err => console.error(err));
    }, [role, department, showReports, authHeader]);

    return (
        <div>
            <h4>Reports</h4>
            {reports.length === 0 ? <p>No reports available</p> :
                <ul className="list-group">
                    {reports.map(r => (
                        <li key={r.id} className="list-group-item">
                            Class: {r.class_name} | Lecturer: {r.lecturer_name} | Topic: {r.topic_taught} | Week: {r.week_of_reporting}
                            <div>Feedback: {r.feedback || 'No feedback yet'}</div>
                        </li>
                    ))}
                </ul>
            }
        </div>
    );
}

export default Reports;



