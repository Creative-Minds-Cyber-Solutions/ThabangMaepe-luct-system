// src/components/Courses.js
import React, { useState, useEffect } from 'react';
import api from '../api';

function Courses({ role, department }) {
    const [courses, setCourses] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    
    // SEARCH STATE (Extra Credit)
    const [searchTerm, setSearchTerm] = useState('');
    
    const [form, setForm] = useState({
        course_name: '',
        course_code: '',
        faculty: 'FICT',
        department: '',
        lecturer_id: ''
    });

    useEffect(() => {
        fetchCourses();
        if (role === 'PL' || role === 'PRL') {
            fetchLecturers();
        }
    }, [role, department]);

    const fetchCourses = async () => {
        setLoading(true);
        setError('');

        try {
            const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
            const res = await api.get(`/courses${params}`);
            setCourses(res.data);
        } catch (err) {
            console.error('Fetch courses error:', err);
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchLecturers = async () => {
        try {
            const res = await api.get('/users/lecturers');
            setLecturers(res.data);
        } catch (err) {
            console.error('Fetch lecturers error:', err);
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();

        if (!form.course_name || !form.course_code || !form.department || !form.lecturer_id) {
            alert('Please fill all required fields');
            return;
        }

        try {
            await api.post('/courses', form);
            alert('Course added successfully!');
            setForm({
                course_name: '',
                course_code: '',
                faculty: 'FICT',
                department: '',
                lecturer_id: ''
            });
            setShowForm(false);
            fetchCourses();
        } catch (err) {
            console.error('Add course error:', err);
            alert(err.response?.data?.message || 'Failed to add course');
        }
    };

    const handleSearch = () => {
        fetchCourses();
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setTimeout(fetchCourses, 100);
    };

    if (role !== 'PL' && role !== 'PRL') {
        return (
            <div className="alert alert-warning">
                Access Denied. Only Program Leaders and Principal Lecturers can view courses.
            </div>
        );
    }

    return (
        <div className="courses-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Courses Management</h4>
                {role === 'PL' && (
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <i className="bi bi-plus-circle"></i> {showForm ? 'Cancel' : 'Add Course'}
                    </button>
                )}
            </div>

            {/* ADD COURSE FORM (PL only) */}
            {role === 'PL' && showForm && (
                <div className="card mb-3 p-3">
                    <h5>Add New Course</h5>
                    <form onSubmit={handleAddCourse}>
                        <div className="row g-2">
                            <div className="col-md-6">
                                <label className="form-label">Course Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., Database Management Systems"
                                    value={form.course_name}
                                    onChange={e => setForm({ ...form, course_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Course Code *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., DBMS301"
                                    value={form.course_code}
                                    onChange={e => setForm({ ...form, course_code: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Department *</label>
                                <select
                                    className="form-select"
                                    value={form.department}
                                    onChange={e => setForm({ ...form, department: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Software Engineering">Software Engineering</option>
                                    <option value="Business Information Technology">Business Information Technology</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Lecturer *</label>
                                <select
                                    className="form-select"
                                    value={form.lecturer_id}
                                    onChange={e => setForm({ ...form, lecturer_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Lecturer</option>
                                    {lecturers.map(lec => (
                                        <option key={lec.id} value={lec.id}>
                                            {lec.username} - {lec.department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-success">
                                    <i className="bi bi-check-circle"></i> Add Course
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* SEARCH BAR (Extra Credit) */}
            <div className="card mb-3 p-3">
                <div className="row g-2">
                    <div className="col-md-9">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by course name, code, or lecturer..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="col-md-3">
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary flex-grow-1" onClick={handleSearch}>
                                <i className="bi bi-search"></i> Search
                            </button>
                            {searchTerm && (
                                <button className="btn btn-secondary" onClick={handleClearSearch}>
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* COURSES LIST */}
            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : courses.length === 0 ? (
                <div className="alert alert-info">
                    {searchTerm 
                        ? 'No courses found matching your search.' 
                        : 'No courses available.'}
                </div>
            ) : (
                <div className="list-group">
                    {courses.map(course => (
                        <div key={course.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">
                                        {course.course_name}
                                        <span className="badge bg-primary ms-2">{course.course_code}</span>
                                    </h6>
                                    <p className="mb-1">
                                        <strong>Department:</strong> {course.department}
                                    </p>
                                    <p className="mb-0 text-muted">
                                        <strong>Lecturer:</strong> {course.lecturer_name || 'Not assigned'}
                                    </p>
                                </div>
                                <span className="badge bg-secondary">{course.faculty}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {courses.length > 0 && (
                <div className="mt-3 text-muted text-center">
                    Showing {courses.length} course(s)
                </div>
            )}
        </div>
    );
}

export default Courses;