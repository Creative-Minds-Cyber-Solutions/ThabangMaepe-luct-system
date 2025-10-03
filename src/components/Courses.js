import React, { useState, useEffect } from 'react';
import api from '../api';

function Courses({ role }) {
    const [courses, setCourses] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [form, setForm] = useState({
        course_name: '',
        course_code: '',
        faculty: '',
        lecturer_id: ''
    });

    useEffect(() => {
        // fetch courses
        api.get('/courses').then(res => setCourses(res.data));

        // fetch lecturers only if PL
        if(role === 'PL') {
            api.get('/users').then(res => {
                const lects = res.data.filter(u => u.role === 'Lecturer');
                setLecturers(lects);
            });
        }
    }, [role]);

    const handleAddCourse = () => {
        api.post('/courses', form)
            .then(() => {
                alert('Course added');
                api.get('/courses').then(res => setCourses(res.data)); // refresh
            })
            .catch(err => alert('Error: ' + err.response?.data?.message || err.message));
    };

    // PRL can only view courses
    if(role !== 'PL' && role !== 'PRL') return <h4>Access Denied</h4>;

    return (
        <div>
            <h4>Courses</h4>
            <ul className="list-group mb-3">
                {courses.map(c => (
                    <li key={c.id} className="list-group-item">
                        {c.course_name} ({c.course_code}) | Faculty: {c.faculty} | Lecturer: {c.lecturer_name || 'N/A'}
                    </li>
                ))}
            </ul>

            {role === 'PL' && (
                <>
                    <h5>Add Course</h5>
                    <input
                        placeholder="Course Name"
                        className="form-control mb-1"
                        value={form.course_name}
                        onChange={e => setForm({ ...form, course_name: e.target.value })}
                    />
                    <input
                        placeholder="Course Code"
                        className="form-control mb-1"
                        value={form.course_code}
                        onChange={e => setForm({ ...form, course_code: e.target.value })}
                    />
                    <input
                        placeholder="Faculty"
                        className="form-control mb-1"
                        value={form.faculty}
                        onChange={e => setForm({ ...form, faculty: e.target.value })}
                    />
                    <select
                        className="form-select mb-1"
                        value={form.lecturer_id}
                        onChange={e => setForm({ ...form, lecturer_id: e.target.value })}
                    >
                        <option value="">Select Lecturer</option>
                        {lecturers.map(l => (
                            <option key={l.id} value={l.id}>{l.username}</option>
                        ))}
                    </select>
                    <button className="btn btn-success mt-1" onClick={handleAddCourse}>
                        Add Course
                    </button>
                </>
            )}
        </div>
    );
}

export default Courses;
