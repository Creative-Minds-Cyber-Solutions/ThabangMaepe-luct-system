// src/components/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section text-center py-5">
                <div className="container">
                    <div className="logo-container mb-4">
                        <img 
                            src="/logo-dark.png" 
                            alt="LUCT Logo" 
                            style={{ maxWidth: '180px' }}
                        />
                    </div>

                    <p className="fs-5 text-muted mb-5">
                        Connecting students, lecturers, and administrators through efficient reporting 
                        and transparent academic monitoring in the faculty of information and communication technology.
                    </p>

                    <div className="d-flex gap-3 justify-content-center">
                        <button 
                            className="btn btn-primary btn-lg px-5"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                        <button 
                            className="btn btn-outline-primary btn-lg px-5"
                            onClick={() => navigate('/register')}
                        >
                            Register
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section py-5 bg-light">
                <div className="container">
                    <h2 className="text-center mb-5">System Features</h2>
                    
                    <div className="row g-4">
                        <div className="col-md-3">
                            <div className="card h-100 text-center p-4">
                                <div className="card-body">
                                    <h5 className="card-title">Monitoring</h5>
                                    <p className="card-text">
                                        Real-time attendance tracking and performance analytics
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card h-100 text-center p-4">
                                <div className="card-body">
                                    <h5 className="card-title">Reports</h5>
                                    <p className="card-text">
                                        Comprehensive lecture reporting and documentation
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card h-100 text-center p-4">
                                <div className="card-body">
                                    <h5 className="card-title">Ratings</h5>
                                    <p className="card-text">
                                        Student feedback and lecturer performance ratings
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card h-100 text-center p-4">
                                <div className="card-body">
                                    <h5 className="card-title">Courses</h5>
                                    <p className="card-text">
                                        Course and class management for all departments
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="roles-section py-5">
                <div className="container">
                    <h2 className="text-center mb-5">User Roles</h2>
                    
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-primary">Students</h5>
                                    <ul className="list-unstyled">
                                        <li>View enrolled classes</li>
                                        <li>Mark attendance</li>
                                        <li>Rate lectures</li>
                                        <li>Monitor progress</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-success">Lecturers</h5>
                                    <ul className="list-unstyled">
                                        <li>Submit lecture reports</li>
                                        <li>View assigned classes</li>
                                        <li>Track attendance</li>
                                        <li>View ratings</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-info">Principal Lecturers</h5>
                                    <ul className="list-unstyled">
                                        <li>View department courses</li>
                                        <li>Add feedback to reports</li>
                                        <li>Monitor department stats</li>
                                        <li>Track performance</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-warning">Program Leaders</h5>
                                    <ul className="list-unstyled">
                                        <li>Manage all courses</li>
                                        <li>Assign lecturers</li>
                                        <li>View all reports</li>
                                        <li>Faculty-wide analytics</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;