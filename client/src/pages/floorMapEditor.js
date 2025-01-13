import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/layout';
import MarkerDetailsForm from '../components/markerDetailsForm';
import 'leaflet/dist/leaflet.css';
import L, { marker } from 'leaflet';
import axios from 'axios';
import DeleteConfirmationModal from '../components/deleteConfirmationModal';

const FloorMapEditor = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const mapId = queryParams.get('id'); // Get the floor map ID

    const mapContainerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [imageDimensions, setImageDimensions] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [markerPin, setMarkerPin] = useState(null);
    const isEditModeRef = useRef(isEditMode);
    const [showModal, setShowModal] = useState(false);
    const [markerToDelete, setMarkerToDelete] = useState(null);
    const [markerLayer, setMarkerLayer] = useState(L.layerGroup());

    // Sync the latest isEditMode value with the ref
    useEffect(() => {
        isEditModeRef.current = isEditMode;
    }, [isEditMode]);

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
        fetchMarkers(leafletMap);

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

    // Modify fetchMarkers function to store markers in markerLayer
    const fetchMarkers = async (leafletMap) => {
        try {
            const response = await axios.post('http://localhost:2000/api/marker/', { mapId });
            const data = response.data;
            console.log(mapId);
            console.log(data);

            // Clear previous markers from the map before adding new ones
            markerLayer.clearLayers();

            data.forEach((marker) => {
                const customIcon = L.icon({
                    iconUrl: 'https://png.pngtree.com/png-vector/20190419/ourmid/pngtree-vector-location-icon-png-image_956422.jpg',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                const popupContent = marker.details
                    .map((detail) => {
                        return `
                        <div>
                            <strong>${detail.label}: ${detail.description}</strong>
                        </div>
                    `;
                    })
                    .join('');

                const actionButtons = `
                <div class="d-flex justify-content-between">
                  <button
                    type="button"
                    class="btn btn-dark btn-sm p-1 mt-1 fs-* Edit"
                    id="${marker._id}"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="btn btn-dark btn-sm p-1 mt-1 fs-* Delete"
                    id="${marker._id}"
                  >
                    Delete
                  </button>
                </div>
              `;

                const fullPopupContent = popupContent + actionButtons;

                const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
                    .addTo(leafletMap)
                    .bindPopup(fullPopupContent);

                // Add the marker to the layer group
                markerLayer.addLayer(leafletMarker);
            });

            // Once markers are loaded, set the state with the new marker layer
            leafletMap.addLayer(markerLayer);

            leafletMap.on('popupopen', (e) => {
                const popup = e.popup;

                // Bind edit button
                const editButton = popup.getElement().querySelector('.Edit');
                if (editButton) {
                    editButton.addEventListener('click', () => {
                        const markerId = editButton.getAttribute('id');
                        handleEdit(markerId); // Handle the Edit action
                    });
                }

                // Bind delete button
                const deleteButton = popup.getElement().querySelector('.Delete');
                if (deleteButton) {
                    deleteButton.addEventListener('click', () => {
                        const markerId = deleteButton.getAttribute('id');
                        showDeleteModal(markerId); // Handle the Delete action
                    });
                }
            });
        } catch (error) {
            console.error('Error encountered:', error);
        }
    };

    // Submit marker form and update database
    const handleMarkerFormSubmit = async (formData) => {
        try {
            const fullMarkerData = { ...markerPin, details: formData, mapId };

            const response = await axios.post('http://localhost:2000/api/marker/upload', fullMarkerData);

            setIsDialogOpen(false);

            if (response.data.message.toLowerCase() === 'markers succesfully saved!'.toLowerCase()) {
                fetchMarkers(map);  // Fetch markers again after form submission
            }
        } catch (error) {
            console.error('Error saving marker:', error);
        }
    };

    const handleDelete = async (markerId) => {
        try {
            const response = await axios.post('http://localhost:2000/api/marker/delete', { _id: markerId });

            if (response.data.message.toLowerCase() === 'marker deleted successfully!'.toLowerCase()) {
                // Remove marker directly from the map (if it's already on the map)
                if (markerToDelete) {
                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker && layer.options.id === markerToDelete) {
                            map.removeLayer(layer);
                        }
                    });
                }

                setShowModal(false);
                setMarkerToDelete(null);

                // Optionally, refetch all markers to ensure state consistency
                fetchMarkers(map);
            }
        } catch (error) {
            console.error('Error deleting marker:', error);
        }
    };



    const handleEdit = async (markerId) => {
        console.log(markerId);
    }


    const showDeleteModal = (markerId) => {
        setMarkerToDelete(markerId);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setMarkerToDelete(null);
    };

    return (
        <div>
            <Layout />
            <div className="container">
                <h2 className="my-4">Edit Floor Map</h2>
                <button
                    className={`btn ${isEditMode ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => setIsEditMode((prev) => !prev)}
                >
                    {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                </button>

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
                        onSubmit={handleMarkerFormSubmit} // Pass the handler
                    />
                )}
                <DeleteConfirmationModal
                    show={showModal}
                    handleClose={handleCloseModal}
                    handleConfirmDelete={handleDelete}
                    markerId={markerToDelete}
                />
            </div>
        </div>
    );
};

export default FloorMapEditor;