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
import { deleteAdmin } from "../features/adminSlice";
import { setselectuser } from "../features/selectuserSlice";
import { fetchChatNotificationThunk } from "../features/chatnotificationSlice";
import { fetchPersonalDataThunk } from "../features/personalSlice";
import { fetchEstimationHFSThunk } from "../features/estimationHFSSlice";
import { AppContext } from "../context/appContext";
import axios from "axios";

function Navigation() {
  const admin = useSelector((state) => state.admin);
  const selectuser = useSelector((state) => state.selectuser) || {};
  const { API_BASE_URL } = useContext(AppContext);
  const location = useLocation();
  const chatnotification = useSelector((state) => state.chatnotification) || [];
  const users = useSelector((state) => state.users) || [];
  const personal = useSelector((state) => state.personal) || {};
  const estimationHFS = useSelector((state) => state.estimationHFS) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchChatNotificationThunk());
    dispatch(fetchPersonalDataThunk());
    dispatch(fetchEstimationHFSThunk());
    const intervalId = setInterval(() => {
      dispatch(fetchChatNotificationThunk());
      dispatch(fetchPersonalDataThunk());
      dispatch(fetchEstimationHFSThunk());
    }, 3000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const back = () => {
    navigate("/");
  };

  const handLog = () => {
    navigate("/log");
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await Promise.all([
        dispatch(deleteUsers()),
        dispatch(deleteMedication()),
        dispatch(deleteMessage()),
        dispatch(deleteAdmin()),
      ]);

      await axios.post(`${API_BASE_URL}/admin/logout`, {
        name: admin.name,
      });

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

  const handlePersonalNotificationClick = async (userId) => {
    if (userId && personal[userId]) {
      try {
        dispatch(setselectuser(personal[userId]));
        navigate("/personal");
      } catch (error) {
        console.error("Error handling personal notification click:", error);
      }
    }
  };

  const handleHFSNotificationClick = async (estimationId) => {
    if (estimationId && estimationHFS[estimationId]) {
      try {
        dispatch(setselectuser(estimationHFS[estimationId].user));
        navigate("/estimation");
      } catch (error) {
        console.error("Error handling HFS notification click:", error);
      }
    }
  };

  const shouldHideBackButton = location.pathname === "/";

  return (
    <Navbar>
      <Container
        fluid
        className="d-flex align-items-center justify-content-between"
      >
        <Button
          variant="outline-dark"
          onClick={back}
          style={{ visibility: shouldHideBackButton ? "hidden" : "visible" }}
          className="me-2"
        >
          <i className="bi bi-chevron-left"></i>
        </Button>

        {selectuser && selectuser.name && (
          <Navbar.Brand className="mx-auto fw-bold custom-brand">
            {selectuser.name}
          </Navbar.Brand>
        )}

        <Nav className="d-flex align-items-center">
          <Dropdown className="me-2">
            <Dropdown.Toggle
              variant="outline-dark"
              id="personal-notification-dropdown"
            >
              <i className="bi bi-exclamation-triangle"></i>
              {(Object.keys(personal).length > 0 ||
                Object.keys(estimationHFS).length > 0) && (
                <Badge pill bg="warning" style={{ marginLeft: "5px" }}>
                  {Object.keys(personal).length +
                    Object.keys(estimationHFS).length}
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.keys(personal).length === 0 &&
              Object.keys(estimationHFS).length === 0 ? (
                <Dropdown.Item>ไม่มีการแจ้งเตือน</Dropdown.Item>
              ) : (
                <>
                  {Object.keys(personal).map((userId) => (
                    <Dropdown.Item
                      key={userId}
                      onClick={() => handlePersonalNotificationClick(userId)}
                    >
                      แก้ไขข้อมูล {personal[userId]?.name || "Unknown"}
                    </Dropdown.Item>
                  ))}

                  {Object.keys(estimationHFS).map((estimationId) => (
                    <Dropdown.Item
                      key={estimationId}
                      onClick={() => handleHFSNotificationClick(estimationId)}
                    >
                      ประเมินอาการ{" "}
                      {estimationHFS[estimationId]?.user?.name
                        ? estimationHFS[estimationId]?.user?.name
                        : "Unknown User"}
                    </Dropdown.Item>
                  ))}
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown className="me-2">
            <Dropdown.Toggle variant="outline-dark" id="dropdown-basic">
              <i className="bi bi-bell"></i>
              {chatnotification.length > 0 && (
                <Badge pill bg="danger" style={{ marginLeft: "5px" }}>
                  {chatnotification.length}
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {chatnotification.length === 0 ? (
                <Dropdown.Item>ไม่มีการแจ้งเตือน</Dropdown.Item>
              ) : (
                chatnotification.map((notification) => {
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

          <Button variant="outline-dark" className="me-2" onClick={handLog}>
            <i className="bi bi-journal"></i>
          </Button>

          <Button variant="outline-dark" onClick={handleLogout}>
            <i className="bi bi-box-arrow-in-right"></i>
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Navigation;