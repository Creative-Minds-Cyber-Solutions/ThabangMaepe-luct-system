import React, { useState, useEffect } from 'react';
import api from '../api';

function ReportForm({ lecturerId }) {
    const [classes, setClasses] = useState([]);
    const [form, setForm] = useState({
        class_id: '',
        week_of_reporting: '',
        date_of_lecture: '',
        topic_taught: '',
        learning_outcomes: '',
        recommendations: '',
        actual_students: 0,
        total_registered: 0,
        venue: '',
        scheduled_time: ''
    });

    useEffect(() => {
        api.get('/classes').then(res => setClasses(res.data));
    }, []);

    const handleSubmit = () => {
        const selectedClass = classes.find(c => c.id === parseInt(form.class_id));
        if (!selectedClass) {
            alert('Please select a class');
            return;
        }
        if (form.actual_students > selectedClass.total_registered) {
            alert('Actual students cannot exceed total registered students');
            return;
        }

        api.post('/reports', { ...form, lecturer_id: lecturerId })
            .then(() => alert('Report submitted'))
            .catch(err => console.error(err));
    };

    return (
        <div>
            <h4>Submit Lecture Report</h4>

            <label>Class</label>
            <select
                className="form-select mb-2"
                onChange={e => {
                    const classId = parseInt(e.target.value);
                    const selectedClass = classes.find(c => c.id === classId);
                    setForm({
                        ...form,
                        class_id: classId,
                        total_registered: selectedClass?.total_registered || 0,
                        venue: selectedClass?.venue || '',
                        scheduled_time: selectedClass?.scheduled_time || ''
                    });
                }}
            >
                <option value="">Select Class</option>
                {classes.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.class_name} | {c.venue} | {c.scheduled_time}
                    </option>
                ))}
            </select>

            <label>Week of Reporting</label>
            <input
                type="number"
                className="form-control mb-2"
                value={form.week_of_reporting}
                onChange={e => setForm({ ...form, week_of_reporting: e.target.value })}
            />

            <label>Date of Lecture</label>
            <input
                type="date"
                className="form-control mb-2"
                value={form.date_of_lecture}
                onChange={e => setForm({ ...form, date_of_lecture: e.target.value })}
            />

            <label>Topic Taught</label>
            <input
                type="text"
                className="form-control mb-2"
                value={form.topic_taught}
                onChange={e => setForm({ ...form, topic_taught: e.target.value })}
            />

            <label>Learning Outcomes</label>
            <textarea
                className="form-control mb-2"
                value={form.learning_outcomes}
                onChange={e => setForm({ ...form, learning_outcomes: e.target.value })}
            />

            <label>Recommendations</label>
            <textarea
                className="form-control mb-2"
                value={form.recommendations}
                onChange={e => setForm({ ...form, recommendations: e.target.value })}
            />

            <label>Actual Students Present</label>
            <input
                type="number"
                className="form-control mb-2"
                value={form.actual_students}
                onChange={e => setForm({ ...form, actual_students: e.target.value })}
            />

            <label>Total Registered Students</label>
            <input
                type="number"
                className="form-control mb-2"
                value={form.total_registered}
                readOnly
            />

            <label>Venue</label>
            <input
                type="text"
                className="form-control mb-2"
                value={form.venue}
                readOnly
            />

            <label>Scheduled Time</label>
            <input
                type="text"
                className="form-control mb-2"
                value={form.scheduled_time}
                readOnly
            />

            <button className="btn btn-success mt-2" onClick={handleSubmit}>Submit Report</button>
        </div>
    );
}

export default ReportForm;
