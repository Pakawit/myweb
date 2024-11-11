import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Nav, Navbar, Dropdown, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteUsers } from "../features/usersSlice";
import { deleteMedication } from "../features/medicationSlice";
import { deleteMessage } from "../features/messageSlice";
import { deleteAdmin } from "../features/adminSlice";
import { setselectuser } from "../features/selectuserSlice";
import { fetchChatNotificationThunk } from "../features/chatnotificationSlice";
import { loadPersonalnotificationData } from "../features/personalnotificationSlice";
import { loadEstimationHFSData } from "../features/estimationHFSSlice";
import { removeChatNotificationThunk } from "../features/chatnotificationSlice";
import { AppContext } from "../context/appContext";
import axios from "axios";

function Navigation() {
  const admin = useSelector((state) => state.admin);
  const chatnotification = useSelector((state) => state.chatnotification);  
  const users = useSelector((state) => state.users);
  const personal = useSelector((state) => state.personalnotification);
  const estimationHFS = useSelector((state) => state.estimationHFS);
  const dispatch = useDispatch();
  const { API_BASE_URL } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchChatNotificationThunk());
    dispatch(loadPersonalnotificationData());
    dispatch(loadEstimationHFSData());

    const intervalId = setInterval(() => {
      dispatch(fetchChatNotificationThunk());
      dispatch(loadPersonalnotificationData());
      dispatch(loadEstimationHFSData());
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
          dispatch(removeChatNotificationThunk(user._id));
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

  const totalPersonalNotifications = Object.keys(personal).length + Object.keys(estimationHFS).length;

  const shouldHideBackButton = location.pathname === "/";

  return (
    <Navbar>
      <Container fluid>
        <div className="d-flex align-items-center">
          <Button
            variant="outline-dark"
            onClick={back}
            style={{ visibility: shouldHideBackButton ? "hidden" : "visible" }}
            className="me-2"
          >
            <i className="bi bi-chevron-left"></i>
          </Button>

          {/* แสดงชื่อ admin ที่เข้าสู่ระบบ ชิดซ้าย */}
          {admin && admin.name && (
            <Navbar.Text className="border border-secondary rounded px-3 py-1 fw-bold text-secondary">
              {admin.name}
            </Navbar.Text>
          )}
        </div>

        {/* ส่วนของปุ่มอื่นๆ ชิดขวา */}
        <Nav className="ms-auto d-flex align-items-center">
          <Dropdown className="me-2">
            <Dropdown.Toggle variant="outline-dark" id="personal-notification-dropdown">
              <i className="bi bi-exclamation-triangle"></i>
              {totalPersonalNotifications > 0 && (
                <Badge pill bg="warning" style={{ marginLeft: "5px" }}>
                  {totalPersonalNotifications}
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {totalPersonalNotifications === 0 ? (
                <Dropdown.Item>ไม่มีการแจ้งเตือน</Dropdown.Item>
              ) : (
                <>
                  {Object.keys(personal).map((userId) => (
                    <Dropdown.Item key={userId} onClick={() => handlePersonalNotificationClick(userId)}>
                      แก้ไขข้อมูล {personal[userId]?.name || "Unknown"}
                    </Dropdown.Item>
                  ))}

                  {Object.keys(estimationHFS).map((estimationId) => (
                    <Dropdown.Item key={estimationId} onClick={() => handleHFSNotificationClick(estimationId)}>
                      ประเมินอาการ{" "}
                      {estimationHFS[estimationId]?.user?.name ? estimationHFS[estimationId]?.user?.name : "Unknown User"}
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
                  const user = users.find((user) => user._id === notification.from);
                  return (
                    <Dropdown.Item key={notification.from} onClick={() => handleNotificationClick(notification)}>
                      {user ? user.name : "Unknown User"}
                    </Dropdown.Item>
                  );
                })
              )}
            </Dropdown.Menu>
          </Dropdown>

          <Button variant="outline-dark" className="me-2" onClick={() => navigate("/log")}>
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