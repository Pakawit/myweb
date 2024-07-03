import React, { useState, useContext } from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAdmin } from "../features/adminSlice";
import { AppContext } from "../context/appContext";

function Login() {
  const { API_BASE_URL } = useContext(AppContext);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/login`, { name, password });
      if (res.data) {
        dispatch(setAdmin(res.data));
        navigate("/");
      }
    } catch (error) {
      setError(error.response?.data || "An error occurred. Please try again.");
    }
  };

  return (
    <Container>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} md={6} lg={4}>
          <Form onSubmit={handleLogin}>
            <h2 className="mb-4 text-center">Login</h2>
            {error && <p className="alert alert-danger">{error}</p>}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your UserName"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
