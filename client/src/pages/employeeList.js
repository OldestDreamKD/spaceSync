import React, { useEffect, useState } from "react";
import Layout from '../components/headerAdmin';
import axios from "axios";
import { Table, Button, Modal } from 'react-bootstrap';

const EmployeeList = () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:2000";
    const [employees, setEmployees] = useState([]);
    const [bookedList, setBookedList] = useState([]);
    const [showBookingsModal, setShowBookingsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const getEmployeesList = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/admin/users`);
            if (response.data.message.toLowerCase() === "users retrieved successfully!") {
                setEmployees(response.data.usersWithBookings);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
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
            const response = await axios.get(`${apiUrl}/api/booking/explicit`);
            const bookedResources = response.data.bookingsCustom;
            const userBookedResources = bookedResources.filter((list) => list.username === selectedUser);
            setBookedList(userBookedResources);
            setShowBookingsModal(true);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handlePrint = () => {
        const tableHTML = document.getElementById("bookingTable").outerHTML;
        const styles = `
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { text-align: center; }
                table { width: 100%; border-collapse: collapse; font-size: 14px; }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                ul { padding-left: 20px; margin: 0; }
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
        printWindow.document.write(`
            <html>
                <head>
                    <title>${selectedUser}'s Bookings</title>
                    ${styles}
                </head>
                <body>
                    <h2>${selectedUser}'s Bookings</h2>
                    <div id="printSection">${tableHTML}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.onafterprint = () => printWindow.close();
        printWindow.print();
    };

    const handleView = async (e) => {
        setSelectedUser(e.target.value);
        setShowBookingsModal(false); // Reset modal state
        await getBookedResourcesList(); // Fetch bookings
    };


    const handleRemoveUser = (username) => {
        setUserToDelete(username);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        try {
            await axios.delete(`${apiUrl}/api/admin/userDelete`, {
                params: { userName: userToDelete }
            });
            setEmployees(employees.filter(emp => emp.user.username !== userToDelete));
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <span>
            <Layout />
            <h2 className="fw-bold my-4 container">Users:</h2>
            {employees.length > 0 ? (
                <div className="container mt-3">
                    <Table responsive className="fs-5">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Booking</th>
                                <th>View Bookings</th>
                                <th>Remove User</th>
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
                                        <Button variant="dark" size="sm"
                                            value={employee.user.username}
                                            onClick={handleView}>
                                            View
                                        </Button>
                                    </td>
                                    <td>
                                        <Button variant="danger" size="sm"
                                            onClick={() => handleRemoveUser(employee.user.username)}>
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ) : (
                <div className="container mt-3">
                    <h4 className="my-4">No Users Found</h4>
                </div>
            )}

            {/* Bookings Modal */}
            <Modal
                show={showBookingsModal}
                onHide={() => {
                    setShowBookingsModal(false);
                    setSelectedUser(''); // Reset selectedUser when closing
                }}
                size="xl"
                centered
                style={{ marginLeft: '10%' }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{selectedUser}'s Bookings</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ overflowX: 'auto' }}>
                    {bookedList.length > 0 ? (
                        <Table className='fs-5' id="bookingTable" responsive style={{ width: '100%' }}>
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
                                {bookedList.map((booking, index) => (
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBookingsModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handlePrint}>
                        Print
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to remove the user: <strong>{userToDelete}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteUser}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </span >
    );
};

export default EmployeeList;