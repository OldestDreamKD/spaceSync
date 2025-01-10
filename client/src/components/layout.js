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
  faGear,
  faUser,
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
              <Link to="/" className="text-decoration-none text-body-emphasis">
                <FontAwesomeIcon icon={faUser} className="pe-1" />
                Profile 
              </Link>
            </Nav.Item>
            {/* <Nav.Item>
              <Link
                to="/tasks"
                className="text-decoration-none text-body-emphasis"
              >
                <FontAwesomeIcon icon={faList} className="pe-1" />
                
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                to="/calendar"
                className="text-decoration-none text-body-emphasis"
              >
                <FontAwesomeIcon icon={faCalendarDays} className="pe-1" />
                Calendar
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                to="/settings"
                className="text-decoration-none text-body-emphasis"
              >
                <FontAwesomeIcon icon={faGear} className="pe-1" />
                Settings
              </Link>
            </Nav.Item> */}
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
