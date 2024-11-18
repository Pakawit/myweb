import React, { useContext, useState, useEffect } from "react";
import { Container, Button, Form, Row, Col, Modal, Alert, Table } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { loadMedicationsData } from "../features/medicationSlice";
import { setselectuser } from "../features/selectuserSlice";
import { loadPersonalnotificationData } from "../features/personalnotificationSlice";
import { loadUsersData } from "../features/usersSlice";

function Personal() {
  const dispatch = useDispatch();
  const { API_BASE_URL } = useContext(AppContext);
  const admin = useSelector((state) => state.admin);
  const selectuser = useSelector((state) => state.selectuser);
  const users = useSelector((state) => state.users);
  const personal = useSelector((state) => state.personalnotification);
  const medication = useSelector((state) => state.medication);

  const [userData, setUserData] = useState(selectuser); // ใช้ useState จัดการข้อมูล
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: "", show: false });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          dispatch(loadMedicationsData()),
          dispatch(loadPersonalnotificationData()),
          dispatch(loadUsersData()),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    // ดึงข้อมูลจาก users โดยใช้ selectuser._id 
    if (selectuser._id && users) {
      const matchingUser = users.find((user) => user._id === selectuser._id);
      if (matchingUser) {
        setUserData(matchingUser);
      }
    }
  }, [selectuser, users]); // ทำงานเมื่อ selectuser หรือ users เปลี่ยนแปลง

  const handleChange = ({ target: { name, value } }) => {
    const rules = {
      name: /^[a-zA-Zก-๙\s]{1,30}$/, // ชื่อ: ต้องเป็นตัวอักษรและมีความยาวไม่เกิน 30
      phone: /^\d{0,10}$/, // เบอร์โทรศัพท์: ตัวเลขไม่เกิน 10 หลัก
      other_numbers: /^\d{0,10}$/, // เบอร์โทรศัพท์ผู้ติดต่อ: ตัวเลขไม่เกิน 10 หลัก
      age: /^\d{1,3}$/, // อายุ: ตัวเลข 1-3 หลัก
      diagnosis: /^.{0,300}$/, // การวินิจฉัย: ความยาวไม่เกิน 300 ตัวอักษร
      taking_capecitabine: /^.{0,300}$/, // การรับประทานยา Capecitabine: ความยาวไม่เกิน 300 ตัวอักษร
      hospital_number: /^.{0,50}$/, // เลขโรงพยาบาล: ความยาวไม่เกิน 50 ตัวอักษร
      morningTime: /.+/, // เวลาช่วงเช้า: ต้องมีค่า
      eveningTime: /.+/, // เวลาช่วงเย็น: ต้องมีค่า
    };

    const isValid = rules[name].test(value); // ตรวจสอบความถูกต้องตามกฎ คืนค่า true หรือ false
    setErrors((prev) => ({ ...prev, [name]: isValid ? "" : `ข้อมูล ${name} ไม่ถูกต้อง` })); // อัปเดตข้อผิดพลาด
    setUserData((prev) => ({ ...prev, [name]: value })); // อัปเดตข้อมูลฟอร์ม
  };

  const handleSubmit = async () => {

    if (JSON.stringify(userData) === JSON.stringify(selectuser)) { showNotification("ไม่มีการเปลี่ยนแปลงข้อมูล"); return; } //JSON.stringify แปลง object ให้กลายเป็นข้อความในรูปแบบ JSON

    if (Object.values(errors).some((err) => err)) return showNotification("กรุณาตรวจสอบข้อมูลอีกครั้ง"); //.some() ตรงเงื่อนไข อย่างน้อยหนึ่งสมาชิก ตืนต่า true

    try {
      await axios.post(`${API_BASE_URL}/saveChangesToJson`, {
        changes: userData, originalName: selectuser.name
      });
      setEditMode(false);
      showNotification("แก้ไขข้อมูลแล้ว (รอการยืนยันจาก Chureeporn)");
      dispatch(loadPersonalnotificationData());
      setUserData(selectuser);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleConfirmChanges = async () => {
    try {
      await axios.post(`${API_BASE_URL}/confirmChanges`, { _id: selectuser._id, name: selectuser.name });
      showNotification("ยืนยันการเปลี่ยนแปลงแล้ว");
      dispatch(loadPersonalnotificationData());
      dispatch(setselectuser(personal[selectuser._id])); // ตั้งค่า selectuser ใหม่หลังยืนยัน
    } catch (error) {
      console.error("Error in confirmChanges:", error);
    }
  };

  const handleRejectChanges = async () => {
    try {
      await axios.post(`${API_BASE_URL}/rejectChanges`, { _id: selectuser._id, name: selectuser.name });
      showNotification("ยกเลิกการเปลี่ยนแปลงแล้ว");
      dispatch(loadPersonalnotificationData());
      setUserData(selectuser); // รีเซ็ตข้อมูลกลับไปที่ selectuser
    } catch (error) {
      console.error("Error in rejectChanges:", error);
    }
  };

  const showNotification = (message) => setNotification({ message, show: true });

  const renderAdminButtons = () => { 
      const isPendingApproval = Object.values(personal).some((notification) => notification._id === selectuser._id); //.some() ตรงเงื่อนไข อย่างน้อยหนึ่งสมาชิก ตืนต่า true

      if (isPendingApproval) {
        return (
          <Alert variant="info" className="text-center">
            กำลังรอการยืนยันจาก Chureeporn
          </Alert>
        );
      }

      return (
        <Row className="mb-3">
          <Col sm={{ span: 6, offset: 6 }} className="d-flex justify-content-end">
            {editMode ? (
              <>
                <Button variant="outline-success" onClick={handleSubmit}>บันทึก</Button>
                <Button variant="outline-danger" onClick={() => { setEditMode(false); setUserData(selectuser); setErrors({}) }} className="ms-2">ยกเลิก</Button>
              </>
            ) : (
              <Button variant="outline-dark" onClick={() => setEditMode(true)}>แก้ไข</Button>
            )}
          </Col>
        </Row>
      );
  };

  const renderAdmin2Table = () => {
      const selectedUser = personal[selectuser._id];
      return (
        selectedUser && (
          <Table striped bordered hover responsive="md" className="text-center">
            <thead>
              <tr>
                {[
                  "ชื่อ-สกุล",
                  "เบอร์โทรศัพท์",
                  "เบอร์โทรศัพท์ผู้ติดต่อ",
                  "อายุ",
                  "การวินิจฉัยโรคหลัก",
                  "การรับประทานยา Capecitabine",
                  "เวลารับประทานยาช่วงเช้า",
                  "เวลารับประทานยาช่วงเย็น",
                  "เลขโรงพยาบาล",
                  "การดำเนินการ",
                ].map((header) => (
                  <th key={header} className="text-center">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedUser.name || "N/A"}</td>
                <td>{selectedUser.phone || "N/A"}</td>
                <td>{selectedUser.other_numbers || "N/A"}</td>
                <td>{selectedUser.age}</td>
                <td>{selectedUser.diagnosis || "N/A"}</td>
                <td>{selectedUser.taking_capecitabine || "N/A"}</td>
                <td>{selectedUser.morningTime || "N/A"}</td>
                <td>{selectedUser.eveningTime || "N/A"}</td>
                <td>{selectedUser.hospital_number || "N/A"}</td>
                <td className="text-center">
                  <Button variant="outline-success" size="sm" onClick={() => handleConfirmChanges()} className="mx-1">ยืนยัน</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleRejectChanges()} className="mx-1">ปฏิเสธ</Button>
                </td>
              </tr>
            </tbody>
          </Table>
        )
      );
  };

  return (
    <Container fluid>
      <Navigation />
      <h1>ข้อมูลส่วนบุคคล</h1>
      <Form onSubmit={(e) => e.preventDefault()}>
        {/* ชื่อ-สกุล */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">ชื่อ-สกุล</Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="name"
              value={userData.name || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
            {errors.name && <Alert variant="danger">{errors.name}</Alert>}
          </Col>
        </Form.Group>

        {/* เบอร์โทรศัพท์ */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">เบอร์โทรศัพท์</Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="phone"
              value={userData.phone || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
            {errors.phone && <Alert variant="danger">{errors.phone}</Alert>}
          </Col>
        </Form.Group>

        {/* เบอร์โทรศัพท์ผู้ติดต่อ */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">เบอร์โทรศัพท์ผู้ติดต่อ</Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="other_numbers"
              value={userData.other_numbers || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
            {errors.other_numbers && <Alert variant="danger">{errors.other_numbers}</Alert>}
          </Col>
        </Form.Group>

        {/* อายุ */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">อายุ</Form.Label>
          <Col sm="6">
            <Form.Control
              type="number"
              name="age"
              value={userData.age || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
            {errors.age && <Alert variant="danger">{errors.age}</Alert>}
          </Col>
        </Form.Group>

        {/* การวินิจฉัยโรคหลัก */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">การวินิจฉัยโรคหลัก</Form.Label>
          <Col sm="6">
            <Form.Control
              as="textarea"
              name="diagnosis"
              value={userData.diagnosis || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
            {errors.diagnosis && <Alert variant="danger">{errors.diagnosis}</Alert>}
          </Col>
        </Form.Group>

        {/* การรับประทานยา Capecitabine */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">การรับประทานยา Capecitabine</Form.Label>
          <Col sm="6">
            <Form.Control
              as="textarea"
              name="taking_capecitabine"
              value={userData.taking_capecitabine || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
            {errors.taking_capecitabine && <Alert variant="danger">{errors.taking_capecitabine}</Alert>}
          </Col>
        </Form.Group>

        {/* เวลารับประทานยาช่วงเช้า */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">เวลารับประทานยาช่วงเช้า</Form.Label>
          <Col sm="6">
            <Form.Control
              type="time"
              name="morningTime"
              value={userData.morningTime || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
            {errors.morningTime && <Alert variant="danger">{errors.morningTime}</Alert>}
          </Col>
        </Form.Group>

        {/* เวลารับประทานยาช่วงเย็น */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">เวลารับประทานยาช่วงเย็น</Form.Label>
          <Col sm="6">
            <Form.Control
              type="time"
              name="eveningTime"
              value={userData.eveningTime || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
            {errors.eveningTime && <Alert variant="danger">{errors.eveningTime}</Alert>}
          </Col>
        </Form.Group>

        {/* เลขโรงพยาบาล */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">เลขโรงพยาบาล</Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="hospital_number"
              value={userData.hospital_number || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
            {errors.hospital_number && <Alert variant="danger">{errors.hospital_number}</Alert>}
          </Col>
        </Form.Group>

        {/* ขาดยา */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">ขาดยา</Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="ms_medicine"
              value={medication.filter((med) => med.from === selectuser._id && med.status === 0).length}
              disabled
            />
          </Col>
        </Form.Group>

        {/* วันที่ลงทะเบียน */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" className="text-center">วันที่ลงทะเบียน</Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="createdAt"
              value={new Date(selectuser.createdAt).toLocaleString("th-TH", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              disabled
            />
          </Col>
        </Form.Group>
      </Form>

      {admin.name === "Apatnipa" && renderAdminButtons()}
      {admin.name === "Chureeporn" && renderAdmin2Table()}
      <Modal show={notification.show} onHide={() => setNotification({ message: "", show: false })} centered>
        <Modal.Header closeButton><Modal.Title>แจ้งเตือน</Modal.Title></Modal.Header>
        <Modal.Body>{notification.message}</Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setNotification({ message: "", show: false })}>ปิด</Button></Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Personal;