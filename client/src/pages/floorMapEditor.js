import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/layout';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const FloorMapEditor = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const mapId = queryParams.get('id'); // Get the floor map ID

    const mapContainerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [imageDimensions, setImageDimensions] = useState(null); // Ensure null as the initial state
    const [isEditMode, setIsEditMode] = useState(false);

    // Toggle edit mode
    const toggleEditMode = () => {
        setIsEditMode((prevMode) => !prevMode);
    };

    useEffect(() => {
        if (mapId) {
            const img = new Image();
            img.src = mapId;
            img.onload = () => {
                setImageDimensions({ width: img.width, height: img.height });
            };
            img.onerror = () => {
                console.error(`Failed to load image with mapId: ${mapId}`);
            };
        }
    }, [mapId]);

    useEffect(() => {
        if (map || !mapContainerRef.current || !imageDimensions || !mapId) {
            return;
        }

        try {
            const bounds = [
                [0, 0],
                [imageDimensions.height, imageDimensions.width],
            ];

            const leafletMap = L.map(mapContainerRef.current, {
                center: [0, 0],
                zoom: 1,
                crs: L.CRS.Simple,
                maxZoom: 5,
                minZoom: -2,
            });

            L.imageOverlay(mapId, bounds).addTo(leafletMap);
            leafletMap.fitBounds(bounds);

            setMap(leafletMap);

            return () => {
                leafletMap.remove();
            };
        } catch (error) {
            console.error('Error initializing Leaflet map:', error);
        }
    }, [mapId, imageDimensions]);

    return (
        <div>
            <span>
                <Layout />
            </span>
            <div className="container">
                <h2 className="my-4">Edit Floor Map</h2>
                <button
                    className={`btn ${isEditMode ? 'btn-danger' : 'btn-primary'}`}
                    onClick={toggleEditMode}
                >
                    {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                </button>

                {/* Map Container */}
                <div
                    ref={mapContainerRef}
                    style={{
                        width: '80vw',
                        height: '60vh',
                        marginTop: '20px',
                        border: '1px solid #ccc',
                    }}
                ></div>
            </div>
        </div>
    );
};

export default FloorMapEditor;
