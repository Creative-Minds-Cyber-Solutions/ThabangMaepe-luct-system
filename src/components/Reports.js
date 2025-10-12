// src/components/Reports.js
import React, { useState, useEffect } from 'react';
import api from '../api';

function Reports({ role, department, faculty }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        week: '',
        date_from: '',
        date_to: ''
    });

    useEffect(() => {
        fetchReports();
    }, [role, department]);

    const fetchReports = async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filters.week) params.append('week', filters.week);
            if (filters.date_from) params.append('date_from', filters.date_from);
            if (filters.date_to) params.append('date_to', filters.date_to);

            const res = await api.get(`/reports?${params.toString()}`);
            setReports(res.data);
        } catch (err) {
            console.error('Fetch reports error:', err);
            setError('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchReports();
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilters({ week: '', date_from: '', date_to: '' });
        setTimeout(fetchReports, 100);
    };

    const handleFeedbackSubmit = async (reportId) => {
        if (!feedback[reportId]?.trim()) {
            alert('Please enter feedback');
            return;
        }

        try {
            await api.put(`/reports/${reportId}/feedback`, {
                feedback: feedback[reportId]
            });
            alert('Feedback submitted successfully');
            setFeedback({ ...feedback, [reportId]: '' });
            fetchReports();
        } catch (err) {
            console.error('Submit feedback error:', err);
            alert(err.response?.data?.message || 'Failed to submit feedback');
        }
    };

    const handleExportExcel = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.date_from) params.append('date_from', filters.date_from);
            if (filters.date_to) params.append('date_to', filters.date_to);

            const response = await api.get(`/reports/export?${params.toString()}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `lecture-reports-${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Excel export error:', err);
            alert('Failed to export reports');
        }
    };

    return (
        <div className="reports-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Lecture Reports</h4>
                <button
                    className="btn btn-success btn-sm"
                    onClick={handleExportExcel}
                >
                    Export to Excel
                </button>
            </div>

            <div className="card mb-3 p-3">
                <div className="row g-2">
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by course, topic, lecturer..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="col-md-2">
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Week"
                            value={filters.week}
                            onChange={e => setFilters({ ...filters, week: e.target.value })}
                        />
                    </div>
                    <div className="col-md-2">
                        <input
                            type="date"
                            className="form-control"
                            value={filters.date_from}
                            onChange={e => setFilters({ ...filters, date_from: e.target.value })}
                            title="From Date"
                        />
                    </div>
                    <div className="col-md-2">
                        <input
                            type="date"
                            className="form-control"
                            value={filters.date_to}
                            onChange={e => setFilters({ ...filters, date_to: e.target.value })}
                            title="To Date"
                        />
                    </div>
                </div>
                <div className="mt-2">
                    <button className="btn btn-primary btn-sm me-2" onClick={handleSearch}>
                        Search
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handleClearFilters}>
                        Clear Filters
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : reports.length === 0 ? (
                <div className="alert alert-info">
                    No reports found. {searchTerm && 'Try adjusting your search criteria.'}
                </div>
            ) : (
                <div className="list-group">
                    {reports.map(report => (
                        <div key={report.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 className="mb-1">
                                        <span className="badge bg-primary me-2">Week {report.week_of_reporting}</span>
                                        {report.course_name} ({report.course_code})
                                    </h6>
                                    <p className="mb-1">
                                        <strong>Class:</strong> {report.class_name} | <strong>Lecturer:</strong> {report.lecturer_name}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()} | <strong>Venue:</strong> {report.venue} | <strong>Time:</strong> {report.scheduled_time}
                                    </p>
                                </div>
                                <span className="badge bg-success">
                                    {report.actual_students}/{report.total_registered} students
                                </span>
                            </div>

                            <div className="mb-2">
                                <strong>Topic:</strong> {report.topic_taught}
                            </div>

                            <div className="mb-2">
                                <strong>Learning Outcomes:</strong>
                                <p className="mb-0 text-muted">{report.learning_outcomes}</p>
                            </div>

                            {report.recommendations && (
                                <div className="mb-2">
                                    <strong>Recommendations:</strong>
                                    <p className="mb-0 text-muted">{report.recommendations}</p>
                                </div>
                            )}

                            <div className="mt-3 pt-3 border-top">
                                <strong>Feedback:</strong>
                                {report.feedback ? (
                                    <div className="alert alert-light mb-0 mt-1">
                                        {report.feedback}
                                    </div>
                                ) : (
                                    <p className="text-muted fst-italic mb-0">No feedback yet</p>
                                )}

                                {(role === 'PRL' || role === 'PL') && (
                                    <div className="mt-2">
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Add feedback..."
                                                value={feedback[report.id] || ''}
                                                onChange={e =>
                                                    setFeedback({
                                                        ...feedback,
                                                        [report.id]: e.target.value
                                                    })
                                                }
                                            />
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleFeedbackSubmit(report.id)}
                                            >
                                                Submit Feedback
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {reports.length > 0 && (
                <div className="mt-3 text-muted text-center">
                    Showing {reports.length} report(s)
                </div>
            )}
        </div>
    );
}

export default Reports;