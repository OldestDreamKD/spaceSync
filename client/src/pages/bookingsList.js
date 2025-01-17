import React, { useEffect, useState } from "react";
import Layout from '../components/headerAdmin';
import axios from "axios";
import { Table, Form, FloatingLabel } from 'react-bootstrap';

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [sortBy, setSortBy] = useState(""); // Track sorting criteria

    const retriveBooking = async () => {
        try {
            const response = await axios.get("https://workspacemapper.onrender.com/api/booking/explicit");
            console.log(response.data.bookingsCustom);
            const sortedBookings = response.data.bookingsCustom.sort();
            setBookings(sortedBookings);
        } catch (error) {
            console.log(error);
        }
    };

    const sortBooking = (criteria) => {
        const sortedBookings = [...bookings].sort((a, b) => {
            switch (criteria) {
                case 'user':
                    return a.username.localeCompare(b.username);
                case 'marker':
                    return a.marker.description.localeCompare(b.marker.description);
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
        setBookings(sortedBookings); // Update bookings with sorted array
    };

    const handleChange = (e) => {
        const criteria = e.target.value;
        setSortBy(criteria);
        sortBooking(criteria);
    };

    useEffect(() => {
        retriveBooking();
    }, []);

    return (
        <span>
            <Layout />
            <h2 className="fw-bold my-3 container">Bookings:</h2>
            <div className="container">
                <FloatingLabel label="Sort By" className="w-25">
                    <Form.Select value={sortBy} onChange={handleChange}>
                        <option value="">Select </option>
                        <option value="user">User</option>
                        <option value="marker">Marker Name</option>
                        <option value="map">Map</option>
                        <option value="purpose">Purpose</option>
                        <option value="date">Date</option>
                        <option value="from">From</option>
                        <option value="end">End</option>
                    </Form.Select>
                </FloatingLabel>
            </div>
            {
                bookings.length > 0 && (
                    <div className='container mt-3 overflow-auto'>
                        <Table responsive className='fs-5 '>
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
                                        <td>{booking.marker.description}</td>
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
                    </div>
                )
            }
        </span>
    );
};

export default BookingList;
