// src/pages/Layout.js
import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { Container, Nav, Navbar, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRightFromBracket,
    faList,
    faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export default function Layout() {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:2000";
    const [showProfileDeleteModal, setProfileDeleteShowModal] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState(null);
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('sessionExpiry');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate("/");
    };

    const getProfile = async () => {
        const response = await axios.get(`${apiUrl}/api/admin/user`, {
            params: { userId: localStorage.getItem('userId') }
        });
        console.log(response.data.user);
        setProfileToDelete({
            username: response.data.user.username,
            email: response.data.user.email,
            designation: response.data.user.designation,
            organization: response.data.user.organization,
            subordinates: response.data.user.subordinates,
        })
    }

    useEffect(() => {
        getProfile();
    }, [])

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`${apiUrl}/api/admin/userDelete`, {
                params: { userName: profileToDelete.username }
            });
            console.log(response.data);
            setProfileToDelete(null);
            setProfileDeleteShowModal(false);
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('sessionExpiry');
            localStorage.removeItem('userId');
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div>
            <Navbar collapseOnSelect expand="lg" className="bg-white">
                <Container>
                    <Navbar.Brand>
                        <Link
                            to="/employeedash"
                            className="text-decoration-none fw-bold text-body-emphasis"
                        >
                            SpaceSync
                        </Link>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse
                        id="responsive-navbar-nav"
                        className="d-flex justify-content-evenly"
                    >
                        <Nav.Item>
                            <Link to="/employeedash" className="text-decoration-none text-body-emphasis">
                                <FontAwesomeIcon icon={faLocationDot} className="pe-1" />
                                Maps
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/list" className="text-decoration-none text-body-emphasis">
                                <FontAwesomeIcon icon={faList} className="pe-1" />
                                Bookings
                            </Link>
                        </Nav.Item>
                        <Button variant="primary" onClick={() => { setProfileDeleteShowModal(true); getProfile() }}>
                            Account
                        </Button>
                        <Button variant="outline-dark" onClick={handleLogout}>
                            <FontAwesomeIcon
                                icon={faArrowRightFromBracket}
                                className="pe-1"
                            />
                            Logout
                        </Button>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Outlet />
            {showProfileDeleteModal && (
                <Modal show={showProfileDeleteModal} onHide={() => setProfileDeleteShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to delete your profile:<br />
                        <table className="table table-sm table-borderless mt-2">
                            <tbody>
                                <tr>
                                    <td><b>Username:</b></td>
                                    <td>{profileToDelete.username}</td>
                                </tr>
                                <tr>
                                    <td><b>Email:</b></td>
                                    <td>{profileToDelete.email}</td>
                                </tr>
                                <tr>
                                    <td><b>Organization:</b></td>
                                    <td>{profileToDelete.organization}</td>
                                </tr>
                                <tr>
                                    <td><b>Designation:</b></td>
                                    <td>{profileToDelete.designation}</td>
                                </tr>
                                <tr>
                                    <td><b>Subordinates:</b></td>
                                    <td>{profileToDelete.subordinates}</td>
                                </tr>
                            </tbody>

                        </table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="dark" onClick={() => { setProfileDeleteShowModal(false); setProfileToDelete(null) }}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={() => handleDelete()}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
}

