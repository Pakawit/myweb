import React, { useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/appContext";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Container,
  Nav,
  Navbar,
  Dropdown,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteUsers } from "../features/usersSlice";
import { deleteMedication } from "../features/medicationSlice";
import { deleteMessage } from "../features/messageSlice";
import { deleteEstimation } from "../features/estimationSlice";
import { deleteAdmin } from "../features/adminSlice";
import { setselectuser } from "../features/selectuserSlice";
import axios from "axios";

function Navigation() {
  const location = useLocation();
  const notifications = useSelector((state) => state.notifications) || [];
  const users = useSelector((state) => state.users) || [];
  const { API_BASE_URL } = useContext(AppContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [morningReminderTime, setMorningReminderTime] = useState("");
  const [eveningReminderTime, setEveningReminderTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMedNotiSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/getmednoti`);
      const { morningTime, eveningTime } = response.data;
      setMorningReminderTime(morningTime);
      setEveningReminderTime(eveningTime);
    } catch (error) {
      setError("Error fetching mednoti settings");
      console.error("Error fetching mednoti settings:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (showModal) {
      fetchMedNotiSettings();
    }
  }, [showModal, fetchMedNotiSettings]);

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
    if (notification && notification.userId) {
      const user = users.find((user) => user._id === notification.userId);
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

  const handleSaveReminder = async () => {
    try {
      await axios.put(`${API_BASE_URL}/updatemednoti`, {
        morningTime: morningReminderTime,
        eveningTime: eveningReminderTime,
      });
      setShowModal(false);
    } catch (error) {
      setError("Error saving reminder settings");
      console.error("Error saving reminder settings:", error);
    }
  };

  const shouldHideBackButton = location.pathname === "/";

  return (
    <Navbar>
      <Container>
        <Button
          variant="outline-dark"
          onClick={back}
          style={{ visibility: shouldHideBackButton ? "hidden" : "visible" }}
        >
          <i className="bi bi-chevron-left"></i>
        </Button>
        <Nav className="ms-autoNav">
          <Button variant="outline-dark" onClick={() => setShowModal(true)}>
            <i className="bi bi-clock"></i>
          </Button>
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
                <Dropdown.Item>No notifications</Dropdown.Item>
              ) : (
                notifications.map((notification) => {
                  if (!notification || !notification.userId) return null;
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

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>ตั้งค่าการแจ้งเตือนเวลาที่รับประทานยา</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="morningReminderTime">
                <Form.Label>เวลาแจ้งเตือน (เช้า)</Form.Label>
                <Form.Control
                  type="time"
                  value={morningReminderTime}
                  onChange={(e) => setMorningReminderTime(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="eveningReminderTime" className="mt-3">
                <Form.Label>เวลาแจ้งเตือน (เย็น)</Form.Label>
                <Form.Control
                  type="time"
                  value={eveningReminderTime}
                  onChange={(e) => setEveningReminderTime(e.target.value)}
                />
              </Form.Group>
            </Form>
            {error && <p className="text-danger mt-3">{error}</p>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              ปิด
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveReminder}
              disabled={loading}
            >
              {loading ? "บันทึก..." : "บันทึก"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Navbar>
  );
}

export default Navigation;