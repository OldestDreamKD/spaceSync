import React, { useState, useEffect } from "react";
import { Row, Col, Form, Button, Stack, CloseButton, Table } from "react-bootstrap";
import axios from "axios";
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker";
import "react-datepicker/dist/react-datepicker.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

const MarkerDescriptionsForm = ({ onClose, onSubmit, booked, marker }) => {
    // Retrieve username from local storage
    const username = localStorage.getItem("username");

    // States for managing form inputs
    const [date, setDate] = useState(new Date()); // Selected date for booking
    const [startTime, setStartTime] = useState("09:00"); // Start time of booking
    const [endTime, setEndTime] = useState("17:00"); // End time of booking
    const [purpose, setPurpose] = useState(""); // Booking purpose
    const [markerId, setMarkerId] = useState(""); // Marker ID
    const [collaborators, setCollaborators] = useState([]); // List of available collaborators
    const [selectedCollaborators, setSelectedCollaborators] = useState([]); // Selected collaborators
    const [currentMarkerBookings, setCurrentMarkerBookings] = useState([]); // Current bookings for the marker
    const [error, setError] = useState(null); // Error message
    const [loading, setLoading] = useState(true); // Loading state for async calls

    // Initialize form fields with the booked data if provided
    useEffect(() => {
        if (booked) {
            setDate(new Date(booked.bookingDate.split("/").reverse().join("-"))); // Convert date to correct format
            setStartTime(booked.hoursReserved.startTime);
            setEndTime(booked.hoursReserved.endTime);
            setPurpose(booked.purpose);
            setSelectedCollaborators(booked.collaborators || []);
            setMarkerId(booked.marker);
        }
    }, [booked]);

    // Set marker ID if not using an existing booking
    useEffect(() => {
        if (!booked) {
            setMarkerId(marker._id);
        }
    }, [marker]);

    // Fetch collaborators and bookings data from the server
    const getCollaborators = async () => {
        try {
            setLoading(true); // Set loading state

            // Fetch data from the server
            const response = await axios.get("https://workspacemapper.onrender.com/api/booking/");

            // Extract users excluding the current user
            const users = response.data.username.filter((e) => e !== username);
            setCollaborators(users);

            // Retrieve current marker bookings
            const retrievedBookings = response.data.bookingsCustom.filter((e) => e.marker === markerId);
            setCurrentMarkerBookings(booked ? retrievedBookings.filter((e) => e._id !== booked._id) : retrievedBookings);
        } catch (error) {
            console.error("Error fetching collaborators:", error);
        } finally {
            setTimeout(() => setLoading(false), 200); // Add a small delay for smoother UI
        }
    };

    // Fetch data when marker or markerId changes
    useEffect(() => {
        getCollaborators();
    }, [marker, markerId]);

    // Check for time overlap with existing bookings
    const isTimeOverlap = (existingBookings, newStart, newEnd, newBookingDate, markerId) => {
        const toMinutes = (time) => {
            const [hours, minutes] = time.split(":").map(Number);
            return hours * 60 + minutes;
        };

        const newStartMinutes = toMinutes(newStart);
        const newEndMinutes = toMinutes(newEnd);

        return existingBookings.some((booking) => {
            const { startTime, endTime } = booking.hoursReserved;

            // Check only for bookings on the same marker and date
            if (booking.marker === markerId && booking.bookingDate === newBookingDate) {
                const existingStartMinutes = toMinutes(startTime);
                const existingEndMinutes = toMinutes(endTime);

                // Check for any overlap
                return (
                    (newStartMinutes < existingEndMinutes && newStartMinutes >= existingStartMinutes) ||
                    (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
                    (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
                );
            }
            return false;
        });
    };

    // Handle collaborator selection
    const handleCollaboratorSelection = (e) => {
        const value = e.target.value;
        setSelectedCollaborators((prev) =>
            e.target.checked
                ? [...prev, value] // Add collaborator if checked
                : prev.filter((collaborator) => collaborator !== value) // Remove collaborator if unchecked
        );
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedDate = date.toLocaleDateString("en-GB");

        if (isTimeOverlap(currentMarkerBookings, startTime, endTime, formattedDate, markerId)) {
            setError("Time overlap detected. Please choose a different time.");
        } else {
            // Prepare form data
            const formData = {
                username,
                markerId,
                bookingDate: formattedDate,
                hoursReserved: { startTime, endTime },
                purpose,
                collaborators: selectedCollaborators,
                ...(booked && { _id: booked._id }), // Include booking ID if editing
            };
            onSubmit(formData); // Call parent onSubmit handler
            onClose(); // Close the modal
        }
    };

    return (
        <div className="modal-overlay">
            <Stack gap={2} className="modal-content">
                {loading ? (
                    <div className="loading-spinner fw-bold">Loading...</div>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        {/* Modal Header */}
                        <div className="d-flex align-items-start justify-content-between mb-3">
                            <h5>Add Marker Descriptions</h5>
                            <CloseButton onClick={onClose} />
                        </div>

                        {/* Date Picker */}
                        <Form.Group as={Row} className="mb-3" controlId="formDate">
                            <Form.Label column sm={5}><b>Date:</b></Form.Label>
                            <Col sm={7}>
                                <DatePicker
                                    selected={date}
                                    minDate={new Date()}
                                    onChange={setDate}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-2">
                            <Form.Label column sm={5}><b>Working hours:</b></Form.Label>
                            <Form.Label column sm={7}> 09:00 - 17:00</Form.Label>
                        </Form.Group>
                        {/* Time Pickers for Start and End */}
                        <Form.Group as={Row} className="mb-3 ms-1" controlId="formStartTime">
                            <Form.Label column sm={5}><b>Start Hours:</b></Form.Label>
                            <Col sm={7}>
                                <TimePicker
                                    onChange={setStartTime}
                                    value={startTime}
                                    disableClock
                                    minTime="09:00"
                                    maxTime="17:00"
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3 ms-1" controlId="formEndTime">
                            <Form.Label column sm={5}><b>End Hours:</b></Form.Label>
                            <Col sm={7}>
                                <TimePicker
                                    onChange={setEndTime}
                                    value={endTime}
                                    disableClock
                                    minTime="09:00"
                                    maxTime="17:00"
                                />
                            </Col>
                        </Form.Group>

                        {/* Purpose Input */}
                        <Form.Group as={Row} className="mb-3" controlId="formPurpose">
                            <Form.Label column sm={5}><b>Purpose:</b></Form.Label>
                            <Col sm={7}>
                                <Form.Control
                                    type="text"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    placeholder="E.g., Meeting, Event, etc."
                                    required
                                    autoComplete="off"
                                />
                            </Col>
                        </Form.Group>

                        {/* Collaborators Selection */}
                        <Form.Group as={Row} className="mb-3" controlId="formCollaborators">
                            <Form.Label column sm={5}><b>Collaborators:</b></Form.Label>
                            <Col sm={7}>
                                {collaborators.map((user, index) => (
                                    <Form.Check
                                        key={index}
                                        type="checkbox"
                                        label={user}
                                        value={user}
                                        onChange={handleCollaboratorSelection}
                                        checked={selectedCollaborators.includes(user)}
                                    />
                                ))}
                            </Col>
                        </Form.Group>

                        {/* Error Message */}
                        {error && (
                            <div className="p-2 mb-2 text-danger bg-danger-subtle border rounded-3 text-center">{error}</div>
                        )}

                        {/* Submit Button */}
                        <Button type="submit" className="w-100 btn-dark mb-2">
                            Book Resource
                        </Button>

                        {/* Current Bookings Table */}
                        {currentMarkerBookings.length > 0 && (
                            <div>
                                <div className="fw-bold mb-2">Current Bookings</div>
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Booked by</th>
                                            <th>Date</th>
                                            <th>From</th>
                                            <th>End</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentMarkerBookings.map((booking, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{booking.username}</td>
                                                <td>{booking.bookingDate}</td>
                                                <td>{booking.hoursReserved.startTime}</td>
                                                <td>{booking.hoursReserved.endTime}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Form>
                )}
            </Stack>
        </div>
    );
};

export default MarkerDescriptionsForm;