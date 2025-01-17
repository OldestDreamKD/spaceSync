import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import axios from "axios";

export default function Register() {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:2000";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      username: name,
      email: email,
      password: password,
    };
    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/register`,
        formData);

      // console.log(response.data.message)
      if (response.data.message === 'Registration successful') {
        const sessionDuration = 60 * 60 * 1000; // 60 minutes
        const expiryTime = Date.now() + sessionDuration;
        localStorage.setItem('username', response.data.user);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('sessionExpiry', expiryTime);
        navigate("/employeedash");
      }
    } catch (error) {
      console.error(error); // Handle error
      setError(error);
    }
  };

  return (
    <Stack
      gap={2}
      className="col-md-5 mx-auto w-100 h-100 d-flex align-items-center justify-content-center bg1"
    >
      <Form onSubmit={handleSubmit} className="w-50 bg-white p-3 rounded-3">
        <p className="fs-4 fw-semibold">Create a TaskFlow Account</p>
        <Form.Group className="mb-3" controlId="formGroupUsername">
          <Form.Label className="mb-1 ">Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
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
          Create Account
        </Button>
      </Form>
    </Stack>
  );
}