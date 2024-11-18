import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button, Container, Row, Col, Modal } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { addMessage, setMessages } from "../features/messageSlice";
import { removeChatNotification } from '../features/chatnotificationSlice';

function Chat() {
  const { API_BASE_URL } = useContext(AppContext);
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.message);
  const selectuser = useSelector((state) => state.selectuser);
  const chatnotification = useSelector((state) => state.chatnotification);

  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showStickersModal, setShowStickersModal] = useState(false);

  const messageEndRef = useRef(null); // ใช้สำหรับ scroll ไปยังข้อความล่าสุด
  const fileInputRef = useRef(null); // ใช้สำหรับการจัดการ input type file
  const previousMessagesLength = useRef(messages.length); // เก็บความยาวของข้อความก่อนหน้า

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

  const scrollToBottom = () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }); // ฟังก์ชันสำหรับเลื่อนข้อความไปยังข้อความล่าสุด

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/getmessage`, {
          from: "admin",
          to: selectuser._id,
        });
        dispatch(setMessages(response.data));
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    if (selectuser._id) {
      fetchMessages();
      scrollToBottom();

      const intervalId = setInterval(fetchMessages, 3000); // ตั้ง interval ดึงข้อความทุก 3 วินาที

      return () => clearInterval(intervalId); // ล้าง interval เมื่อ component ถูก ทำลาย
    }
  }, [selectuser._id]);

  useEffect(() => {
    if (messages.length > previousMessagesLength.current) { // ตรวจสอบว่ามีข้อความใหม่หรือไม่
      scrollToBottom();
      const notification = Object.keys(chatnotification).find((key) => chatnotification[key].from === selectuser._id);  // ตรวจสอบการแจ้งเตือนสำหรับผู้ป่วยที่เลือก
      if (notification) dispatch(removeChatNotification(selectuser._id));
    }
    previousMessagesLength.current = messages.length; // อัปเดตความยาวข้อความก่อนหน้า
  }, [messages, chatnotification, selectuser._id]);

  const validateImg = (e) => { // ตรวจสอบไฟล์ภาพ
    const file = e.target.files[0]; // รับไฟล์จาก input
    const validTypes = ["image/jpeg", "image/png"];

    if (!validTypes.includes(file?.type)) { // .includes มีค่าที่ต้องการหรือไม่ ผลลัพธ์ true หรือ false
      alert("Only JPG and PNG files are allowed");
      fileInputRef.current.value = "";
      return;
    }

    if (file?.size >= 3048576) { // ตรวจสอบขนาดไฟล์
      alert("Max file size is 3MB");
      fileInputRef.current.value = ""; // ล้างค่า input
    }

    else {
      setImage(file); // เก็บไฟล์ใน state
      setMessage("Image selected");
    }
  };

  const getCurrentTime = () => {
    const now = new Date();  // สร้าง Date object ปัจจุบัน
    return {
      todayDate: now.toLocaleDateString("en-GB"), // แปลงวันที่เป็นรูปแบบ DD/MM/YYYY
      time: now.toTimeString().slice(0, 5), // แปลงเวลาเป็น HH:MM
    };
  };

  const handleStickerSelect = async (sticker) => {
    const { todayDate, time } = getCurrentTime();
    try {
      const blob = await (await fetch(`/img/${sticker}`)).blob(); //ดึงสติกเกอร์ในรูปแบบ Blob จาก URL
      const image = new File([blob], sticker, { type: "image/png" }); //แปลง Blob เป็นไฟล์ที่มีชื่อไฟล์ (sticker) และประเภท image/png

      const formData = new FormData();
      formData.append("photo", image);
      formData.append("from", "admin");
      formData.append("to", selectuser._id);
      formData.append("date", todayDate);
      formData.append("time", time);

      const res = await axios.post(`${API_BASE_URL}/chatphoto`, formData);
      dispatch(addMessage(res.data));
    } catch (error) {
      console.error(error);
    } finally { //ทำงานเสมอ ไม่ว่าจะเกิดข้อผิดพลาดหรือไม่
      setShowStickersModal(false);
      scrollToBottom();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันการ reload หน้า
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
        const res = await axios.post(`${API_BASE_URL}/createmessage`, { content: message, from: "admin", to: selectuser._id, date: todayDate, time });
        dispatch(addMessage(res.data));
      }
      setMessage("");
      scrollToBottom();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container fluid>
      <Navigation />
      <Row>
        <Col>
          {/* กล่องแชท */}
          <div className="d-flex flex-column mb-3" style={{ overflowY: "auto", height: "80vh", border: "1px solid lightgray" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`d-flex ${msg.from === "admin" ? "justify-content-end" : "justify-content-start"} my-2`}>
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
                      onClick={() => { setSelectedImage(msg.content); setShowModal(true); }}
                      style={{ cursor: "pointer", width: "200px", height: "auto" }}
                    />
                  ) : (
                    <div>{msg.content}</div>
                  )}
                  <div className="small text-muted mt-2" >{msg.date} {msg.time}</div>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} /> {/* จุดสำหรับ scroll */}
          </div>

          {/* ฟอร์มสำหรับส่งข้อความ */}
          <Form onSubmit={handleSubmit} className="d-flex align-items-center">

            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={validateImg} />
            <Button variant="outline-dark" onClick={() => fileInputRef.current.click()}><i className="bi bi-image" /></Button>

            <Button variant="outline-secondary mx-2" onClick={() => setShowStickersModal(true)}><i className="bi bi-emoji-smile" /></Button>

            <Form.Control type="text" placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)}
              disabled={!!image} style={{ backgroundColor: image ? "#DDDDDD" : "", fontWeight: image ? "bold" : "normal" }} />

            <Button type="submit" disabled={!message && !image} className="ms-2"><i className="bi bi-send-fill" /></Button>
          </Form>
        </Col>
      </Row>

      {/* Modal สำหรับแสดงภาพ */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton />
        <Modal.Body>
          {selectedImage && <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Preview" className="img-fluid" />}
        </Modal.Body>
      </Modal>

      {/* Modal สำหรับแสดงสติกเกอร์ */}
      <Modal show={showStickersModal} onHide={() => setShowStickersModal(false)} centered>
        <Modal.Header closeButton />
        <Modal.Body className="d-flex flex-wrap justify-content-center">
          {stickers.map((sticker, i) => (
            <img key={i} src={`/img/${sticker}`} alt={`sticker-${i}`} onClick={() => handleStickerSelect(sticker)}
              className="img-fluid m-1" style={{ cursor: "pointer", width: "85px" }} />
          ))}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Chat;