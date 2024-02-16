import React, { useContext, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import {useNavigate} from 'react-router-dom'

function Medication() {
  const user = useSelector((state) => state.user);
  const { socket, contact, member, medications, setMedications  } = useContext(AppContext);
  const navigate = useNavigate();



  function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : "0" + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : "0" + day;
    return month + "/" + day + "/" + year;
  }


  async function handleSubmit(e) {
    e.preventDefault();
    const today = new Date();
    const minutes = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    const time = today.getHours() + ":" + minutes;
    const todayDate = getFormattedDate();

    socket.emit("add-medication", contact, user, time, todayDate);
  }

  socket.on("room-medications", (roomMedications) => {
    setMedications(roomMedications);
  });


  useEffect(() => {
    if(!member._id){
      navigate('/');
    }
    // Emit the 'new-select' event to fetch the initial member data
    socket.emit("new-medication", { room: contact });

    // Listen for changes in member data from the server
    socket.on("new-medication", (payload) => { 
      setMedications([payload]); 
    });
    

    // Clean up socket event listener when component unmounts
    return () => {
      socket.off("new-medication");
    };
  }, [socket, user, member._id, setMedications, navigate,contact]); 


  return (
    <Container>
      <Navigation />
      <Row>
        <h1>รายละเอียดการกินยา</h1>
        <Button onClick={handleSubmit}>add</Button>
        <Col>
          <Table>
            <thead>
              <tr>
                <th className="table-center"style={{ width: '33%' }}>วัน/เดือน/ปี</th>
                <th className="table-center"style={{ width: '33%' }}>เวลา</th>
                <th className="table-center"style={{ width: '33%' }}>สถานะ</th>
              </tr>
            </thead>
            <tbody>
            {medications.map((medication, index) => (
            <tr key={index}>
              <td className="table-center"style={{ width: '33%' }}>{medication.date}</td>
              <td className="table-center"style={{ width: '33%' }}>{medication.time}</td>
              <td className="table-center"style={{ width: '33%' }}>{medication.status}</td>
            </tr>
          ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  )
}

export default Medication;