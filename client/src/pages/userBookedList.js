import React, { useState, useEffect } from 'react';
import { Table, Modal, Button } from "react-bootstrap";
import Layout from '../components/headerEmployee';
import axios from "axios";
import BookingForm from "../components/bookingForm"

const FloorMapManagement = () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:2000";
    const username = localStorage.getItem("username");
    const [bookedList, setBookedList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [bookedToEdit, setbookedToEdit] = useState(null);


    const getBookedResourcesList = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/booking/explicit`);
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
            console.log(bookingToDelete);
            const response = await axios.delete(`${apiUrl}/api/booking/delete`, {
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
            const response = await axios.put(`${apiUrl}/api/booking/update`, formData);
            if (response.data.message.toLowerCase() === 'bookings succesfully updated!') {
                setIsEditDialogOpen(false);
                getBookedResourcesList();
            }
        } catch (error) {
            console.error('Error saving marker:', error);
        }
    };

    const handlePrint = () => {
        const styles = `
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { text-align: center; }
                table { width: 100%; border-collapse: collapse; font-size: 16px; }
                th, td { border: 1px solid black; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; }
                ul { padding-left: 20px; }
                .no-print { display: none !important; }
                @media print {
                    body { visibility: hidden; }
                    #printSection { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
                }
            </style>
        `;

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Popup blocked! Please allow popups for this site.");
            return;
        }
        printWindow.document.write(`<html><head><title>Print Bookings</title>${styles}</head><body>`);
        printWindow.document.write(`<h2>Booking List</h2>`);
        printWindow.document.write(`<div id="printSection">${document.getElementById("bookingTable").outerHTML}</div>`);
        printWindow.document.write(`</body></html>`);
        printWindow.document.close();
        printWindow.onafterprint = () => printWindow.close();
        printWindow.onbeforeunload = () => printWindow.close();
        printWindow.print();
    };

    return (
        <div>
            <span>
                <Layout />
            </span>
            <span className='d-flex justify-content-between align-items-center container'>
                <h2 className="fw-bold my-4 ">Bookings:</h2>
                <Button variant="primary" onClick={handlePrint}>Print</Button>
            </span>

            {
                bookedList.length > 0 && (
                    <div className='container mt-2'>
                        <Table responsive className='fs-5' id="bookingTable">
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
                                    <th className="no-print">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookedList.map((booking, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{booking.purpose}</td>
                                        <td>{booking.floorMap}</td>
                                        <td>{booking.marker.details[0].description}</td>
                                        <td>
                                            <ul>
                                                {booking.collaborators.length !== 0 && booking.collaborators.map((people, index) => {
                                                    return <li key={index}>{people}</li>
                                                })}
                                                {booking.collaborators.length === 0 && (
                                                    <li key='0'>No Collaborators</li>)
                                                }
                                            </ul>
                                        </td>
                                        <td>{booking.bookingDate}</td>
                                        <td>{booking.hoursReserved.startTime}</td>
                                        <td>{booking.hoursReserved.endTime}</td>
                                        <td className="no-print">
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
            {bookedList.length === 0 && (
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
