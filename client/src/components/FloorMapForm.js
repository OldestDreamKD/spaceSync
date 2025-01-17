import React, { useState, useEffect, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Stack from 'react-bootstrap/Stack';
import axios from 'axios';

const FloorMapForm = ({ onClose, onRefresh }) => {
    const [floorMapName, setFloorMapName] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [message, setMessage] = useState('');

    const cloudinaryRef = useRef();
    const widgetRef = useRef();

    useEffect(() => {
        cloudinaryRef.current = window.cloudinary;
        widgetRef.current = cloudinaryRef.current.createUploadWidget({
            cloudName: 'dzy3pi73d',
            uploadPreset: 'FloorPlan',
        }, function (error, result) {
            if (result.info.url) {
                setFileUrl(result.info.url);
                setMessage('File uploaded successfully');
            }
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            floorMapName,
            fileUrl,
        };

        try {
            await axios.post('https://workspacemapper.onrender.com/api/floormaps/upload', formData);
            setMessage('Floor map uploaded successfully!');
            setFloorMapName('');
            setFileUrl('');
            onClose();
            onRefresh(); // Trigger refresh in FloorMapList
        } catch (error) {
            console.error('Error uploading floor map:', error);
        }
    };

    return (
        <div className="modal-overlay">
            <Stack gap={2} className="modal-content">
                <Form onSubmit={handleSubmit}>
                    <span className="d-flex align-items-start justify-content-between">
                        <p className="fs-4 fw-semibold">Upload Floor Map</p>
                        <button type="button" className="btn" onClick={onClose}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </span>
                    <Form.Group className="mb-3">
                        <Form.Label className="mb-1">Floor Map Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={floorMapName}
                            onChange={(e) => setFloorMapName(e.target.value)}
                            required
                            autoComplete="off"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Button type="button" onClick={() => widgetRef.current.open()} className="w-100 bg-dark">
                            Upload Floor Map
                        </Button>
                        {message && <div className="mt-2">{message}</div>}
                    </Form.Group>
                    <Button type="submit" className="w-100 bg-dark">
                        Save Floor Map
                    </Button>
                </Form>
            </Stack>
        </div>
    );
};

export default FloorMapForm;
