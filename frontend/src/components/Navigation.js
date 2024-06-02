import "./Navigation.css";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteUsers } from "../features/usersSlice";
import { deleteMedication } from "../features/medicationSlice";
import { deleteMessage } from "../features/messageSlice";
import { deleteEstimation } from "../features/estimationSlice";
import { deleteAdmin } from "../features/adminSlice";
import { removeNotification } from '../features/notificationsSlice';

function Navigation() {
  const notifications = useSelector(state => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function back() {
    await navigate("/");
  }

  async function handleLogout(e) {
    e.preventDefault();
    await dispatch(deleteUsers());
    await dispatch(deleteMedication());
    await dispatch(deleteMessage());
    await dispatch(deleteEstimation());
    await dispatch(deleteAdmin());
  }

  return (
    <div>
      <Navbar>
        <Container>
          <Button variant="outline-dark" onClick={back}>
            <i className="bi bi-chevron-left"></i>
          </Button>
          <Nav className="ms-autoNav">
            <Dropdown alignRight>
              <Dropdown.Toggle variant="outline-dark" className="mx-1">
                <i className="bi bi-bell"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {notifications.length === 0 ? (
                  <Dropdown.Item>No notifications</Dropdown.Item>
                ) : (
                  notifications.map(notification => (
                    <Dropdown.Item key={notification.id}>
                      {notification.message}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => dispatch(removeNotification(notification.id))}
                      >
                        Dismiss
                      </Button>
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="outline-dark" onClick={handleLogout}>
              <i className="bi bi-box-arrow-in-right"></i>
            </Button>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
}

export default Navigation;
