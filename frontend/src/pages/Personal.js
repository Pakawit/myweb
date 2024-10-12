import React, { useContext, useState, useEffect } from "react";
import { Container, Button, Form, Row, Col, Modal, Alert, Table } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchMedicationsThunk } from "../features/medicationSlice";
import { setselectuser } from "../features/selectuserSlice";
import { fetchPersonalDataThunk } from "../features/personalSlice"; 

function Personal() {
  const admin = useSelector((state) => state.admin); 
  const selectuser = useSelector((state) => state.selectuser) || {}; 
  const medication = useSelector((state) => state.medication) || [];
  const personal = useSelector((state) => state.personal); 
  const { API_BASE_URL } = useContext(AppContext);
  const [member, setMember] = useState(selectuser || {}); 
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const dispatch = useDispatch();

  const fetchUserDetails = async () => {
    if (selectuser && selectuser._id) {
      try {
        const response = await axios.post(`${API_BASE_URL}/getuser`, { id: selectuser._id });
        const updatedUser = response.data;
        setMember(updatedUser); 
        dispatch(setselectuser(updatedUser)); 
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }
  };

  useEffect(() => {
    if (selectuser && selectuser._id && !editMode) {
      const intervalId = setInterval(fetchUserDetails, 3000); 
      return () => clearInterval(intervalId); // ล้าง interval เมื่อ component ถูก unmount
    }
  }, [selectuser, editMode]);

  useEffect(() => {
    dispatch(fetchMedicationsThunk());
    dispatch(fetchPersonalDataThunk()); 
  }, [dispatch]);

  const validate = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!/^[a-zA-Zก-๙\s]*$/.test(value) || value.length > 30) {
          error = "ต้องเป็นตัวอักษรเท่านั้น ไม่เกิน 30 ตัว";
        }
        break;
      case "phone":
      case "other_numbers":
        if (!/^\d*$/.test(value) || value.length > 10) {
          error = "ต้องเป็นตัวเลขเท่านั้น ไม่เกิน 10 ตัว";
        }
        break;
      case "age":
        if (!/^\d*$/.test(value) || value.length > 3) {
          error = "ต้องเป็นตัวเลขเท่านั้น ไม่เกิน 3 ตัว";
        }
        break;
      case "diagnosis":
      case "taking_capecitabine":
      case "other_medicine":
        if (value.length > 300) {
          error = "ต้องไม่เกิน 300 ตัว";
        }
        break;
      case "hospital_number":
        if (value.length > 50) {
          error = "ต้องไม่เกิน 50 ตัว";
        }
        break;
      case "morningTime":
      case "eveningTime":
        if (!value) {
          error = "กรุณาระบุเวลา";
        }
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validate(name, value);
    setMember((prevMember) => ({ ...prevMember, [name]: value }));
  };

  const handleSubmit = async () => {
    if (Object.values(errors).every((err) => err === "")) {
      if (admin.name === "admin1") {
        try {
          await axios.post(`${API_BASE_URL}/saveChangesToJson`, {
            changes: member,
          });
          setEditMode(false);
          setNotificationMessage("แก้ไขข้อมูลแล้ว (รอการยืนยันจาก Admin2)");
          setShowModal(true);
        } catch (err) {
          console.log(err);
        }
      }
    }
  };

  const handleConfirm = async (change) => {
    try {
      await axios.post(`${API_BASE_URL}/confirmChanges`, { _id: change._id , name: change.name});
      setNotificationMessage("ยืนยันการเปลี่ยนแปลงแล้ว");
      setShowModal(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (change) => {
    try {
      await axios.post(`${API_BASE_URL}/rejectChanges`, { _id: change._id , name: change.name});
      setNotificationMessage("ยกเลิกการเปลี่ยนแปลงแล้ว");
      setShowModal(true);
    } catch (err) {
      console.log(err);
    }
  };

  const getMsMedicineCount = (userId) => {
    return medication.filter((med) => med.from === userId && med.status === 0).length;
  };

  return (
    <Container fluid>
      <Navigation />
      <h1>ข้อมูลส่วนบุคคล</h1>

      <Form onSubmit={(e) => e.preventDefault()}>
        {/* ส่วนแสดงฟอร์มสำหรับ admin1 */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            ชื่อ-สกุล
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="name"
              value={member.name || ""}
              onChange={handleChange}
              disabled={admin.name === "admin2" || !editMode}
            />
            {errors.name && <Alert variant="danger">{errors.name}</Alert>}
          </Col>
        </Form.Group>

        {/* เบอร์โทรศัพท์ */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            เบอร์โทรศัพท์
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="phone"
              value={member.phone || ""}
              onChange={handleChange}
              disabled={admin.name === "admin2" || !editMode}
            />
            {errors.phone && <Alert variant="danger">{errors.phone}</Alert>}
          </Col>
        </Form.Group>

        {/* เบอร์โทรศัพท์ผู้ติดต่อ */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            เบอร์โทรศัพท์ผู้ติดต่อ
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="other_numbers"
              value={member.other_numbers || ""}
              onChange={handleChange}
              disabled={admin.name === "admin2" || !editMode}
            />
            {errors.other_numbers && <Alert variant="danger">{errors.other_numbers}</Alert>}
          </Col>
        </Form.Group>

        {/* อายุ */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            อายุ
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="number"
              name="age"
              value={member.age || ""}
              onChange={handleChange}
              disabled={admin.name === "admin2" || !editMode}
            />
            {errors.age && <Alert variant="danger">{errors.age}</Alert>}
          </Col>
        </Form.Group>

        {/* การวินิจฉัยโรคหลัก */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            การวินิจฉัยโรคหลัก
          </Form.Label>
          <Col sm="6">
            <Form.Control
              as="textarea"
              name="diagnosis"
              value={member.diagnosis || ""}
              onChange={handleChange}
              disabled={admin.name === "admin2" || !editMode}
            />
            {errors.diagnosis && <Alert variant="danger">{errors.diagnosis}</Alert>}
          </Col>
        </Form.Group>

        {/* การรับประทานยา Capecitabine */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            การรับประทานยา Capecitabine
          </Form.Label>
          <Col sm="6">
            <Form.Control
              as="textarea"
              name="taking_capecitabine"
              value={member.taking_capecitabine || ""}
              onChange={handleChange}
              disabled={admin.name === "admin2" || !editMode}
            />
            {errors.taking_capecitabine && <Alert variant="danger">{errors.taking_capecitabine}</Alert>}
          </Col>
        </Form.Group>

        {/* เวลารับประทานยาช่วงเช้า */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            เวลารับประทานยาช่วงเช้า
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="time"
              name="morningTime"
              value={member.morningTime || ""}
              onChange={handleChange}
              disabled={admin.name === "admin2" || !editMode}
            />
            {errors.morningTime && <Alert variant="danger">{errors.morningTime}</Alert>}
          </Col>
        </Form.Group>

        {/* เวลารับประทานยาช่วงเย็น */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            เวลารับประทานยาช่วงเย็น
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="time"
              name="eveningTime"
              value={member.eveningTime || ""}
              onChange={handleChange}
              disabled={admin.name === "admin2" || !editMode}
            />
            {errors.eveningTime && <Alert variant="danger">{errors.eveningTime}</Alert>}
          </Col>
        </Form.Group>

        {/* เลขโรงพยาบาล */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            เลขโรงพยาบาล
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="hospital_number"
              value={member.hospital_number || ""}
              onChange={handleChange}
              disabled={admin.name === "admin2" || !editMode}
            />
            {errors.hospital_number && <Alert variant="danger">{errors.hospital_number}</Alert>}
          </Col>
        </Form.Group>

        {/* ขาดยา */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            ขาดยา
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="ms_medicine"
              value={getMsMedicineCount(member._id)} // Show missed medications count
              disabled
            />
          </Col>
        </Form.Group>

        {/* ปุ่มบันทึกและยกเลิก */}
        {admin.name === "admin1" && (
          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 6, offset: 6 }} className="d-flex justify-content-end">
              {editMode ? (
                <>
                  <Button variant="outline-success" type="button" onClick={handleSubmit}>
                    บันทึก
                  </Button>
                  <Button
                    variant="outline-danger"
                    type="button"
                    onClick={() => setEditMode(false)}
                    style={{ marginLeft: "10px" }}
                  >
                    ยกเลิก
                  </Button>
                </>
              ) : (
                <Button variant="outline-dark" type="button" onClick={() => setEditMode(true)}>
                  แก้ไข
                </Button>
              )}
            </Col>
          </Form.Group>
        )}
      </Form>

      {/* ตารางสำหรับ admin2 ที่แสดงเฉพาะผู้ใช้ที่ถูกเลือก */}
      {admin.name === "admin2" && personal[selectuser._id] && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ชื่อ-สกุล</th>
              <th>เบอร์โทรศัพท์</th>
              <th>เบอร์โทรศัพท์ผู้ติดต่อ</th>
              <th>อายุ</th>
              <th>การวินิจฉัยโรคหลัก</th>
              <th>การรับประทานยา Capecitabine</th>
              <th>เวลารับประทานยาช่วงเช้า</th>
              <th>เวลารับประทานยาช่วงเย็น</th>
              <th>เลขโรงพยาบาล</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{personal[selectuser._id].name}</td>
              <td>{personal[selectuser._id].phone}</td>
              <td>{personal[selectuser._id].other_numbers}</td>
              <td>{personal[selectuser._id].age}</td>
              <td>{personal[selectuser._id].diagnosis}</td>
              <td>{personal[selectuser._id].taking_capecitabine}</td>
              <td>{personal[selectuser._id].morningTime}</td>
              <td>{personal[selectuser._id].eveningTime}</td>
              <td>{personal[selectuser._id].hospital_number}</td>
              <td>
                <Button variant="outline-success" onClick={() => handleConfirm(personal[selectuser._id])}>
                  ยืนยัน
                </Button>
                <Button variant="outline-danger" onClick={() => handleReject(personal[selectuser._id])} style={{ marginLeft: "10px" }}>
                  ปฏิเสธ
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      )}

      {/* Modal สำหรับแจ้งเตือน */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>แจ้งเตือน</Modal.Title>
        </Modal.Header>
        <Modal.Body>{notificationMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Personal;