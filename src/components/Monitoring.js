// src/components/Monitoring.js
import React, { useState, useEffect } from 'react';
import api from '../api';

function Monitoring({ role, userId, department }) {
    const [stats, setStats] = useState({});
    const [attendanceStats, setAttendanceStats] = useState([]);
    const [reportsSummary, setReportsSummary] = useState([]);
    const [lecturerPerformance, setLecturerPerformance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        fetchDashboardStats();
        if (role !== 'Student') {
            fetchAttendanceStats();
            fetchReportsSummary();
        }
        if (role === 'PRL' || role === 'PL') {
            fetchLecturerPerformance();
        }
    }, [role, department]);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('/monitoring/dashboard');
            setStats(res.data);
        } catch (err) {
            console.error('Fetch dashboard stats error:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceStats = async () => {
        try {
            const res = await api.get('/monitoring/attendance-stats');
            setAttendanceStats(res.data);
        } catch (err) {
            console.error('Fetch attendance stats error:', err);
        }
    };

    const fetchReportsSummary = async () => {
        try {
            const res = await api.get('/monitoring/reports-summary');
            setReportsSummary(res.data);
        } catch (err) {
            console.error('Fetch reports summary error:', err);
        }
    };

    const fetchLecturerPerformance = async () => {
        try {
            const res = await api.get('/monitoring/lecturer-performance');
            setLecturerPerformance(res.data);
        } catch (err) {
            console.error('Fetch lecturer performance error:', err);
        }
    };

    const renderStudentDashboard = () => (
        <div className="row g-3">
            <div className="col-md-6">
                <div className="card text-white bg-primary">
                    <div className="card-body">
                        <h5 className="card-title">Total Classes</h5>
                        <h2 className="display-4">{stats.total_classes || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-6">
                <div className="card text-white bg-success">
                    <div className="card-body">
                        <h5 className="card-title">Attendance Marked</h5>
                        <h2 className="display-4">{stats.total_attendance || 0}</h2>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLecturerDashboard = () => (
        <div className="row g-3">
            <div className="col-md-4">
                <div className="card text-white bg-primary">
                    <div className="card-body">
                        <h5 className="card-title">My Classes</h5>
                        <h2 className="display-4">{stats.total_classes || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card text-white bg-success">
                    <div className="card-body">
                        <h5 className="card-title">Reports Submitted</h5>
                        <h2 className="display-4">{stats.total_reports || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card text-white bg-warning">
                    <div className="card-body">
                        <h5 className="card-title">Average Rating</h5>
                        <h2 className="display-4">
                            {stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : 'N/A'}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPRLDashboard = () => (
        <div className="row g-3">
            <div className="col-md-4">
                <div className="card text-white bg-primary">
                    <div className="card-body">
                        <h5 className="card-title">Total Courses</h5>
                        <h2 className="display-4">{stats.total_courses || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card text-white bg-info">
                    <div className="card-body">
                        <h5 className="card-title">Total Classes</h5>
                        <h2 className="display-4">{stats.total_classes || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card text-white bg-success">
                    <div className="card-body">
                        <h5 className="card-title">Total Reports</h5>
                        <h2 className="display-4">{stats.total_reports || 0}</h2>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPLDashboard = () => (
        <div className="row g-3">
            <div className="col-md-3">
                <div className="card text-white bg-primary">
                    <div className="card-body">
                        <h5 className="card-title">Courses</h5>
                        <h2 className="display-4">{stats.total_courses || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card text-white bg-info">
                    <div className="card-body">
                        <h5 className="card-title">Classes</h5>
                        <h2 className="display-4">{stats.total_classes || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card text-white bg-success">
                    <div className="card-body">
                        <h5 className="card-title">Reports</h5>
                        <h2 className="display-4">{stats.total_reports || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card text-white bg-warning">
                    <div className="card-body">
                        <h5 className="card-title">Lecturers</h5>
                        <h2 className="display-4">{stats.total_lecturers || 0}</h2>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAttendanceStats = () => (
        <div className="card">
            <div className="card-header">
                <h5 className="mb-0">Attendance Statistics</h5>
            </div>
            <div className="card-body">
                {attendanceStats.length === 0 ? (
                    <p className="text-muted">No attendance data available</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Class Name</th>
                                    <th>Course</th>
                                    <th>Total Registered</th>
                                    <th>Total Attended</th>
                                    <th>Attendance %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceStats.map((stat, index) => (
                                    <tr key={index}>
                                        <td>{stat.class_name}</td>
                                        <td>{stat.course_name}</td>
                                        <td>{stat.total_registered}</td>
                                        <td>{stat.total_attended}</td>
                                        <td>
                                            <span className={`badge ${
                                                stat.attendance_percentage >= 75 ? 'bg-success' :
                                                stat.attendance_percentage >= 50 ? 'bg-warning' :
                                                'bg-danger'
                                            }`}>
                                                {stat.attendance_percentage}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderLecturerPerformance = () => (
        <div className="card">
            <div className="card-header">
                <h5 className="mb-0">Lecturer Performance</h5>
            </div>
            <div className="card-body">
                {lecturerPerformance.length === 0 ? (
                    <p className="text-muted">No performance data available</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Lecturer</th>
                                    <th>Total Classes</th>
                                    <th>Total Reports</th>
                                    <th>Avg Attendance Rate</th>
                                    <th>Avg Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lecturerPerformance.map((perf, index) => (
                                    <tr key={index}>
                                        <td>{perf.username}</td>
                                        <td>{perf.total_classes || 0}</td>
                                        <td>{perf.total_reports || 0}</td>
                                        <td>
                                            {perf.avg_attendance_rate 
                                                ? `${parseFloat(perf.avg_attendance_rate).toFixed(1)}%` 
                                                : 'N/A'}
                                        </td>
                                        <td>
                                            {perf.avg_rating 
                                                ? parseFloat(perf.avg_rating).toFixed(1) 
                                                : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="monitoring-container">
            <h4>Monitoring Dashboard</h4>
            <p className="text-muted">Real-time statistics and performance metrics</p>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                </li>
                {role !== 'Student' && (
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('attendance')}
                        >
                            Attendance Stats
                        </button>
                    </li>
                )}
                {(role === 'PRL' || role === 'PL') && (
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'performance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('performance')}
                        >
                            Lecturer Performance
                        </button>
                    </li>
                )}
            </ul>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div>
                    {activeTab === 'dashboard' && (
                        <div>
                            {role === 'Student' && renderStudentDashboard()}
                            {role === 'Lecturer' && renderLecturerDashboard()}
                            {role === 'PRL' && renderPRLDashboard()}
                            {role === 'PL' && renderPLDashboard()}
                        </div>
                    )}

                    {activeTab === 'attendance' && role !== 'Student' && renderAttendanceStats()}

                    {activeTab === 'performance' && (role === 'PRL' || role === 'PL') && 
                        renderLecturerPerformance()}
                </div>
            )}
        </div>
    );
}

export default Monitoring;