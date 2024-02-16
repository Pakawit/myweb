import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button,Container,Row,Col } from "react-bootstrap";
import Navigation from "../components/Navigation";
import "./style.css";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";

function Chat() {
  const [message, setMessage] = useState("");
  const user = useSelector((state) => state.user);
  const { socket, contact, setMessages, messages } = useContext(AppContext);
  const messageEndRef = useRef(null);
  const [image, setImage] = useState(null);
  function validateImg(e) {
    const file = e.target.files[0];
    if (file.size >= 3048576) {
      return alert("Max file size is 3mb");
    } else {
      setImage(file);
    }
  }

  async function uploadImage() {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "x3tgzzl8");
    try {
      let res = await fetch("https://api.cloudinary.com/v1_1/dje07eo2t/image/upload", {
        method: "post",
        body: data,
      });
      const urlData = await res.json();
      return urlData.url;
    } catch (error) {
      console.log(error);
      throw new Error("Error uploading image");
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : "0" + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : "0" + day;
    return month + "/" + day + "/" + year;
  }

  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const todayDate = getFormattedDate();

  socket.off("room-messages").on("room-messages", (roomMessages) => {
    setMessages(roomMessages);
  });

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      if (!message && !image ) {
        return;
      }
      const today = new Date();
      const minutes = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
      const time = today.getHours() + ":" + minutes;
      const roomId = contact;
      
      if (image) {
        const url = await uploadImage();
        socket.emit("message-room", roomId, url, user, time, todayDate);
        setImage(null);
      } else {
        socket.emit("message-room", roomId, message, user, time, todayDate);
        setMessage("");
      }
      
    } catch (error) {
      console.error('Error handling form submission:', error);
    }
  }
  
  return (
    <Container>
      <Navigation />
      <Row>
        <Col>
        <>
      <div className="messages-output">
        <h1>{}</h1>
        {user &&
          messages.map(({ _id: date, messagesByDate }, idx) => (
            <div key={idx}>
              <p className="alert alert-info text-center message-date-indicator">
                {date}
              </p>
              {messagesByDate?.map(
                ({ content, time, from: sender }, msgIdx) => (
                  <div
                    className={
                      sender === user?._id
                        ? "incoming-message"
                        : "message"
                    }
                    key={msgIdx}
                  >
                    <div className="message-inner">
                      <div className="d-flex align-items-center mb-3">
                        <p className="message-sender">
                          {sender._id === user?._id ? "You" : sender.name}
                        </p>
                      </div>
                      {content.startsWith("http") ? (
                        <img src={content} alt="Uploaded" style={{ maxWidth: "350px" ,maxHeight: "500px" }} />
                      ) : (
                        <p className="message-content">{content}</p>
                      )}
                      <p className="message-timestamp-left">{time}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          ))}
        <div ref={messageEndRef} />
      </div>
      <div>
        <Form onSubmit={handleSubmit}>
          <Form.Group style={{ display: "flex" }}>
            <input style={{ display: "none" }} type="file" id="image-upload" hidden accept="image/png, image/jpeg" onChange={validateImg} />
            <label htmlFor="image-upload">
              <div className="img">
                <i className="bi bi-image"></i>
              </div>
            </label>
            <Form.Control
              type="text"
              placeholder="Your message"
              value={message}
              style={{ backgroundColor: "#DDDDDD" }}
              onChange={(e) => setMessage(e.target.value)}
            ></Form.Control>
            <Button
              variant="outline-dark"
              type="submit"
              style={{ backgroundColor: "#DDDDD", borderColor: "#DDDDD" }}
            >
              <i className="bi bi-send-fill"></i>
            </Button>
          </Form.Group>
        </Form>
      </div>
    </>

        </Col>
      </Row>
    </Container>
  )
}

export default Chat