import React, { useState, useEffect } from "react";
import { Row, Col, Form, Button, Stack, CloseButton, Table } from "react-bootstrap";
import axios from "axios";
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker";
import "react-datepicker/dist/react-datepicker.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

const MarkerDescriptionsForm = ({ onClose, onSubmit, booked, marker }) => {
    const username = localStorage.getItem("username");
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:2000";

    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [purpose, setPurpose] = useState("");
    const [markerId, setMarkerId] = useState("");
    const [collaborators, setCollaborators] = useState([]);
    const [selectedCollaborators, setSelectedCollaborators] = useState([]);
    const [currentMarkerBookings, setCurrentMarkerBookings] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (booked) {
            setDate(new Date(booked.bookingDate.split("/").reverse().join("-")));
            setStartTime(booked.hoursReserved.startTime);
            setEndTime(booked.hoursReserved.endTime);
            setPurpose(booked.purpose);
            setSelectedCollaborators(booked.collaborators || []);
            setMarkerId(booked.marker);
        }
    }, [booked]);

    useEffect(() => {
        if (!booked) {
            setMarkerId(marker._id);
        }
    }, [marker]);
    const getCollaborators = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiUrl}/api/booking/`);
            const users = response.data.username.filter((e) => e !== username);
            setCollaborators(users);

            const retrievedBookings = response.data.bookingsCustom.filter((e) => e.marker._id === markerId);
            const filteredBookings = booked
                ? retrievedBookings.filter((e) => e._id !== booked._id)
                : retrievedBookings;

            console.log(markerId)
            console.log(response)
            console.log(retrievedBookings)
            // Ensure past bookings are not removed
            console.log(filteredBookings)
            setCurrentMarkerBookings(filteredBookings);
        } catch (error) {
            console.error("Error fetching collaborators:", error);
        } finally {
            setTimeout(() => setLoading(false), 200);
        }
    };


    useEffect(() => {
        getCollaborators();
    }, [marker, markerId]);

    const isTimeOverlap = (existingBookings, newStart, newEnd, newBookingDate, markerId) => {
        const toMinutes = (time) => {
            const [hours, minutes] = time.split(":").map(Number);
            return hours * 60 + minutes;
        };

        const newStartMinutes = toMinutes(newStart);
        const newEndMinutes = toMinutes(newEnd);

        return existingBookings.some((booking) => {
            const { startTime, endTime } = booking.hoursReserved;
            const bookingMarkerId = booking.marker._id || booking.marker; // Ensure correct marker ID format
            const formattedBookingDate = new Date(booking.bookingDate.split("/").reverse().join("-"));
            const formattedNewBookingDate = new Date(newBookingDate.split("/").reverse().join("-"));

            if (bookingMarkerId === markerId && formattedBookingDate.toDateString() === formattedNewBookingDate.toDateString()) {
                const existingStartMinutes = toMinutes(startTime);
                const existingEndMinutes = toMinutes(endTime);

                return (
                    (newStartMinutes < existingEndMinutes && newStartMinutes >= existingStartMinutes) ||
                    (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
                    (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
                );
            }
            return false;
        });
    };


    const handleCollaboratorSelection = (e) => {
        const value = e.target.value;
        setSelectedCollaborators((prev) =>
            e.target.checked
                ? [...prev, value]
                : prev.filter((collaborator) => collaborator !== value)
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedDate = date.toLocaleDateString("en-GB");

        if (isTimeOverlap(currentMarkerBookings, startTime, endTime, formattedDate, markerId)) {
            setError("Time overlap detected. Please choose a different time.");
        } else {
            const formData = {
                username,
                markerId,
                bookingDate: formattedDate,
                hoursReserved: { startTime, endTime },
                purpose,
                collaborators: selectedCollaborators,
                ...(booked && { _id: booked._id }),
            };
            onSubmit(formData);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <Stack gap={2} className="modal-content">
                {loading ? (
                    <div className="loading-spinner fw-bold">Loading...</div>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        <div className="d-flex align-items-start justify-content-between mb-3">
                            <h5>Add Marker Descriptions</h5>
                            <CloseButton onClick={onClose} />
                        </div>

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

                        {error && (
                            <div className="p-2 mb-2 text-danger bg-danger-subtle border rounded-3 text-center">{error}</div>
                        )}

                        <Button type="submit" className="w-100 btn-dark mb-2">
                            Book Resource
                        </Button>

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