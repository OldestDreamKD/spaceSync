import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const sessionExpiry = localStorage.getItem("sessionExpiry");
    const username = localStorage.getItem("username")

    if (isLoggedIn && sessionExpiry && Date.now() < parseInt(sessionExpiry, 10) && username === 'admin') {
      navigate("/admindash");
    } else if (isLoggedIn && sessionExpiry && Date.now() < parseInt(sessionExpiry, 10)) {
      navigate("/employeedash")
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email == 'admin1@gmail.com' && password == 'admin123') {
      const sessionDuration = 60 * 60 * 1000; // 60 minutes
      const expiryTime = Date.now() + sessionDuration;
      localStorage.setItem('username', 'admin');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('sessionExpiry', expiryTime);
      navigate("/admindash");

    }
    try {
      const response = await axios.post("http://localhost:2000/api/auth/login",
        { email, password }
      );
      // console.log(response.data.message)
      if (response.data.message === 'Login successful') {
        const sessionDuration = 60 * 60 * 1000; // 60 minutes
        const expiryTime = Date.now() + sessionDuration;
        localStorage.setItem('username', response.data.user);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('sessionExpiry', expiryTime);
        navigate("/employeedash");
      }
    } catch (error) {
      // console.log(error)
      setError("error");
    }
  };

  return (
    <Stack
      gap={2}
      className="col-md-5 mx-auto w-100 h-100 d-flex align-items-center justify-content-center bg1"
    >
      <Form onSubmit={handleSubmit} className="w-50 bg-white p-3 rounded-3">
        <p className="fs-4 fw-semibold">Login to TaskFlow</p>

        <Form.Group className="mb-3" controlId="formGroupEmail">
          <Form.Label className="mb-1 ">Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formGroupPassword">
          <Form.Label className="mb-1 ">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        {error && (
          <Form.Label className="text-danger fw-semibold ">{error}</Form.Label>
        )}
        <Button type="submit" className="w-100 bg-dark">
          Login
        </Button>
        <p className="fw-light mt-2 text-center">
          Don't have an account?
          <Link to="/register" className="text-decoration-none">
            Register
          </Link>
        </p>
      </Form>
    </Stack>
  );
}
