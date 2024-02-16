import React, { useContext, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Home() {
  const user = useSelector((state) => state.user);
  const {
    socket,
    setMembers,
    members,
    setMember,
    setContact,
    contact,
  } = useContext(AppContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  socket.off("notifications").on("notifications", (room) => {
    if (contact !== room) dispatch(addNotifications(room));
  });

  useEffect(() => {
    socket.emit("new-user");
  }, [user, socket]);

  socket.off("new-user").on("new-user", (payload) => {
    setMembers(payload);
  });

  function joinRoom(room) {
    socket.emit("join-room", room, contact);
    setContact(room);
    // dispatch for notifications
    dispatch(resetNotifications(room));
  }

  function orderIds(id1, id2) {
    return id1 > id2 ? id1 + "-" + id2 : id2 + "-" + id1;
  }

  // Filter out members that are not the current user
  const otherMembers = members.filter((member) => member._id !== user._id);

  return (
    <Container>
      <Navigation />
      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th className="table-center">ชื่อ-สกุล</th>
                <th className="table-center">เบอร์โทรศัพท์</th>
                <th className="table-center">อายุ</th>
                <th className="table-center">ขาดยา</th>
                <th className="table-center">สถานะการกินยา</th>
                <th>{}</th>
              </tr>
            </thead>
            <tbody>
              {otherMembers.map((member, index) => (
                <tr key={index}>
                  <td className="table-center">{member.name}</td>
                  <td className="table-center">{member.phone}</td>
                  <td className="table-center">{member.age}</td>
                  <td className="table-center">{member.ms_medicine}</td>
                  <td className="table-center">{0}</td>
                  <td className="table-center">
                    <Button
                      variant="outline-success"
                      onClick={() => {
                        setMember(member);
                        navigate("/personal");
                      }}
                    >
                      ข้อมูลส่วนบุคคล
                    </Button>{" "}
                    <Button
                      variant="outline-success"
                      onClick={() => {
                        setContact(orderIds(user._id, member._id));
                        setMember(member);
                        navigate("/medication");
                      }}
                    >
                      รายละเอียดการกินยา
                    </Button>{" "}
                    <Button
                      variant="outline-success"
                      onClick={() => {
                        setContact(orderIds(user._id, member._id));
                        setMember(member);
                        navigate("/estimation");
                      }}
                    >
                      การประเมินอาการ HFS
                    </Button>{" "}
                    <Button
                      variant="outline-success"
                      onClick={() => {
                        joinRoom(orderIds(user._id, member._id));
                        setMember(member);
                        navigate("/chat");
                      }}
                    >
                      แชท
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
