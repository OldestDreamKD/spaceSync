import React, { useState } from "react";
import { Row, Col, FloatingLabel, Form, Button, Stack, CloseButton } from "react-bootstrap";

const MarkerdescriptionsForm = ({ onClose, onSubmit }) => {
    const [descriptions, setdescriptions] = useState([{ label: "", description: "" }]);

    // Add a new description entry
    const handleAdddescription = () => {
        setdescriptions((prev) => [...prev, { label: "", description: "" }]);
    };

    const handleDeletedescription = () => {
        setdescriptions((prev) => {
            const newDescriptions = [...prev];
            // console.log(newDescriptions);
            newDescriptions.pop();
            // console.log(newDescriptions);
            return newDescriptions;
        });
    };

    // Update specific description
    const handledescriptionChange = (index, field, value) => {
        setdescriptions((prev) =>
            prev.map((description, i) => (i === index ? { ...description, [field]: value } : description))
        );
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(descriptions); // Pass data to parent or handle submission logic
        onClose(); // Close the modal
    };

    return (
        <div className="modal-overlay">
            <Stack gap={2} className="modal-content">
                <Form onSubmit={handleSubmit}>
                    <div className="d-flex align-items-start justify-content-between mb-3">
                        <h5>Add Marker descriptions</h5>
                        <CloseButton onClick={onClose} />
                    </div>

                    {/* Dynamic form fields */}
                    {descriptions.map((description, index) => (
                        <Row className="g-2 mb-3" key={index}>
                            <Col md>
                                <FloatingLabel controlId={`label-${index}`} label="Label">
                                    <Form.Control
                                        type="text"
                                        value={description.label}
                                        onChange={(e) => handledescriptionChange(index, "label", e.target.value)}
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
                                        onChange={(e) => handledescriptionChange(index, "description", e.target.value)}
                                        placeholder="Enter description"
                                        required
                                        autoComplete="off"
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md="auto">
                                <Button variant="danger" className="mx-2 my-2" onClick={handleDeletedescription}>
                                    Delete
                                </Button>
                            </Col>
                        </Row>
                    ))}

                    {/* Add description button */}
                    <Button variant="dark" onClick={handleAdddescription} className="mb-3">
                        Add description
                    </Button>

                    {/* Submit button */}
                    <Button type="submit" className="w-100 btn-dark">
                        Save Marker
                    </Button>
                </Form>
            </Stack>
        </div>
    );
};

export default MarkerdescriptionsForm;
