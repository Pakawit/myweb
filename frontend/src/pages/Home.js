import React, { useContext, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import { useNavigate } from 'react-router-dom';

function Home() {
  const user = useSelector((state) => state.user);
  const {
    socket,
    setMembers,
    members,
    setMember,
    setCurrentRoom,
    setPrivateMemberMsg,
    privateMemberMsg,
    currentRoom,
  } = useContext(AppContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  socket.off("notifications").on("notifications", (room) => {
    if (currentRoom !== room) dispatch(addNotifications(room));
  });

  useEffect(() => {
      socket.emit("new-user");
  }, [user, socket]);

  socket.off("new-user").on("new-user", (payload) => {
    setMembers(payload);
  });

  function joinRoom( room ) {
    socket.emit("join-room", room, currentRoom);
    setCurrentRoom(room);
    // dispatch for notifications
    dispatch(resetNotifications(room));
  }

  function orderIds(id1, id2) {
    return id1 > id2 ? id1 + "-" + id2 : id2 + "-" + id1;
  }

  function handlePrivateMemberMsg(member) {
    setPrivateMemberMsg(member);
    const roomId = orderIds(user._id, member._id);
    joinRoom(roomId, false);
    navigate("/chat");
  }

  function handleSetMember(member) {
    setMember(member);
    navigate("/personal");
  }


  // Filter out members that are not the current user
  const otherMembers = members.filter(member => member._id !== user._id);

  return (
    <Container>
      <Navigation />
      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th>ชื่อ-สกุล</th>
                <th>เบอร์โทรศัพท์</th>
                <th>อายุ</th>
                <th>ขาดยา</th>
                <th>สถานะการกินยา</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {otherMembers.map((member, index) => (
                <tr key={index}>
                  <td>{member.name}</td>
                  <td>{member.phone}</td>
                  <td>{member.age}</td>
                  <td>{member.ms_medicine}</td>
                  <td>{member.status}</td>
                  <td>
                    <Button variant="outline-success"onClick={() => handleSetMember(member)}>ข้อมูลส่วนบุคคล</Button>{' '}
                    <Button variant="outline-success">รายละเอียดการกินยา</Button>{' '}
                    <Button variant="outline-success">การประเมินอาการ HFS</Button>{' '}
                    <Button variant="outline-success" active={privateMemberMsg?._id === member?._id} onClick={() => handlePrivateMemberMsg(member)}>แชท</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  )
}

export default Home;
