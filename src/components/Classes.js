import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';

function Classes({ role, userId, department, faculty, showReports }) {
    const [classes, setClasses] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [reports, setReports] = useState([]);
    const [feedback, setFeedback] = useState({});

    const authHeader = useMemo(() => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }), []);

    useEffect(() => {
        api.get('/classes', { headers: authHeader })
            .then(res => setClasses(res.data))
            .catch(err => console.error(err));

        if (role === 'Student') {
            api.get('/attendance', { headers: authHeader })
               .then(res => setAttendance(res.data.map(a => a.class_id)))
               .catch(err => console.error(err));
        }

        if (showReports) {
            api.get('/reports', { headers: authHeader })
                .then(res => {
                    const filteredReports = role === 'PRL' 
                        ? res.data.filter(r => r.department === department) 
                        : res.data;
                    setReports(filteredReports);
                })
                .catch(err => console.error(err));
        }
    }, [role, showReports, department, authHeader]);

    const handleMarkAttendance = (classId) => {
        api.post('/attendance', { class_id: classId }, { headers: authHeader })
            .then(() => setAttendance([...attendance, classId]))
            .catch(err => alert(err.response?.data?.message || err.message));
    };

    const handleFeedback = (id) => {
        if (!feedback[id]) return alert('Please enter feedback');
        api.put(`/reports/${id}/feedback`, { feedback: feedback[id] }, { headers: authHeader })
            .then(() => {
                alert('Feedback submitted');
                api.get('/reports', { headers: authHeader })
                    .then(res => setReports(role === 'PRL' 
                        ? res.data.filter(r => r.department === department) 
                        : res.data));
            });
    };

    return (
        <div>
            <h4>Classes</h4>
            {classes.length === 0 ? <p>No classes available</p> :
                <ul className="list-group mb-3">
                    {classes.map(c => (
                        <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>{c.class_name} | Venue: {c.venue} | Time: {c.scheduled_time}</div>
                            {role === 'Student' &&
                                <button
                                    className="btn btn-sm btn-success"
                                    disabled={attendance.includes(c.id)}
                                    onClick={() => handleMarkAttendance(c.id)}
                                >
                                    {attendance.includes(c.id) ? 'Attendance Marked' : 'Mark Attendance'}
                                </button>
                            }
                        </li>
                    ))}
                </ul>
            }

            {showReports && reports.length > 0 &&
                <ul className="list-group">
                    {reports.map(r => (
                        <li key={r.id} className="list-group-item">
                            Class: {r.class_name} | Lecturer: {r.lecturer_name} | Topic: {r.topic_taught} | Week: {r.week_of_reporting}
                            <div>
                                <strong>Feedback:</strong> {r.feedback || 'No feedback yet'}
                                {role === 'PRL' &&
                                    <>
                                        <input
                                            type="text"
                                            className="form-control mt-1"
                                            placeholder="Add feedback"
                                            value={feedback[r.id] || ''}
                                            onChange={e => setFeedback({ ...feedback, [r.id]: e.target.value })}
                                        />
                                        <button className="btn btn-sm btn-primary mt-1" onClick={() => handleFeedback(r.id)}>Submit</button>
                                    </>
                                }
                            </div>
                        </li>
                    ))}
                </ul>
            }
        </div>
    );
}

export default Classes;
