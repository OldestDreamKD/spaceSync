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
  faUser,
  faList,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

export default function Layout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate("/");
  };

  return (
    <div>
      <Navbar collapseOnSelect expand="lg" className="bg-white">
        <Container>
          <Navbar.Brand>
            <Link
              to="/admindash"
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
              <Link to="/admindash" className="text-decoration-none text-body-emphasis">
                <FontAwesomeIcon icon={faLocationDot} className="pe-1" />
                Maps
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/profile" className="text-decoration-none text-body-emphasis">
                <FontAwesomeIcon icon={faUser} className="pe-1" />
                Profile
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/listall" className="text-decoration-none text-body-emphasis">
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

