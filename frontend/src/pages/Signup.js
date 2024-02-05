import React, { useState } from "react";
import { Col, Container, Form, Row, Button, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSignupUserMutation } from "../services/appApi";

function Signup() {
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signupUser, { isLoading, error }] = useSignupUserMutation();
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    signupUser({ name, password }).then(({ data }) => {
      if (data) {
        console.log(data);
        navigate("/");
      }
    });
  }

  return (
    <Container>
      <Row>
        <Col className="d-flex align-items-center justify-content-center flex-direction-column">
          <Form onSubmit={handleSignup}>
            <h1 className="text-center">Create account</h1>
            {error && <p className="alert alert-danger">{error.data}</p>}
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your UserName"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {isLoading ? <Spinner animation="grow" /> : "Signup"}
            </Button>
            <div className="py-4">
              <p className="text-center">
                Already have an account ? <Link to="/">Login</Link>
              </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Signup;
