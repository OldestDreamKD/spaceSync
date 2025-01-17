import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/headerAdmin';
import MarkerDetailsForm from '../components/markerdescriptionsForm';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import UpdateMarkerDetailsForm from '../components/updateMarkerDetailsForm';
import { Modal, Button } from "react-bootstrap";

const FloorMap = () => {
    // ------------------------ State Variables ------------------------

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000";
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const mapId = queryParams.get('id'); // Get the floor map ID from URL query parameters

    const mapContainerRef = useRef(null); // Reference for the map container DOM element
    const [map, setMap] = useState(null); // Leaflet map instance
    const [imageDimensions, setImageDimensions] = useState(null); // Dimensions of the map image
    const [isEditMode, setIsEditMode] = useState(false); // Toggles Edit Mode
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Controls marker details form visibility
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Controls marker details form visibility
    const [markerPin, setMarkerPin] = useState(null); // Stores the coordinates for a new marker
    const [showMarkerDeleteModal, setMarkerDeleteShowModal] = useState(false); // Controls delete confirmation modal visibility
    const [markerToDelete, setMarkerToDelete] = useState(null); // ID of the marker to be deletedconst 
    const [showMapDeleteModal, setShowMapDeleteModal] = useState(false); // Controls delete confirmation modal visibility
    const [mapToDelete, setMapToDelete] = useState(null); // ID of the marker to be deleted
    const [markerLayer, setMarkerLayer] = useState(L.layerGroup()); // Layer group for storing markers
    const [markerToEdit, setMarkerToEdit] = useState(null); // ID of the marker to be edited

    const isEditModeRef = useRef(isEditMode); // Ref to sync the latest isEditMode value

    // Sync the latest isEditMode value with the ref
    useEffect(() => {
        isEditModeRef.current = isEditMode;
    }, [isEditMode]);

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

        // Add a click handler to place markers in Edit Mode
        leafletMap.on('click', (e) => {
            if (isEditModeRef.current) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                setMarkerPin({ lat, lng });
                setIsDialogOpen(true);
            }
        });

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
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-dark btn-sm p-1 mt-1 fs-* Edit" id="${marker._id}">Edit</button>
            <button type="button" class="btn btn-dark btn-sm p-1 mt-1 fs-* Delete" id="${marker._id}">Delete</button>
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

                // Handle Edit button
                const editButton = popup.getElement().querySelector('.Edit');
                if (editButton) {
                    editButton.addEventListener('click', () => {
                        const markerId = editButton.getAttribute('id');
                        fetchMarkerDetails(markerId);
                        setIsEditDialogOpen(true);
                    });
                }

                // Handle Delete button
                const deleteButton = popup.getElement().querySelector('.Delete');
                if (deleteButton) {
                    deleteButton.addEventListener('click', () => {
                        const markerId = deleteButton.getAttribute('id');
                        setMarkerToDelete(markerId);
                        setMarkerDeleteShowModal(true)
                    });
                }
            });
        } catch (error) {
            console.error('Error fetching markers:', error);
        }
    };
    const fetchMarkerDetails = async (markerId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/marker/markerDetails`, {
                params: { markerId: markerId }
            });
            setMarkerToEdit(response.data);
        } catch (error) {
            console.error('Error fetching markers:', error);
        }
    }
    // Submit marker details form and save marker to the database
    const handleMarkerFormSubmit = async (formData) => {
        try {
            const fullMarkerData = { ...markerPin, details: formData, mapId };
            const response = await axios.post(`${apiUrl}/api/marker/upload`, fullMarkerData);

            setIsDialogOpen(false);

            if (response.data.message.toLowerCase() === 'markers succesfully saved!') {
                fetchMarkers(map); // Refresh markers after submission
            }
        } catch (error) {
            console.error('Error saving marker:', error);
        }
    };

    // Handle marker editing (to be implemented)
    const handleMarkerEditFormSubmit = async (formData) => {
        try {
            const response = await axios.put(`${apiUrl}/api/marker/update`, formData);
            if (response.data.message.toLowerCase() === 'markers succesfully updated!') {
                setIsEditDialogOpen(false);
                fetchMarkers(map);
            }
            // console.log(response.data);
        } catch (error) {
            console.error('Error saving marker:', error);
        }
    };

    // Handle marker deletion
    const handleMarkerDelete = async () => {
        try {
            const response = await axios.delete(`${apiUrl}/api/marker/delete `, {
                params: { _id: markerToDelete },
            });

            if (response.data.message.toLowerCase() === 'marker and bookings deleted successfully!') {
                setMarkerDeleteShowModal(false);
                setMarkerToDelete(null);
                fetchMarkers(map); // Refresh markers after deletion
            }
        } catch (error) {
            console.error('Error deleting marker:', error);
        }
    };

    const handleMapDelete = async () => {
        try {
            const response = await axios.delete(`${apiUrl}/api/floormaps/delete `, {
                params: { _id: mapToDelete },
            });

            if (response.data.message.toLowerCase() === 'floorMap, associated markers, and bookings deleted successfully') {
                setShowMapDeleteModal(false);
                setMapToDelete(null);
                navigate('/admindash')
            }
        } catch (error) {
            console.error('Error deleting marker:', error);
        }
    }
    // ------------------------ JSX Rendering ------------------------

    return (
        <div>
            <Layout />
            <div className="container">
                <h2 className="my-4">Edit Floor Map</h2>
                <div className="d-flex justify-content-between">

                    <button
                        className={`btn ${isEditMode ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => setIsEditMode((prev) => !prev)}
                    >
                        {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={() => { setShowMapDeleteModal(true); setMapToDelete(mapId) }}
                    >Delete Map
                    </button>
                </div>

                <div
                    ref={mapContainerRef}
                    style={{
                        width: '80vw',
                        height: '60vh',
                        marginTop: '20px',
                        border: '1px solid #ccc',
                    }}
                ></div>

                {isDialogOpen && (
                    <MarkerDetailsForm
                        onClose={() => setIsDialogOpen(false)}
                        onSubmit={handleMarkerFormSubmit}
                    />
                )}

                {showMarkerDeleteModal && (
                    <Modal show={showMarkerDeleteModal} onHide={() => setMarkerDeleteShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure you want to delete this marker?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="dark" onClick={() => { setMarkerDeleteShowModal(false); setMarkerToDelete(null) }}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={() => handleMarkerDelete()}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}

                {showMapDeleteModal && (
                    <Modal show={showMapDeleteModal} onHide={() => setShowMapDeleteModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure you want to delete this marker?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="dark" onClick={() => { setShowMapDeleteModal(false); setMapToDelete(null) }}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={() => handleMapDelete()}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}

                {isEditDialogOpen && markerToEdit && (
                    <UpdateMarkerDetailsForm
                        onClose={() => setIsEditDialogOpen(false)}
                        onSubmit={handleMarkerEditFormSubmit}
                        marker={markerToEdit}
                    />
                )}
            </div>
        </div>
    );
};

export default FloorMap;
