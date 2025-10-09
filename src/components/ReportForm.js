// src/components/ReportForm.js
import React, { useState, useEffect } from 'react';
import api from '../api';

function ReportForm({ lecturerId }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error('Fetch classes error:', err);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId) => {
    const selectedClass = classes.find(c => c.id === parseInt(classId));
    if (selectedClass) {
      setForm({
        ...form,
        class_id: parseInt(classId),
        total_registered: selectedClass.total_registered || 0,
        venue: selectedClass.venue || '',
        scheduled_time: selectedClass.scheduled_time || ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!form.class_id) {
      setError('Please select a class');
      return;
    }

    if (!form.week_of_reporting || !form.date_of_lecture || !form.topic_taught || !form.learning_outcomes) {
      setError('Please fill all required fields');
      return;
    }

    if (parseInt(form.actual_students) > parseInt(form.total_registered)) {
      setError('Actual students cannot exceed total registered students');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reports', {
        ...form,
        lecturer_id: lecturerId
      });
      
      setSuccess('Report submitted successfully!');
      
      // Reset form
      setForm({
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

      // Scroll to top to see success message
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Submit report error:', err);
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form-container">
      <h4>Submit Lecture Report</h4>
      <p className="text-muted">Fill in all the details about your lecture</p>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card p-3 mb-3">
          <h6 className="mb-3">Class Information</h6>
          
          <div className="mb-3">
            <label className="form-label">Select Class *</label>
            <select
              className="form-select"
              value={form.class_id}
              onChange={(e) => handleClassChange(e.target.value)}
              required
            >
              <option value="">Choose a class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.class_name} | {c.course_name} | {c.venue} | {c.scheduled_time}
                </option>
              ))}
            </select>
          </div>

          {form.class_id && (
            <div className="row">
              <div className="col-md-4">
                <label className="form-label">Total Registered Students</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.total_registered}
                  readOnly
                  disabled
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Venue</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.venue}
                  readOnly
                  disabled
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Scheduled Time</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.scheduled_time}
                  readOnly
                  disabled
                />
              </div>
            </div>
          )}
        </div>

        <div className="card p-3 mb-3">
          <h6 className="mb-3">Lecture Details</h6>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Week of Reporting *</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g., 1, 2, 3..."
                min="1"
                max="52"
                value={form.week_of_reporting}
                onChange={(e) => setForm({ ...form, week_of_reporting: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Date of Lecture *</label>
              <input
                type="date"
                className="form-control"
                value={form.date_of_lecture}
                onChange={(e) => setForm({ ...form, date_of_lecture: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Actual Number of Students Present *</label>
            <input
              type="number"
              className="form-control"
              placeholder="Number of students who attended"
              min="0"
              max={form.total_registered}
              value={form.actual_students}
              onChange={(e) => setForm({ ...form, actual_students: e.target.value })}
              required
            />
            {form.total_registered > 0 && (
              <div className="form-text">
                Maximum: {form.total_registered} students
              </div>
            )}
          </div>
        </div>

        <div className="card p-3 mb-3">
          <h6 className="mb-3">Academic Content</h6>
          
          <div className="mb-3">
            <label className="form-label">Topic Taught *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Introduction to Database Systems"
              value={form.topic_taught}
              onChange={(e) => setForm({ ...form, topic_taught: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Learning Outcomes *</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Describe what students learned and what skills they acquired..."
              value={form.learning_outcomes}
              onChange={(e) => setForm({ ...form, learning_outcomes: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Lecturer's Recommendations</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Any recommendations or observations (optional)..."
              value={form.recommendations}
              onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
            ></textarea>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !form.class_id}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle"></i> Submit Report
              </>
            )}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setForm({
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
              setError('');
              setSuccess('');
            }}
          >
            <i className="bi bi-x-circle"></i> Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportForm;