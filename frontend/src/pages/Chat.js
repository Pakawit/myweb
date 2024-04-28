import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import Navigation from "../components/Navigation";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showMessage, addMessage } from "../features/messageSlice";

function Chat() {
  const messages = useSelector((state) => state.message);
  const user = useSelector((state) => state.user);
  const [message, setMessage] = useState("");
  const { member } = useContext(AppContext);
  const messageEndRef = useRef(null);
  const [image, setImage] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!member._id) {
      navigate("/");
    }
    const fetchData = async () => {
      try {
        const res = await axios.post("http://localhost:5001/getmessage", {
          from: user._id,
          to: member._id,
        });
        dispatch(showMessage(res.data));
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  },[dispatch, member._id, navigate, user._id]);

  function validateImg(e) {
    const file = e.target.files[0];
    if (file.size >= 3048576) {
      return alert("Max file size is 3mb");
    } else {
      setImage(file);
    }
  }

  // async function uploadImage() {
  //   const data = new FormData();
  //   data.append("file", image);
  //   data.append("upload_preset", "x3tgzzl8");
  //   try {
  //     let res = await fetch(
  //       "https://api.cloudinary.com/v1_1/dje07eo2t/image/upload",
  //       {
  //         method: "post",
  //         body: data,
  //       }
  //     );
  //     const urlData = await res.json();
  //     return urlData.url;
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error("Error uploading image");
  //   }
  // }

  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");
    return `${day}/${month}/${year}`;
  }

  const todayDate = getFormattedDate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (!message && !image) {
        return;
      }

      const today = new Date();
      const minutes = today.getMinutes().toString().padStart(2, "0");
      const time = `${today.getHours()}:${minutes}`;
      let content = "";

      if (image) {
        // const url = await uploadImage();
        // content = url;
        // setImage(null);
      } else {
        content = message;
        setMessage("");
      }

      axios.post("http://localhost:5001/createmessage", {
          content: content,
          time: time,
          date: todayDate,
          from: user._id,
          to: member._id,
        })
        .then((res) => {
          dispatch(addMessage(res.data));
        })
        .catch((err) => console.log(err));
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
              {messages && messages.map((message, index) => (
                <div key={index} className={message.from === user._id ? "incoming-message" : "outgoing-message"}>
                  <div className="message-inner">
                    <div>{message.content}</div>
                    <div className="message-timestamp-left">{message.date} {message.time}</div>
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
