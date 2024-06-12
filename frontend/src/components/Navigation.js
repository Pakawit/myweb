import "./Navigation.css";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Nav, Navbar, Dropdown, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteUsers } from "../features/usersSlice";
import { deleteMedication } from "../features/medicationSlice";
import { deleteMessage } from "../features/messageSlice";
import { deleteEstimation } from "../features/estimationSlice";
import { deleteAdmin } from "../features/adminSlice";
import { setselectuser } from "../features/selectuserSlice";

function Navigation() {
  const notifications = useSelector((state) => state.notifications) || [];
  const users = useSelector((state) => state.users) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function back() {
    navigate("/");
  }

  async function handleLogout(e) {
    e.preventDefault();
    await dispatch(deleteUsers());
    await dispatch(deleteMedication());
    await dispatch(deleteMessage());
    await dispatch(deleteEstimation());
    await dispatch(deleteAdmin());
  }

  async function handleNotificationClick(notification) {
    if (notification && notification.userId) {
      const user = users.find((user) => user._id === notification.userId);
      if (user) {
        await dispatch(setselectuser(user));
        navigate("/chat");
      }
    }
  }

  return (
    <Navbar>
      <Container>
        <Button variant="outline-dark" onClick={back}>
          <i className="bi bi-chevron-left"></i>
        </Button>
        <Nav className="ms-autoNav">
          <Dropdown style={{ marginLeft: "auto" }}>
            <Dropdown.Toggle variant="outline-dark" className="mx-1" id="dropdown-basic">
              <i className="bi bi-bell"></i>
              {notifications.length > 0 && (
                <Badge pill bg="danger" style={{ marginLeft: '5px' }}>
                  {notifications.length}
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {notifications.length === 0 ? (
                <Dropdown.Item>No notifications</Dropdown.Item>
              ) : (
                notifications.map((notification) => {
                  if (!notification || !notification.userId) return null; // Skip invalid notifications
                  const user = users.find(
                    (user) => user._id === notification.userId
                  );
                  return (
                    <Dropdown.Item
                      key={notification.userId}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {user ? user.name : "Unknown User"}
                    </Dropdown.Item>
                  );
                })
              )}
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-dark" onClick={handleLogout}>
            <i className="bi bi-box-arrow-in-right"></i>
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Navigation;
