// src/components/Footer.js
import React from 'react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer mt-auto">
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="mb-0">
                            &copy; {currentYear} LUCT - Limkokwing University of Creative Technology
                        </p>
                    </div>
                    <div className="col-md-6 text-center text-md-end">
                        <p className="mb-0">
                            Faculty of Information and Communication Technology (FICT)
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;