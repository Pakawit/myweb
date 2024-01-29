import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";
import "./MessageForm.css";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
function MessageForm() {
  const [message, setMessage] = useState("");
  const user = useSelector((state) => state.user);
  const { socket, currentRoom, setMessages, messages } = useContext(AppContext);
  const messageEndRef = useRef(null);

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

  function handleSubmit(e) {
    e.preventDefault();
    if (!message) return;
    const today = new Date();
    const minutes =
      today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    const time = today.getHours() + ":" + minutes;
    const roomId = currentRoom;
    socket.emit("message-room", roomId, message, user, time, todayDate);
    setMessage("");
  }

  return (
    <>
      <div className="messages-output">
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
                      sender?.name === user?.name
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
                      <p className="message-content">{content}</p>
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
      <Form.Group style={{display:"flex"}}>
      <Form.Control  style={{ display: "none" }} type="file" id="file" />
          <label htmlFor="file">
          <div className="img">
            <i className="bi bi-image" ></i>
            </div> 
          </label>
              <Form.Control
                type="text"
                placeholder="Your message"
                value={message}
                style={{ backgroundColor: "#DDDDDD"}}
                onChange={(e) => setMessage(e.target.value)}
              ></Form.Control>
            <Button
              variant="outline-dark"
              type="submit"
              style={{ backgroundColor: "#DDDDD" , borderColor: "#DDDDD" }}
            >
              <i className="bi bi-send-fill"></i>
            </Button>
            </Form.Group>
      </Form>
      </div>
    </>
  );
}

export default MessageForm;
