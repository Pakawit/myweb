import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Container,
  Nav,
  Navbar,
  Dropdown,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteUsers } from "../features/usersSlice";
import { deleteMedication } from "../features/medicationSlice";
import { deleteMessage } from "../features/messageSlice";
import { deleteEstimation } from "../features/estimationSlice";
import { deleteAdmin } from "../features/adminSlice";
import { setselectuser } from "../features/selectuserSlice";
import { fetchNotificationsThunk } from "../features/notificationsSlice";

function Navigation() {
  const location = useLocation();
  const notifications = useSelector((state) => state.notifications) || [];
  const users = useSelector((state) => state.users) || [];
  const selectuser = useSelector((state) => state.selectuser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchNotificationsThunk());
    const intervalId = setInterval(() => {
      dispatch(fetchNotificationsThunk());
    }, 3000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const back = () => {
    navigate("/");
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await Promise.all([
        dispatch(deleteUsers()),
        dispatch(deleteMedication()),
        dispatch(deleteMessage()),
        dispatch(deleteEstimation()),
        dispatch(deleteAdmin()),
      ]);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification && notification.from) {
      const user = users.find((user) => user._id === notification.from);
      if (user) {
        try {
          dispatch(setselectuser(user));
          navigate("/chat");
        } catch (error) {
          console.error("Error handling notification click:", error);
        }
      }
    }
  };

  const shouldHideBackButton = location.pathname === "/";

  return (
    <Navbar>
      <Container fluid>
        <Button
          variant="outline-dark"
          onClick={back}
          style={{ visibility: shouldHideBackButton ? "hidden" : "visible" }}
        >
          <i className="bi bi-chevron-left"></i>
        </Button>

        {selectuser && selectuser.name && (
          <Navbar.Brand className="mx-auto fw-bold custom-brand">
            {selectuser.name}
          </Navbar.Brand>
        )}

        <Nav className="ms-autoNav">
          <Dropdown style={{ marginLeft: "auto" }}>
            <Dropdown.Toggle
              variant="outline-dark"
              className="mx-1"
              id="dropdown-basic"
            >
              <i className="bi bi-bell"></i>
              {notifications.length > 0 && (
                <Badge pill bg="danger" style={{ marginLeft: "5px" }}>
                  {notifications.length}
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {notifications.length === 0 ? (
                <Dropdown.Item>ไม่มีการแจ้งเตือน</Dropdown.Item>
              ) : (
                notifications.map((notification) => {
                  if (!notification || !notification.from) return null;
                  const user = users.find(
                    (user) => user._id === notification.from
                  );
                  return (
                    <Dropdown.Item
                      key={notification.from}
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