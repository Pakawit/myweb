import React, {useState} from "react";
import { Button, Form, Container, Row, Col, Spinner } from "react-bootstrap";
import { useLoginUserMutation } from "../services/appApi";
import { Link, useNavigate } from "react-router-dom";


function Login() {
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loginUser, { isLoading, error }] = useLoginUserMutation();
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    loginUser({ name, password }).then(({ data }) => {
      if (data) {
        navigate("/Home");
      }
    });
  }

  return (
    <Container>
      <Row>
        <Col className="d-flex align-items-center justify-content-center flex-direction-column">
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              {error && <p className="alert alert-danger">{error.data}</p>}
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
            <Button variant="primary" type="submit">
              {isLoading ? <Spinner animation="grow" /> : "Login"}
            </Button>
            {/* <div className="py-4">
              <p className="text-center">
                Don't have an account ? <Link to="/signup">Signup</Link>
              </p>
            </div> */}
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
