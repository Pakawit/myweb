import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button, Container, Row, Col, Modal } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { addMessage, fetchMessagesThunk } from "../features/messageSlice";
import { removeChatNotificationThunk } from "../features/chatnotificationSlice";

function Chat() {
  const { API_BASE_URL } = useContext(AppContext);
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.message) || [];
  const selectuser = useSelector((state) => state.selectuser) || {};
  const chatnotification = useSelector((state) => state.chatnotification) || [];
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showStickersModal, setShowStickersModal] = useState(false);

  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
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

  const scrollToBottom = () =>
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (selectuser) {
      const fetchMessages = () =>
        dispatch(fetchMessagesThunk({ from: "admin", to: selectuser._id }));
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 3000);
      return () => clearInterval(intervalId);
    }
  }, [dispatch, selectuser]);

  useEffect(() => {
    if (selectuser && chatnotification.length > 0) {
      const notification = chatnotification.find(
        (n) => n.from === selectuser._id
      );
      if (notification && previousSelectUser.current !== selectuser._id) {
        dispatch(removeChatNotificationThunk(selectuser._id));
        previousSelectUser.current = selectuser._id;
      }
    }
  }, [chatnotification, selectuser, dispatch]);

  useEffect(scrollToBottom, [messages]);

  const validateImg = (e) => {
    const file = e.target.files[0];
    if (file?.size >= 3048576) {
      alert("Max file size is 3MB");
      fileInputRef.current.value = "";
    } else {
      setImage(file);
      setMessage("Image selected");
    }
  };

  const handleStickerSelect = async (sticker) => {
    const { todayDate, time } = getCurrentTime();
    try {
      const blob = await (await fetch(`/img/${sticker}`)).blob();
      const formData = new FormData();
      formData.append("photo", blob, sticker);
      formData.append("from", "admin");
      formData.append("to", selectuser._id);
      formData.append("date", todayDate);
      formData.append("time", time);

      const res = await axios.post(`${API_BASE_URL}/chatphoto`, formData);
      dispatch(addMessage(res.data));
      scrollToBottom();
    } catch (error) {
      console.error(error);
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

        const res = await axios.post(`${API_BASE_URL}/chatphoto`, formData);
        dispatch(addMessage(res.data));
        setImage(null);
        fileInputRef.current.value = "";
      } else {
        const res = await axios.post(`${API_BASE_URL}/createmessage`, {
          content: message,
          from: "admin",
          to: selectuser._id,
          date: todayDate,
          time,
        });
        dispatch(addMessage(res.data));
      }
      setMessage("");
      scrollToBottom();
    } catch (error) {
      console.error(error);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return {
      todayDate: now.toLocaleDateString("en-GB"),
      time: now.toTimeString().slice(0, 5),
    };
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.from === "admin" && msg.to === selectuser._id) ||
      (msg.from === selectuser._id && msg.to === "admin")
  );

  return (
    <Container fluid>
      <Navigation />
      <Row>
        <Col>
          <div className="messages-output">
            {filteredMessages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.from === "admin" ? "incoming-message" : "outgoing-message"
                }
              >
                <div className="message-inner">
                  {msg.contentType === "image" ? (
                    <img
                      src={`data:image/jpeg;base64,${msg.content}`}
                      alt="Chat Image"
                      className="message-img"
                      onClick={() => {
                        setSelectedImage(msg.content);
                        setShowModal(true);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  ) : (
                    <div>{msg.content}</div>
                  )}
                  <div className="message-timestamp-left">
                    {msg.date} {msg.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <Form onSubmit={handleSubmit} className="d-flex">
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={validateImg}
            />
            <Button
              variant="outline-dark"
              onClick={() => fileInputRef.current.click()}
            >
              <i className="bi bi-image" />
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setShowStickersModal(true)}
            >
              <i className="bi bi-emoji-smile" />
            </Button>
            <Form.Control
              type="text"
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!!image}
              style={{
                backgroundColor: image ? "#DDDDDD" : "",
                fontWeight: image ? "bold" : "normal",
              }}
            />
            <Button type="submit" disabled={!message && !image}>
              <i className="bi bi-send-fill" />
            </Button>
          </Form>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton />
        <Modal.Body>
          {selectedImage && (
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="Preview"
              className="modal-img"
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showStickersModal}
        onHide={() => setShowStickersModal(false)}
      >
        <Modal.Header closeButton />
        <Modal.Body className="d-flex flex-wrap">
          {stickers.map((sticker, i) => (
            <img
              key={i}
              src={`/img/${sticker}`}
              alt={`sticker-${i}`}
              className="sticker"
              onClick={() => handleStickerSelect(sticker)}
              style={{ cursor: "pointer", width: 130, margin: 10 }}
            />
          ))}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Chat;