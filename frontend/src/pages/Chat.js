import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import Navigation from "../components/Navigation";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { showMessage, addMessage } from "../features/messageSlice";

function Chat() {
  const messages = useSelector((state) => state.message);
  const admin = useSelector((state) => state.admin);
  const selectuser = useSelector((state) => state.selectuser);
  const [message, setMessage] = useState("");
  const { API_BASE_URL } = useContext(AppContext);
  const messageEndRef = useRef(null);
  const [image, setImage] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/getmessage`, {
          from: admin._id,
          to: selectuser._id,
        });
        if (response.data) {
          dispatch(showMessage(response.data));
        }
      } catch (error) {
        console.error("Failed to fetch message data:", error);
      }
    };
  
    fetchChat();
  }, [admin._id, selectuser._id, API_BASE_URL, dispatch]);
  

  function validateImg(e) {
    const file = e.target.files[0];
  
    if (file.size >= 3048576) {
      return alert("Max file size is 3mb");
    } else {
      setImage(file);
    }
  }
  
  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function getCurrentTime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const todayDate = `${day}/${month}/${year}`;
    const time = `${hour}:${minutes}`;

    return { todayDate, time };
  }

  async function handleSubmit(e) {
    e.preventDefault();
  
    try {
      if (!message && !image) {
        return;
      }
  
      const { todayDate, time } = await getCurrentTime();
  
      let content = "";
  
      if (image) {
        try {
          const formData = new FormData();
          formData.append("photo", image);
          formData.append("from", admin._id);
          formData.append("to", selectuser._id);
          formData.append("date", todayDate);
          formData.append("time", time);
  
          axios.post(
            `${API_BASE_URL}/chatphoto`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          ).then((res) => {
            dispatch(addMessage(res.data));
          })
          .catch((err) => console.log(err));
          setImage(null);
        } catch (error) {
          console.error("Error uploading image:", error);
          throw error;
        }
      } else {
        content = message;
        axios
          .post(`${API_BASE_URL}/createmessage`, {
            content: content,
            time: time,
            date: todayDate,
            from: admin._id,
            to: selectuser._id,
            contentType: "text",
          })
          .then((res) => {
            dispatch(addMessage(res.data));
          })
          .catch((err) => console.log(err));
      }
      setMessage("");
    } catch (error) {
      console.error("Error handling form submission:", error);
    }
  }

  return (
    <Container>
      <Navigation />
      <Row>
        <Col>
        <>
  <div className="messages-output">
    {messages &&
      messages.map((message, index) => (
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
              <img src={`data:image/jpeg;base64,${message.content}`} alt="" className="message-img" />
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

  <div>
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
  );
}

export default Chat;
