// src/pages/Layout.js
import React from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRightFromBracket,
    faList,
    faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

export default function Layout() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('sessionExpiry');
        navigate("/");
    };

    return (
        <div>
            <Navbar collapseOnSelect expand="lg" className="bg-white">
                <Container>
                    <Navbar.Brand>
                        <Link
                            to="/"
                            className="text-decoration-none fw-bold text-body-emphasis"
                        >
                            WorkSpaceMapper
                        </Link>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse
                        id="responsive-navbar-nav"
                        className="d-flex justify-content-evenly"
                    >
                        <Nav.Item>
                            <Link to="/" className="text-decoration-none text-body-emphasis">
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
        </div>
    );
}

