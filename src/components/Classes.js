// src/components/Classes.js
import React, { useState, useEffect } from 'react';
import api from '../api';

function Classes({ role, userId, department, faculty }) {
    const [classes, setClasses] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // SEARCH STATE (Extra Credit)
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClasses();
        if (role === 'Student') {
            fetchAttendance();
        }
    }, [role]);

    const fetchClasses = async () => {
        setLoading(true);
        setError('');

        try {
            // Build query with search parameter
            const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
            const res = await api.get(`/classes${params}`);
            setClasses(res.data);
        } catch (err) {
            console.error('Fetch classes error:', err);
            setError('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            const res = await api.get('/attendance');
            setAttendance(res.data.map(a => a.class_id));
        } catch (err) {
            console.error('Fetch attendance error:', err);
        }
    };

    const handleMarkAttendance = async (classId) => {
        try {
            await api.post('/attendance', { class_id: classId });
            setAttendance([...attendance, classId]);
            alert('Attendance marked successfully!');
        } catch (err) {
            console.error('Mark attendance error:', err);
            alert(err.response?.data?.message || 'Failed to mark attendance');
        }
    };

    const handleSearch = () => {
        fetchClasses();
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setTimeout(fetchClasses, 100);
    };

    return (
        <div className="classes-container">
            <h4>My Classes</h4>

            {/* SEARCH BAR (Extra Credit) */}
            <div className="card mb-3 p-3">
                <div className="row g-2">
                    <div className="col-md-9">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by class name, course, venue..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="col-md-3">
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-primary flex-grow-1" 
                                onClick={handleSearch}
                            >
                                <i className="bi bi-search"></i> Search
                            </button>
                            {searchTerm && (
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={handleClearSearch}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : classes.length === 0 ? (
                <div className="alert alert-info">
                    {searchTerm 
                        ? 'No classes found matching your search.' 
                        : 'No classes available.'}
                </div>
            ) : (
                <div className="row g-3">
                    {classes.map(cls => (
                        <div key={cls.id} className="col-md-6">
                            <div className="card h-100">
                                <div className="card-header bg-primary text-white">
                                    <h6 className="mb-0">{cls.class_name}</h6>
                                </div>
                                <div className="card-body">
                                    <p className="mb-2">
                                        <strong>Course:</strong> {cls.course_name} ({cls.course_code})
                                    </p>
                                    <p className="mb-2">
                                        <strong>Lecturer:</strong> {cls.lecturer_name}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Venue:</strong> {cls.venue}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Time:</strong> {cls.scheduled_time}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Students:</strong> {cls.total_registered} registered
                                    </p>

                                    {/* Student attendance button */}
                                    {role === 'Student' && (
                                        <div className="mt-3">
                                            {attendance.includes(cls.id) ? (
                                                <button className="btn btn-success w-100" disabled>
                                                    <i className="bi bi-check-circle"></i> Attendance Marked
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-outline-success w-100"
                                                    onClick={() => handleMarkAttendance(cls.id)}
                                                >
                                                    <i className="bi bi-hand-index"></i> Mark Attendance
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Department/Faculty info for other roles */}
                                    {role !== 'Student' && cls.department && (
                                        <div className="mt-3">
                                            <span className="badge bg-secondary">
                                                {cls.department}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {classes.length > 0 && (
                <div className="mt-3 text-muted text-center">
                    Showing {classes.length} class(es)
                </div>
            )}
        </div>
    );
}

export default Classes;