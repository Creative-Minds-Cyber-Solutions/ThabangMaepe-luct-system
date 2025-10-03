import React, { useState, useEffect } from 'react';
import api from '../api';

function Ratings({ userId }) {
    const [classes, setClasses] = useState([]);
    const [ratings, setRatings] = useState({});

    useEffect(() => {
        api.get('/classes')
           .then(res => setClasses(res.data))
           .catch(err => console.error(err));
    }, []);

    const handleRating = (classId, value) => {
        api.post('/ratings', { user_id: userId, class_id: classId, rating: value })
           .then(() => {
               alert('Rating submitted');
               setRatings({ ...ratings, [classId]: value });
           })
           .catch(err => {
               if(err.response?.status === 403) alert('You are not authorized to rate this class');
               else console.error(err);
           });
    };

    return (
        <div className="module-container">
            <h3>Rate Lectures</h3>
            {classes.map(c => (
                <div key={c.id} className="mb-3 p-2 border rounded">
                    <strong>{c.class_name}</strong>
                    <div className="mt-2">
                        {[1,2,3,4,5].map(n => (
                            <button 
                                key={n} 
                                className={`btn btn-sm me-1 ${ratings[c.id] === n ? 'btn-success' : 'btn-outline-secondary'}`}
                                onClick={() => handleRating(c.id, n)}
                            >
                                {n}
                            </button>
                        ))}
                        {ratings[c.id] && <span className="ms-2 text-success">Rated: {ratings[c.id]}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Ratings;
