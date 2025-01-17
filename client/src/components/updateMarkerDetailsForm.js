import React, { useState, useEffect } from "react";
import { Row, Col, FloatingLabel, Form, Button, Stack, CloseButton } from "react-bootstrap";

const UpdateMarkerDescriptionsForm = ({ onClose, onSubmit, marker }) => {
    const [descriptions, setDescriptions] = useState(marker.details || [{ label: "", description: "" }]);
    // console.log(descriptions);
    useEffect(() => {
        setDescriptions(marker.details || [{ label: "", description: "" }]);
    }, [marker]);

    const handleAddDescription = () => {
        setDescriptions((prev) => [...prev, { label: "", description: "" }]);
    };

    const handleDeleteDescription = (index) => {
        setDescriptions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDescriptionChange = (index, field, value) => {
        setDescriptions((prev) =>
            prev.map((desc, i) => (i === index ? { ...desc, [field]: value } : desc))
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const markerDetails = { _id: marker._id, details: descriptions };
        if (onSubmit) onSubmit(markerDetails);
        onClose();
    };

    const handleClose = () => {
        setDescriptions([]); // Reset descriptions
        onClose();
    };

    return (
        <div className="modal-overlay">
            <Stack gap={2} className="modal-content">
                <Form onSubmit={handleSubmit}>
                    <div className="d-flex align-items-start justify-content-between mb-3">
                        <h5>Edit Marker Descriptions</h5>
                        <CloseButton onClick={handleClose} />
                    </div>

                    {descriptions.map((description, index) => (
                        <Row className="g-2 mb-3" key={index}>
                            <Col md>
                                <FloatingLabel controlId={`label-${index}`} label="Label">
                                    <Form.Control
                                        type="text"
                                        value={description.label}
                                        onChange={(e) => handleDescriptionChange(index, "label", e.target.value)}
                                        placeholder="Enter label"
                                        required
                                        autoComplete="off"
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md>
                                <FloatingLabel controlId={`description-${index}`} label="Description">
                                    <Form.Control
                                        type="text"
                                        value={description.description}
                                        onChange={(e) => handleDescriptionChange(index, "description", e.target.value)}
                                        placeholder="Enter description"
                                        required
                                        autoComplete="off"
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md="auto">
                                <Button variant="danger" className="mx-2 my-2" onClick={() => handleDeleteDescription(index)}>
                                    Delete
                                </Button>
                            </Col>
                        </Row>
                    ))}

                    <Button variant="dark" onClick={handleAddDescription} className="mb-3">
                        Add Description
                    </Button>

                    <Button type="submit" className="w-100 btn-dark">
                        Save Marker
                    </Button>
                </Form>
            </Stack>
        </div>
    );
};

export default UpdateMarkerDescriptionsForm;
