import React, { useState, useEffect } from 'react';
import api from '../api';

function Courses({ role, userDepartment }) {
    const [courses, setCourses] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [form, setForm] = useState({
        course_name: '',
        course_code: '',
        faculty: 'FICT', // always FICT
        department: '',  // PL selects
        lecturer_id: ''
    });

    const authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    useEffect(() => {
        // Fetch courses
        api.get('/courses', { headers: authHeader })
           .then(res => {
               const filtered = (role === 'PRL') 
                   ? res.data.filter(c => c.department === userDepartment)
                   : res.data;
               setCourses(filtered);
           })
           .catch(err => console.error(err));

        // Fetch lecturers only if PL
        if(role === 'PL') {
            api.get('/users', { headers: authHeader })
               .then(res => setLecturers(res.data.filter(u => u.role === 'Lecturer')))
               .catch(err => console.error(err));
        }
    }, [role, userDepartment]);

    const handleAddCourse = () => {
        if(!form.course_name || !form.course_code || !form.department || !form.lecturer_id) {
            return alert('Please fill all fields');
        }

        api.post('/courses', form, { headers: authHeader })
            .then(() => {
                alert('Course added');
                // Refresh courses
                api.get('/courses', { headers: authHeader })
                   .then(res => setCourses(res.data));
            })
            .catch(err => alert('Error: ' + (err.response?.data?.message || err.message)));
    };

    if(role !== 'PL' && role !== 'PRL') return <h4>Access Denied</h4>;

    return (
        <div>
            <h4>Courses</h4>
            {courses.length === 0 ? (
                <p>No courses available</p>
            ) : (
                <ul className="list-group mb-3">
                    {courses.map(c => (
                        <li key={c.id} className="list-group-item">
                            {c.course_name} ({c.course_code}) | Department: {c.department} | Lecturer: {c.lecturer_name || 'N/A'}
                        </li>
                    ))}
                </ul>
            )}

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
                    <select
                        className="form-select mb-1"
                        value={form.department}
                        onChange={e => setForm({ ...form, department: e.target.value })}
                    >
                        <option value="">Select Department</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Business Information Technology">Business Information Technology</option>
                    </select>
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
