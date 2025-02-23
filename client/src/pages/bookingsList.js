import React, { useEffect, useState } from "react";
import Layout from '../components/headerAdmin';
import axios from "axios";
import { Table, Form, FloatingLabel, Button } from 'react-bootstrap';

const BookingList = () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:2000";
    const [bookings, setBookings] = useState([]);
    const [sortBy, setSortBy] = useState("");

    // Fetch Bookings
    const retrieveBooking = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/booking/explicit`);
            setBookings(response.data.bookingsCustom);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    // Sorting Function
    const sortBooking = (criteria) => {
        const sortedBookings = [...bookings].sort((a, b) => {
            switch (criteria) {
                case 'user':
                    return a.username.localeCompare(b.username);
                case 'marker':
                    return a.marker.details[0].description.localeCompare(b.marker.details[0].description);
                case 'map':
                    return a.floorMap.localeCompare(b.floorMap);
                case 'purpose':
                    return a.purpose.localeCompare(b.purpose);
                case 'date': {
                    const dateA = new Date(a.bookingDate.split('/').reverse().join('-'));
                    const dateB = new Date(b.bookingDate.split('/').reverse().join('-'));
                    return dateA - dateB;
                }
                case 'from':
                    return a.hoursReserved.startTime.localeCompare(b.hoursReserved.startTime);
                case 'end':
                    return a.hoursReserved.endTime.localeCompare(b.hoursReserved.endTime);
                default:
                    return 0;
            }
        });
        setBookings(sortedBookings);
    };

    useEffect(() => {
        retrieveBooking();
    }, []);

    // Print Function
    const handlePrint = () => {
        const tableHTML = document.getElementById("bookingTable").outerHTML;
        const styles = `
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { text-align: center; }
                table { width: 100%; border-collapse: collapse; font-size: 16px; }
                th, td { border: 1px solid black; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; }
                ul { padding-left: 20px; }
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
        printWindow.document.write(`<div id="printSection">${tableHTML}</div>`);
        printWindow.document.write(`</body></html>`);
        printWindow.document.close();
        printWindow.onafterprint = () => printWindow.close();
        printWindow.onbeforeunload = () => printWindow.close();
        printWindow.print();
    };

    return (
        <span>
            <Layout />
            <h2 className="fw-bold my-3 container">Bookings:</h2>

            <div className="container d-flex justify-content-between align-items-center">
                <FloatingLabel label="Sort By" className="w-25">
                    <Form.Select value={sortBy} onChange={(e) => {
                        setSortBy(e.target.value);
                        sortBooking(e.target.value);
                    }}>
                        <option value="">Select</option>
                        <option value="user">User</option>
                        <option value="marker">Marker Name</option>
                        <option value="map">Map</option>
                        <option value="purpose">Purpose</option>
                        <option value="date">Date</option>
                        <option value="from">From</option>
                        <option value="end">End</option>
                    </Form.Select>
                </FloatingLabel>

                {/* Print Button */}
                <Button variant="primary" onClick={handlePrint}>Print</Button>
            </div>

            {/* Booking Table */}
            <div className='container mt-3 overflow-auto'>
                {bookings.length > 0 ? (
                    <Table responsive className='fs-5' id="bookingTable">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Marker Name</th>
                                <th>Map</th>
                                <th>Purpose</th>
                                <th>Date</th>
                                <th>From</th>
                                <th>End</th>
                                <th>Collaborators</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{booking.username}</td>
                                    <td>{booking.marker.details[0].description}</td>
                                    <td>{booking.floorMap}</td>
                                    <td>{booking.purpose}</td>
                                    <td>{booking.bookingDate}</td>
                                    <td>{booking.hoursReserved.startTime}</td>
                                    <td>{booking.hoursReserved.endTime}</td>
                                    <td>
                                        <ul>
                                            {booking.collaborators.length !== 0
                                                ? booking.collaborators.map((people, idx) => (
                                                    <li key={idx}>{people}</li>
                                                ))
                                                : <li>No Collaborators</li>}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <p className="text-center mt-3">No bookings available</p>
                )}
            </div>
        </span>
    );
}

export default BookingList;
