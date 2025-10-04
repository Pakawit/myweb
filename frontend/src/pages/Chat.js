// src/pages/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import { Form, Button, Container, Row, Col, Modal } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addMessage, setMessages } from "../features/messageSlice";
import { removeChatNotification } from "../features/chatnotificationSlice";
import config from "../config";

function Chat() {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.message);
  const selectuser = useSelector((state) => state.selectuser);
  const chatnotification = useSelector((state) => state.chatnotification);

  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showStickersModal, setShowStickersModal] = useState(false);

  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const previousMessagesLength = useRef(messages.length);
  const pollRef = useRef(null);
  const lastUserIdRef = useRef(null);

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

  const fetchMessages = async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.post(`${config.API_BASE_URL}/getmessage`, {
        from: "admin",
        to: userId,
      });
      dispatch(setMessages(response.data || []));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  // เมื่อเข้าหน้า/เปลี่ยนคนคุย: โหลดข้อความ, เคลียร์แจ้งเตือนของคนนั้น, ตั้ง polling
  useEffect(() => {
    const uid = selectuser?._id;
    if (!uid) return;

    // reset local state บางส่วนเมื่อสลับคนคุย
    setMessage("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    previousMessagesLength.current = 0;
    lastUserIdRef.current = uid;

    // เคลียร์แจ้งเตือนของ user นี้ทันที
    if (chatnotification?.[uid]) {
      dispatch(removeChatNotification(uid));
    }

    // ดึงข้อความครั้งแรก
    fetchMessages(uid).then(scrollToBottom);

    // ตั้ง polling
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(uid), 3000);

    // cleanup
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectuser?._id]); // เปลี่ยนคนคุย -> รีเฟรชทั้งหมด

  // เมื่อมีข้อความใหม่เข้ามา: scroll และเคลียร์แจ้งเตือนของคู่นี้ (ถ้ายังมี)
  useEffect(() => {
    const uid = selectuser?._id;
    if (!uid) return;

    if (messages.length > previousMessagesLength.current) {
      scrollToBottom();
      if (chatnotification?.[uid]) {
        dispatch(removeChatNotification(uid));
      }
    }
    previousMessagesLength.current = messages.length;
  }, [messages, chatnotification, selectuser?._id, dispatch]);

  const validateImg = (e) => {
    const file = e.target.files[0];
    const validTypes = ["image/jpeg", "image/png"];

    if (!validTypes.includes(file?.type)) {
      alert("Only JPG and PNG files are allowed");
      fileInputRef.current.value = "";
      return;
    }
    if (file?.size >= 3048576) {
      alert("Max file size is 3MB");
      fileInputRef.current.value = "";
      return;
    }
    setImage(file);
    setMessage("Image selected");
  };

  const getCurrentTime = () => {
    const now = new Date();
    return {
      todayDate: now.toLocaleDateString("en-GB"), // DD/MM/YYYY
      time: now.toTimeString().slice(0, 5), // HH:MM
    };
  };

  const handleStickerSelect = async (sticker) => {
    const uid = selectuser?._id;
    if (!uid) return;
    const { todayDate, time } = getCurrentTime();
    try {
      const blob = await (await fetch(`/img/${sticker}`)).blob();
      const image = new File([blob], sticker, { type: "image/png" });

      const formData = new FormData();
      formData.append("photo", image);
      formData.append("from", "admin");
      formData.append("to", uid);
      formData.append("date", todayDate);
      formData.append("time", time);

      const res = await axios.post(`${config.API_BASE_URL}/chatphoto`, formData);
      dispatch(addMessage(res.data));
    } catch (error) {
      console.error(error);
    } finally {
      setShowStickersModal(false);
      scrollToBottom();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = selectuser?._id;
    if (!uid || (!message && !image)) return;

    const { todayDate, time } = getCurrentTime();

    try {
      if (image) {
        const formData = new FormData();
        formData.append("photo", image);
        formData.append("from", "admin");
        formData.append("to", uid);
        formData.append("date", todayDate);
        formData.append("time", time);

        const res = await axios.post(`${config.API_BASE_URL}/chatphoto`, formData);
        dispatch(addMessage(res.data));
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const res = await axios.post(`${config.API_BASE_URL}/createmessage`, {
          content: message,
          from: "admin",
          to: uid,
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

  if (!selectuser?._id) {
    // ไม่มีผู้ใช้ที่เลือก
    return (
      <Container fluid>
        <Navigation />
        <Row className="mt-4">
          <Col className="text-center text-muted">กรุณาเลือกผู้ใช้ก่อนเริ่มแชท</Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Navigation />
      <Row>
        <Col>
          <div
            className="d-flex flex-column mb-3"
            style={{ overflowY: "auto", height: "80vh", border: "1px solid lightgray" }}
          >
            {messages.map((msg, i) => (
              <div
                key={`${msg._id || i}`}
                className={`d-flex ${
                  msg.from === "admin" ? "justify-content-end" : "justify-content-start"
                } my-2`}
              >
                <div
                  className="p-3 rounded"
                  style={{
                    backgroundColor: msg.from === "admin" ? "#78E378" : "#E5E5E5",
                    maxWidth: "70%",
                    fontSize: "1.2em",
                    padding: "15px 20px",
                    textAlign: "center",
                    margin: "0 15px 0 15px",
                  }}
                >
                  {msg.contentType === "image" ? (
                    <img
                      src={`data:image/jpeg;base64,${msg.content}`}
                      alt=""
                      className="img-fluid rounded"
                      onClick={() => {
                        setSelectedImage(msg.content);
                        setShowModal(true);
                      }}
                      style={{ cursor: "pointer", width: "200px", height: "auto" }}
                    />
                  ) : (
                    <div>{msg.content}</div>
                  )}
                  <div className="small text-muted mt-2">
                    {msg.date} {msg.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <Form onSubmit={handleSubmit} className="d-flex align-items-center">
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={validateImg}
            />
            <Button
              variant="outline-dark"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="bi bi-image" />
            </Button>

            <Button
              variant="outline-secondary mx-2"
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

            <Button type="submit" disabled={!message && !image} className="ms-2">
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
              className="img-fluid"
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showStickersModal}
        onHide={() => setShowStickersModal(false)}
        centered
      >
        <Modal.Header closeButton />
        <Modal.Body className="d-flex flex-wrap justify-content-center">
          {stickers.map((sticker, i) => (
            <img
              key={i}
              src={`/img/${sticker}`}
              alt={`sticker-${i}`}
              onClick={() => handleStickerSelect(sticker)}
              className="img-fluid m-1"
              style={{ cursor: "pointer", width: "85px" }}
            />
          ))}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Chat;