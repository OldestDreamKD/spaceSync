import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';

const FloorMapListAdmin = ({ refresh }) => {
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
    }, [refresh]);

    if (loading) return <div className="text-center"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger" className="text-center">{error}</Alert>;

    return (
        <Container>
            <h3 className="text-center my-4">Available Floor Maps</h3>
            {floorMaps.length === 0 ? (
                <Alert variant="info" className="text-center">
                    No floor maps available
                </Alert>
            ) : (
                <Row className="g-2"> {/* Reduced gap between grid items */}
                    {floorMaps.map((map) => (
                        <Col xs={12} sm={6} md={6} lg={6} key={map._id}>
                            <Link
                                to={`/mapedit?id=${map.url}`}
                                className="text-decoration-none">
                                <Card className="h-100 shadow-sm">
                                    <Card.Body className="text-center">
                                        <Card.Title className="mb-0">{map.name}</Card.Title>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default FloorMapListAdmin;
