import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button, Container, Row, Col, Modal } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { addMessage, fetchMessagesThunk } from "../features/messageSlice";
import { removeNotificationThunk } from "../features/notificationsSlice";

function Chat() {
  const messages = useSelector((state) => state.message) || [];
  const admin = useSelector((state) => state.admin);
  const selectuser = useSelector((state) => state.selectuser);
  const notifications = useSelector((state) => state.notifications) || [];
  const [message, setMessage] = useState("");
  const { API_BASE_URL } = useContext(AppContext);
  const messageEndRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectuser) {
      dispatch(fetchMessagesThunk({ from: admin._id, to: selectuser._id }));

      const intervalId = setInterval(() => {
        dispatch(fetchMessagesThunk({ from: admin._id, to: selectuser._id }));
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [dispatch, selectuser, admin._id]);

  useEffect(() => {
    if (selectuser && notifications.length > 0) {
      // ตรวจสอบว่า `selectuser._id` มีการแจ้งเตือนอยู่จริงหรือไม่
      const notificationToRemove = notifications.find(
        (notification) => notification.from === selectuser._id
      );
      if (notificationToRemove) {
        dispatch(removeNotificationThunk(selectuser._id));
      }
    }
  }, [selectuser, notifications, dispatch]);

  const validateImg = (e) => {
    const file = e.target.files[0];
    if (file.size >= 3048576) {
      alert("Max file size is 3MB");
    } else {
      setImage(file);
      setMessage("Image selected"); // Display a message in the input field
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentTime = () => {
    const date = new Date();
    return {
      todayDate: date.toLocaleDateString("en-GB"),
      time: date.toTimeString().slice(0, 5),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message && !image) return;

    const { todayDate, time } = getCurrentTime();

    try {
      if (image) {
        const formData = new FormData();
        formData.append("photo", image);
        formData.append("from", admin._id);
        formData.append("to", selectuser._id);
        formData.append("date", todayDate);
        formData.append("time", time);

        const res = await axios.post(`${API_BASE_URL}/chatphoto`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        dispatch(addMessage(res.data));
        setImage(null);
        setMessage(""); // Clear message input after sending the image
      } else {
        const res = await axios.post(`${API_BASE_URL}/createmessage`, {
          content: message,
          time,
          date: todayDate,
          from: admin._id,
          to: selectuser._id,
        });

        dispatch(addMessage(res.data));
      }
      setMessage("");
    } catch (error) {
      console.error("Error handling form submission:", error);
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.from === admin._id && msg.to === selectuser._id) ||
      (msg.from === selectuser._id && msg.to === admin._id)
  );

  const handleShowModal = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  return (
    <Container fluid>
      <Navigation />
      <Row>
        <Col>
          <div className="messages-output">
            {filteredMessages.map((message, index) => (
              <div
                key={index}
                className={
                  message.from === admin._id
                    ? "incoming-message"
                    : "outgoing-message"
                }
              >
                <div className="message-inner">
                  {message.contentType === "image" ? (
                    <img
                      src={`data:image/jpeg;base64,${message.content}`}
                      alt=""
                      className="message-img"
                      onClick={() => handleShowModal(message.content)}
                      style={{ cursor: "pointer" }}
                    />
                  ) : (
                    <div>{message.content}</div>
                  )}
                  <div className="message-timestamp-left">
                    {message.date} {message.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group style={{ display: "flex" }}>
              <input
                style={{ display: "none" }}
                type="file"
                id="image-upload"
                hidden
                accept="image/png, image/jpeg"
                onChange={validateImg}
              />
              <label htmlFor="image-upload">
                <div className="img">
                  <i className="bi bi-image"></i>
                </div>
              </label>

              <Form.Control
                type="text"
                placeholder="Your message"
                value={message}
                style={{
                  backgroundColor: "#DDDDDD",
                  color: image ? "green" : "black",
                  fontWeight: image ? "bold" : "normal",
                }}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!!image} // Disable input while image is selected
              />

              <Button
                variant="outline-dark"
                type="submit"
                style={{
                  backgroundColor: "#DDDDD",
                  borderColor: "#DDDDD",
                }}
                disabled={!message && !image} // Disable submit button if no message or image
              >
                <i className="bi bi-send-fill"></i>
              </Button>
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton />
        <Modal.Body>
          {selectedImage && (
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="Detailed view"
              className="modal-img"
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Chat;