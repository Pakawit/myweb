import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button, Container, Row, Col, Modal } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { addMessage, fetchMessagesThunk } from "../features/messageSlice";
import { removeChatNotificationThunk } from "../features/chatnotificationSlice";

function Chat() {
  const messages = useSelector((state) => state.message) || [];
  const selectuser = useSelector((state) => state.selectuser);
  const chatnotification = useSelector((state) => state.chatnotification) || [];
  const [message, setMessage] = useState("");
  const { API_BASE_URL } = useContext(AppContext);
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const dispatch = useDispatch();
  const previousSelectUser = useRef(null);

  const stickers = [
    "nurse_charactor-01.png",
    "nurse_charactor-02.png",
    "nurse_charactor-03.png",
    "nurse_charactor-04.png",
    "nurse_charactor-05.png",
    "nurse_charactor-06.png",
    "nurse_charactor-07.png",
    "nurse_charactor-08.png",
    "nurse_charactor-09.png",
    "nurse_charactor-10.png",
  ];

  useEffect(() => {
    if (selectuser) {
      dispatch(fetchMessagesThunk({ from: "admin", to: selectuser._id }));

      const intervalId = setInterval(() => {
        dispatch(fetchMessagesThunk({ from: "admin", to: selectuser._id }));
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [dispatch, selectuser]);

  useEffect(() => {
    if (selectuser && chatnotification.length > 0) {
      if (
        !previousSelectUser.current ||
        previousSelectUser.current._id !== selectuser._id
      ) {
        const notificationToRemove = chatnotification.find(
          (notification) => notification.from === selectuser._id
        );

        if (notificationToRemove) {
          dispatch(removeChatNotificationThunk(selectuser._id));
        }

        previousSelectUser.current = selectuser; // อัพเดต selectuser ที่เลือกไว้ก่อนหน้า
      }
    }
  }, [selectuser, chatnotification, dispatch]);

  const validateImg = (e) => {
    const file = e.target.files[0];
    if (file.size >= 3048576) {
      alert("Max file size is 3MB");
      fileInputRef.current.value = "";
    } else {
      setImage(file);
      setMessage("Image selected");
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

  const handleStickerSelect = async (stickerName) => {
    const { todayDate, time } = getCurrentTime();
    const stickerPath = `/img/${stickerName}`;

    try {
      const response = await fetch(stickerPath);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("photo", blob, stickerName);
      formData.append("from", "admin");
      formData.append("to", selectuser._id);
      formData.append("date", todayDate);
      formData.append("time", time);

      const res = await axios.post(`${API_BASE_URL}/chatphoto`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(addMessage(res.data));
      scrollToBottom();
    } catch (error) {
      console.error("Error handling sticker selection:", error);
    } finally {
      setShowStickersModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message && !image) return;

    const { todayDate, time } = getCurrentTime();

    try {
      if (image) {
        const formData = new FormData();
        formData.append("photo", image);
        formData.append("from", "admin");
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
        setMessage("");
        fileInputRef.current.value = "";
        scrollToBottom();
      } else {
        const res = await axios.post(`${API_BASE_URL}/createmessage`, {
          content: message,
          time,
          date: todayDate,
          from: "admin",
          to: selectuser._id,
        });

        dispatch(addMessage(res.data));
        scrollToBottom();
      }
      setMessage("");
    } catch (error) {
      console.error("Error handling form submission:", error);
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.from === "admin" && msg.to === selectuser._id) ||
      (msg.from === selectuser._id && msg.to === "admin")
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
                  message.from === "admin"
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
                ref={fileInputRef}
              />

              <Button
                variant="outline-dark"
                onClick={() => fileInputRef.current.click()}
              >
                <i className="bi bi-image"></i>
              </Button>

              <Button
                variant="outline-secondary"
                onClick={() => setShowStickersModal(true)}
              >
                <i className="bi bi-emoji-smile"></i>
              </Button>

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
                disabled={!!image}
              />

              <Button
                variant="outline-dark"
                type="submit"
                style={{
                  backgroundColor: "#DDDDD",
                  borderColor: "#DDDDD",
                }}
                disabled={!message && !image}
              >
                <i className="bi bi-send-fill"></i>
              </Button>
            </Form.Group>
          </Form>
        </Col>
      </Row>

      <Modal
        show={showStickersModal}
        onHide={() => setShowStickersModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>เลือกสติกเกอร์</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {stickers.map((sticker, idx) => (
              <img
                key={idx}
                src={`/img/${sticker}`}
                alt={`sticker-${idx}`}
                className="sticker"
                onClick={() => handleStickerSelect(sticker)}
                style={{ cursor: "pointer", width: "100px", margin: "25px" }}
              />
            ))}
          </div>
        </Modal.Body>
      </Modal>

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