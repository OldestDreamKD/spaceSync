import React, { useEffect, useState } from "react";
import Layout from '../components/headerAdmin';
import axios from "axios";
import { Table, Button } from 'react-bootstrap';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [bookedList, setBookedList] = useState([]);
    const [show, setShow] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');

    const getEmployeesList = async () => {
        try {
            const response = await axios.get("https://workspacemapper.onrender.com/api/admin/users");
            if (response.data.message.toLowerCase() === "users retrieved successfully!") {
                setEmployees(response.data.usersWithBookings);
            }
        } catch (error) {
            console.error("Error fetching collaborators:", error);
        }
    };

    useEffect(() => {
        getEmployeesList();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            getBookedResourcesList();
        }
    }, [selectedUser]);

    const getBookedResourcesList = async () => {
        try {
            const response = await axios.get("https://workspacemapper.onrender.com/api/booking/explicit");
            const bookedResources = response.data.bookingsCustom;
            const userBookedResources = bookedResources.filter((list) => {
                return list.username === selectedUser;
            });
            setBookedList(userBookedResources);
            setShow(true);
        } catch (error) {
            console.error("Error fetching collaborators:", error);
        }
    };

    const handleView = (e) => {
        const employeeName = e.target.value;
        setSelectedUser(employeeName);
    };

    return (
        <span>
            <Layout />
            <h2 className="fw-bold my-4 container">Users:</h2>
            {employees.length > 0 && (
                <div className="container mt-3">
                    <Table responsive className="fs-5">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Booking</th>
                                <th>View Bookings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{employee.user.username}</td>
                                    <td>{employee.user.email}</td>
                                    <td>{employee.bookingCount}</td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={handleView}
                                            className="btn btn-dark me-5 btn-sm fs-6"
                                            value={employee.user.username}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
            {employees.length === 0 && (
                <div className="container mt-3">
                    <h4 className="my-4">No Users Found</h4>
                </div>
            )}
            {show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="fw-bold my-2 container">{selectedUser}'s Bookings: </h3>
                        <Table responsive className="fs-5">
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
                                                {booking.collaborators.length !== 0 &&
                                                    booking.collaborators.map((people, index) => (
                                                        <li key={index}>{people}</li>
                                                    ))}
                                                {booking.collaborators.length === 0 && (
                                                    <li key="0">No Collaborators</li>
                                                )}
                                            </ul>
                                        </td>
                                        <td>{booking.bookingDate}</td>
                                        <td>{booking.hoursReserved.startTime}</td>
                                        <td>{booking.hoursReserved.endTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Button variant="dark" onClick={() => setShow(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </span>
    );
};

export default EmployeeList;