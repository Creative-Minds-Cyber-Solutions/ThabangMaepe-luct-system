// src/components/Reports.js
import React, { useState, useEffect } from 'react';
import api from '../api';

function Reports({ role, department, faculty }) {
    const [reports, setReports] = useState([]);
    const [feedback, setFeedback] = useState({});

    const authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    // Fetch reports on load
    useEffect(() => {
        let url = '/reports';
        const params = [];
        if (role === 'PRL') {
            params.push(`faculty=${faculty}`);
        }
        if (params.length > 0) url += '?' + params.join('&');

        api.get(url, { headers: authHeader })
            .then(res => setReports(res.data))
            .catch(err => console.error(err));
    }, [role, faculty]);

    const handleFeedback = (id) => {
        if (!feedback[id]) return alert('Please enter feedback');

        api.put(`/reports/${id}/feedback`, { feedback: feedback[id] }, { headers: authHeader })
            .then(() => {
                alert('Feedback submitted');
                // Refresh reports
                api.get('/reports', { headers: authHeader })
                    .then(res => {
                        const filtered = role === 'PRL' 
                            ? res.data.filter(r => r.faculty === faculty) 
                            : res.data;
                        setReports(filtered);
                    });
            })
            .catch(err => console.error(err));
    };

    return (
        <div>
            <h4>Lecture Reports</h4>
            {reports.length === 0 ? (
                <p>No reports available</p>
            ) : (
                <ul className="list-group">
                    {reports.map(r => (
                        <li key={r.id} className="list-group-item">
                            <div>
                                <strong>Class:</strong> {r.class_name} | <strong>Course:</strong> {r.course_name} ({r.course_code}) | <strong>Faculty:</strong> {r.faculty} <br />
                                <strong>Lecturer:</strong> {r.lecturer_name} | <strong>Date:</strong> {r.date_of_lecture} | <strong>Week:</strong> {r.week_of_reporting} <br />
                                <strong>Venue:</strong> {r.venue} | <strong>Scheduled Time:</strong> {r.scheduled_time} <br />
                                <strong>Topic Taught:</strong> {r.topic_taught} <br />
                                <strong>Learning Outcomes:</strong> {r.learning_outcomes} <br />
                                <strong>Recommendations:</strong> {r.recommendations} <br />
                                <strong>Actual Students:</strong> {r.actual_students} | <strong>Total Registered:</strong> {r.total_registered} <br />
                                <strong>Feedback:</strong> {r.feedback || 'No feedback yet'}
                            </div>

                            {(role === 'PRL' || role === 'PL') && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        className="form-control mb-1"
                                        placeholder="Add feedback"
                                        value={feedback[r.id] || ''}
                                        onChange={e => setFeedback({ ...feedback, [r.id]: e.target.value })}
                                    />
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => handleFeedback(r.id)}
                                    >
                                        Submit Feedback
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Reports;


