import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { Container, Nav, Navbar, Button, Modal, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faUser,
  faList,
  faLocationDot,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export default function Layout() {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:2000";
  const navigate = useNavigate();
  const [showProfileDeleteModal, setProfileDeleteShowModal] = useState(false);
  const [profilesToDelete, setProfilesToDelete] = useState([]);
  const [actionStatus, setActionStatus] = useState({}); // Stores success messages

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sessionExpiry");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/");
  };

  const getRequests = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/waiting/requests`);
      console.log(response.data);
      setProfilesToDelete(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  const handleAction = async (profile, action) => {
    try {
      if (action === "accept") {
        const response = await axios.post(`${apiUrl}/api/auth/register`, profile);
        console.log(response.data);
        setActionStatus((prev) => ({
          ...prev,
          [profile._id]: { message: "User Approved!", variant: "success" },
        }));
      } else {
        const response = await axios.delete(`${apiUrl}/api/waiting/reject`, {
          params: profile,
        });
        console.log(response.data);
        setActionStatus((prev) => ({
          ...prev,
          [profile._id]: { message: "User Rejected!", variant: "danger" },
        }));
      }

      // Remove the profile after showing the message for 3 seconds
      setTimeout(() => {
        setProfilesToDelete((prev) => prev.filter((aprofile) => aprofile._id !== profile._id));
        setActionStatus((prev) => {
          const newState = { ...prev };
          delete newState[profile._id];
          return newState;
        });
      }, 1500);
    } catch (error) {
      console.error("Error user action:", error);
    }
  };

  return (
    <div>
      <Navbar collapseOnSelect expand="lg" className="navbar-custom">
        <Container>
          <Navbar.Brand>
            <Link to="/admindash" className="text-decoration-none fw-bold">
              SpaceSync
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav" className="d-flex justify-content-evenly">
            <Nav.Item>
              <Link to="/admindash" className="text-decoration-none">
                <FontAwesomeIcon icon={faLocationDot} className="pe-1" />
                Maps
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/profile" className="text-decoration-none">
                <FontAwesomeIcon icon={faUser} className="pe-1" />
                Profile
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/listall" className="text-decoration-none">
                <FontAwesomeIcon icon={faList} className="pe-1" />
                Bookings
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Button
                variant="link"
                onClick={() => {
                  setProfileDeleteShowModal(true);
                  getRequests();
                }}
                className="text-decoration-none"
              >
                <FontAwesomeIcon icon={faEnvelope} className="pe-1" />
                Requests
              </Button>
            </Nav.Item>
            <Button variant="outline-dark" onClick={handleLogout} >
              <FontAwesomeIcon icon={faArrowRightFromBracket} className="pe-1" />
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />

      {showProfileDeleteModal && (
        <Modal show={showProfileDeleteModal} onHide={() => setProfileDeleteShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Approve New Users</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {profilesToDelete.length > 0 ? (
              <div>
                {profilesToDelete.map((profile) => (
                  <div key={profile._id} className="mb-3 border p-2 rounded">
                    <p><b>Username:</b> {profile.username}</p>
                    <p><b>Email:</b> {profile.email}</p>
                    <p><b>Organization:</b> {profile.organization}</p>
                    <p><b>Designation:</b> {profile.designation}</p>
                    <p><b>Subordinates:</b> {profile.subordinates}</p>
                    <p><b>Password:</b> {profile.password}</p>

                    {/* Show a disappearing message instead of buttons */}
                    {actionStatus[profile._id] ? (
                      <Alert variant={actionStatus[profile._id].variant} className="text-center">
                        {actionStatus[profile._id].message}
                      </Alert>
                    ) : (
                      <>
                        <Button
                          variant="danger"
                          onClick={() => handleAction(profile, "reject")}
                          className="me-3"
                        >
                          Reject
                        </Button>
                        <Button variant="dark" onClick={() => handleAction(profile, "accept")}>
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No requests to delete.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={() => setProfileDeleteShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
