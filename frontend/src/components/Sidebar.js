import React, { useContext, useEffect } from "react";
import { Col, ListGroup, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import "./Sidebar.css";
import {useNavigate} from 'react-router-dom'

function Sidebar() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const {
    socket,
    setMembers,
    members,
    setCurrentRoom,
    privateMemberMsg,
    setPrivateMemberMsg,
    currentRoom,
  } = useContext(AppContext);
  const navigate = useNavigate();

  function joinRoom(room = true) {
    socket.emit("join-room", room, currentRoom);
    setCurrentRoom(room);
    // dispatch for notifications
    dispatch(resetNotifications(room));
  }

  socket.off("notifications").on("notifications", (room) => {
    if (currentRoom !== room) dispatch(addNotifications(room));
  });

  useEffect(() => {
    if (user) {
      socket.emit("new-user");
    }
  }, [user, socket]);

  socket.off("new-user").on("new-user", (payload) => {
    setMembers(payload);
  });

  function orderIds(id1, id2) {
    return id1 > id2 ? id1 + "-" + id2 : id2 + "-" + id1;
  }

  function handlePrivateMemberMsg(member) {
    setPrivateMemberMsg(member);
    const roomId = orderIds(user._id, member._id);
    joinRoom(roomId, false);
    navigate("/chat");
  }

  return (
    <div className="sidebar">
      <h2>Members</h2>
      <ListGroup>
        {members.map((member) => (
          <ListGroup.Item
            key={member._id} 
            style={{ cursor: "pointer" }}
            active={privateMemberMsg?._id === member?._id}
            onClick={() => handlePrivateMemberMsg(member)}
            disabled={member._id === user._id}
          >
            <Row>
              <Col xs={9}>
                {member.name}
                {member._id === user?._id && " (You)"}
              </Col>
            </Row>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default Sidebar;
