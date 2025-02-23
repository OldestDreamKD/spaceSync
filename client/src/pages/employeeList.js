import React, { useEffect, useState } from "react";
import Layout from '../components/headerAdmin';
import axios from "axios";
import { Table, Button, Modal } from 'react-bootstrap';

const EmployeeList = () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:2000";
    const [employees, setEmployees] = useState([]);
    const [bookedList, setBookedList] = useState([]);
    const [show, setShow] = useState(false);
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
            setShow(true);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handleView = (e) => {
        setSelectedUser(e.target.value);
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
                                        <Button variant="dark" size="sm" value={employee.user.username} onClick={handleView}>
                                            View
                                        </Button>
                                    </td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => handleRemoveUser(employee.user.username)}>
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

            {showDeleteModal && (
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to remove the user: <strong>{userToDelete}</strong>?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDeleteUser}>Delete</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </span>
    );
};

export default EmployeeList;
