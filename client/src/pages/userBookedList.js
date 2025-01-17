import React, { useState, useEffect } from 'react';
import { Table, Modal, Button } from "react-bootstrap";
import Layout from '../components/headerEmployee';
import axios from "axios";
import BookingForm from "../components/bookingForm"

const FloorMapManagement = () => {
    const username = localStorage.getItem("username");
    const [bookedList, setBookedList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [bookedToEdit, setbookedToEdit] = useState(null);


    const getBookedResourcesList = async () => {
        try {
            const response = await axios.get("http://localhost:2000/api/booking/explicit");
            console.log(response.data);
            const bookedResources = response.data.bookingsCustom;
            const userBookedResources = bookedResources.filter((list) => {
                return list.username === username;
            });
            console.log(userBookedResources);
            setBookedList(userBookedResources);

        } catch (error) {
            console.error("Error fetching collaborators:", error);
        }
    };

    useEffect(() => {
        getBookedResourcesList();
    }, []);

    const handleDelete = async () => {
        try {
            // console.log(bookingToDelete);
            const response = await axios.delete('http://localhost:2000/api/booking/delete', {
                params: { _id: bookingToDelete },
            });

            if (response.data.message.toLowerCase() === 'booking deleted successfully!') {
                setShowModal(false);
                setBookingToDelete(null);
                getBookedResourcesList();
            }
        } catch (error) {
            console.error('Error deleting marker:', error);
        }
    };

    const handleEdit = (booking) => {
        // console.log(booking);
        setbookedToEdit(booking);
        setIsEditDialogOpen(true);
    }

    const handleMarkerEditFormSubmit = async (formData) => {
        try {
            console.log(formData);
            const response = await axios.put('http://localhost:2000/api/booking/update', formData);
            if (response.data.message.toLowerCase() === 'bookings succesfully updated!') {
                setIsEditDialogOpen(false);
                getBookedResourcesList();
            }
        } catch (error) {
            console.error('Error saving marker:', error);
        }
    };


    return (
        <div>
            <span>
                <Layout />
            </span>
            <h2 className="fw-bold my-4 container">Current Bookings</h2>
            {
                bookedList.length > 0 && (
                    <div className='container mt-3'>
                        <Table responsive className='fs-5'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Purpose</th>
                                    <th>Map</th>
                                    <th>Marker Name</th>
                                    <th>Collaborators</th>
                                    <th>Date</th>
                                    <th>From</th>
                                    <th>End</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookedList.map((booking, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{booking.purpose}</td>
                                        <td>{booking.floorMap}</td>
                                        <td>{booking.marker.description}</td>
                                        <td>
                                            <ul>
                                                {booking.collaborators.length != 0 && booking.collaborators.map((people, index) => {
                                                    return <li key={index}>{people}</li>
                                                })}
                                                {booking.collaborators.length == 0 && (
                                                    <li key='0'>No Collaborators</li>)
                                                }
                                            </ul>
                                        </td>
                                        <td>{booking.bookingDate}</td>
                                        <td>{booking.hoursReserved.startTime}</td>
                                        <td>{booking.hoursReserved.endTime}</td>
                                        <td>
                                            <div className="d-flex ">
                                                <button type="button" onClick={() => { handleEdit(booking) }} className="btn btn-dark me-5 btn-sm fs-6" >Edit</button>
                                                <button type="button" onClick={() => { setShowModal(true); setBookingToDelete(booking._id) }} className="btn btn-danger btn-sm fs-6">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )
            }
            {bookedList.length == 0 && (
                <div className='container mt-3'>
                    <h4 className=" my-4 ">No Bookings Found</h4>
                </div>
            )}

            {isEditDialogOpen && (
                <BookingForm
                    onClose={() => setIsEditDialogOpen(false)}
                    onSubmit={handleMarkerEditFormSubmit}
                    booked={bookedToEdit}
                />
            )}

            {showModal && (
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to delete this marker?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="dark" onClick={() => { setShowModal(false); setBookingToDelete(null) }}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={() => handleDelete()}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            )
            }
        </div >
    );
};

export default FloorMapManagement;
