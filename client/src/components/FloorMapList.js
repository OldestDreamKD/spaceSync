import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FloorMapList = ({ refresh }) => { // Accept refresh as a prop
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000";
    const [floorMaps, setFloorMaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFloorMaps = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${apiUrl}/api/floormaps`);
                setFloorMaps(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Error fetching floor maps:', err);
                setError('Failed to load floor maps');
                setFloorMaps([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFloorMaps();
    }, [refresh]); // Re-fetch when refresh changes

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div>
            <h3>Uploaded Floor Maps</h3>
            <ul className="list-group">
                {floorMaps.length === 0 ? (
                    <li className="list-group-item">No floor maps available</li>
                ) : (
                    <div className="grid text-center">
                        {floorMaps.map((map) => (
                            <div className="g-col-6" key={map._id}>
                                <Link
                                    to={`/mapedit?id=${map.url}`}
                                    className="list-group-item">
                                    {map.name}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </ul>
        </div>
    );
};

export default FloorMapList;

