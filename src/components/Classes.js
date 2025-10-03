import React, { useState, useEffect } from 'react';
import api from '../api';

function Classes({ role, showReports }) {
    const [classes, setClasses] = useState([]);
    const [reports, setReports] = useState([]);
    const [feedback, setFeedback] = useState({});

    useEffect(() => {
        api.get('/classes')
           .then(res => setClasses(res.data))
           .catch(err => console.error(err));

        if(showReports){
            api.get('/reports')
               .then(res => setReports(res.data))
               .catch(err => console.error(err));
        }
    }, [showReports]);

    const handleFeedback = (id) => {
        api.put(`/reports/${id}/feedback`, { feedback: feedback[id] })
           .then(() => {
               alert('Feedback submitted');
               api.get('/reports').then(res => setReports(res.data));
           })
           .catch(err => console.error(err));
    };

    return (
        <div>
            <h4>Classes</h4>
            <ul className="list-group mb-3">
                {classes.map(c => (
                    <li key={c.id} className="list-group-item">
                        {c.class_name} | Venue: {c.venue} | Time: {c.scheduled_time}
                    </li>
                ))}
            </ul>

            {showReports && (
                <>
                    <h4>Reports</h4>
                    <ul className="list-group">
                        {reports.map(r => (
                            <li key={r.id} className="list-group-item">
                                Class: {r.class_name} | Lecturer: {r.lecturer_name} | Topic: {r.topic_taught} | Week: {r.week_of_reporting}
                                <div>
                                    <strong>Feedback:</strong> {r.feedback || 'No feedback yet'}
                                    {role === 'PRL' && (
                                        <>
                                            <input
                                                type="text"
                                                className="form-control mt-1"
                                                placeholder="Add feedback"
                                                onChange={e => setFeedback({ ...feedback, [r.id]: e.target.value })}
                                            />
                                            <button
                                                className="btn btn-sm btn-primary mt-1"
                                                onClick={() => handleFeedback(r.id)}
                                            >
                                                Submit
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default Classes;
