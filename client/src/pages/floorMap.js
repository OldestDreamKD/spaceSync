import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/headerEmployee';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import BookingForm from '../components/bookingForm';

const FloorMapViewer = () => {
    // ------------------------ State Variables ------------------------

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:2000";
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const mapId = queryParams.get('id'); // Get the floor map ID from URL query parameters

    const mapContainerRef = useRef(null); // Reference for the map container DOM element
    const [map, setMap] = useState(null); // Leaflet map instance
    const [imageDimensions, setImageDimensions] = useState(null); // Dimensions of the map image
    const [markerLayer, setMarkerLayer] = useState(L.layerGroup()); // Layer group for storing markers
    const [markerToBook, setMarkerToBook] = useState(null); // ID of the marker to be edited
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false); // Controls marker details form visibility

    // ------------------------ Effect Hooks ------------------------

    // Load image dimensions for the map
    useEffect(() => {
        if (mapId) {
            const img = new Image();
            img.src = mapId;
            img.onload = () => setImageDimensions({ width: img.width, height: img.height });
            img.onerror = () => console.error(`Failed to load image with mapId: ${mapId}`);
        }
    }, [mapId]);

    // Initialize Leaflet map
    useEffect(() => {
        if (map || !mapContainerRef.current || !imageDimensions || !mapId) return;

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

        fetchMarkers(leafletMap); // Fetch existing markers and add to the map

        return () => leafletMap.remove();
    }, [mapId, imageDimensions]);

    // ------------------------ Functions ------------------------

    // Fetch markers from the server and render them on the map
    const fetchMarkers = async (leafletMap) => {
        try {
            const response = await axios.get(`${apiUrl}/api/marker/`, {
                params: { mapId },
            });
            const data = response.data;

            markerLayer.clearLayers(); // Clear existing markers from the layer

            data.forEach((marker) => {
                const customIcon = L.icon({
                    iconUrl: '/resources/icon1.svg',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                const popupContent = marker.details
                    .map((detail) => `<div class="fs-6"><strong>${detail.label}:</strong> ${detail.description}</div>`)
                    .join('');

                const actionButtons = `
                    <div>
                        <button type="button" class="btn btn-dark w-100 p-1 mt-1 fs-* Book" id="${marker._id}">Book</button>
                    </div>
                `;

                const fullPopupContent = popupContent + actionButtons;

                const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
                    .bindPopup(fullPopupContent);

                markerLayer.addLayer(leafletMarker);
            });

            leafletMap.addLayer(markerLayer);

            // Attach event listeners to popup buttons
            leafletMap.on('popupopen', (e) => {
                const popup = e.popup;

                // Handle Book button
                const bookButton = popup.getElement().querySelector('.Book');
                if (bookButton) {
                    bookButton.addEventListener('click', () => {
                        const markerId = bookButton.getAttribute('id');
                        fetchMarkerBookings(markerId);
                        setIsBookingDialogOpen(true);
                    });
                }

            });
        } catch (error) {
            console.error('Error fetching markers:', error);
        }
    };

    // Fetch marker details for booking
    const fetchMarkerBookings = async (markerId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/marker/markerDetails`, {
                params: { markerId: markerId }
            });
            setMarkerToBook(response.data);
        } catch (error) {
            console.error('Error fetching markers:', error);
        }
    };

    // Handle marker editing
    const handleBookingFormSubmit = async (formData) => {
        try {
            // console.log(formData);
            const response = await axios.post(`${apiUrl}/api/booking/upload`, formData);
            if (response.data.message.toLowerCase() === 'bookings succesfully created!') {
                setIsBookingDialogOpen(false);
                fetchMarkers(map);
            }
        } catch (error) {
            console.error('Error saving marker:', error);
        }
    };

    // ------------------------ JSX Rendering ------------------------

    return (
        <div>
            <Layout />
            <div className="container">
                <h2 className="my-4">View Floor Map</h2>

                <div
                    ref={mapContainerRef}
                    style={{
                        width: '80vw',
                        height: '60vh',
                        marginTop: '20px',
                        border: '1px solid #ccc',
                    }}
                ></div>

                {isBookingDialogOpen && markerToBook && (
                    <BookingForm
                        onClose={() => setIsBookingDialogOpen(false)}
                        onSubmit={handleBookingFormSubmit}
                        marker={markerToBook}
                    />
                )}
            </div>
        </div>
    );
};

export default FloorMapViewer;