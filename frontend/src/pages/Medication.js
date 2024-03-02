import React, { useContext, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addMedication, setMedication } from "../features/medicationSlice";

function Medication() {
  const { member } = useContext(AppContext);
  const medication = useSelector((state) => state.medication);
  const dispatch = useDispatch();
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


  useEffect(() => {
    if (!member._id) {
      navigate("/");
    }
    const fetchData = async () => {
      try {
        const res = await axios.post("http://localhost:5001/getmedication",{_id: member._id});
        dispatch(setMedication(res.data));
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const today = new Date();
    const minutes = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    const time = today.getHours() + ":" + minutes;
    const todayDate = getFormattedDate();
    const status = 1 ;

     axios.post("http://localhost:5001/createmedication", {status: status ,time: time, date: todayDate ,from: member._id})
      .then((res) => {
        dispatch(addMedication(res.data))
      })
      .catch((err) => console.log(err));

  }

  return (
    <Container>
      <Navigation />
      <Row>
        <h1>รายละเอียดการกินยา</h1>
        <Button onClick={handleSubmit}>เพิ่ม</Button>
        <Col>
          <Table>
            <thead>
              <tr>
                <th className="table-center" style={{ width: "33%" }}>
                  วัน/เดือน/ปี
                </th>
                <th className="table-center" style={{ width: "33%" }}>
                  เวลา
                </th>
                <th className="table-center" style={{ width: "33%" }}>
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody>
              {medication && medication.map((medication, index) => (
                <tr key={index}>
                  <td className="table-center" style={{ width: "33%" }}>
                    {medication.date}
                  </td>
                  <td className="table-center" style={{ width: "33%" }}>
                    {medication.time}
                  </td>
                  <td className="table-center" style={{ width: "33%" }}>
                    {medication.status}
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

export default Medication;
