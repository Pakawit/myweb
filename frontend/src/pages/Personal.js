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
  const { API_BASE_URL } = useContext(AppContext);
  const admin = useSelector((state) => state.admin);
  const selectuser = useSelector((state) => state.selectuser);
  const users = useSelector((state) => state.users);
  const personal = useSelector((state) => state.personalnotification);
  const medication = useSelector((state) => state.medication);
  const dispatch = useDispatch();

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

    const isValid = rules[name]?.test(value) ?? true; // ตรวจสอบความถูกต้องตามกฎ
    setErrors((prev) => ({ ...prev, [name]: isValid ? "" : `ข้อมูล ${name} ไม่ถูกต้อง` })); // อัปเดตข้อผิดพลาด
    setUserData((prev) => ({ ...prev, [name]: value })); // อัปเดตข้อมูลฟอร์ม
  };

  const handleSubmit = async () => {
    
    if (JSON.stringify(userData) === JSON.stringify(selectuser)) {showNotification("ไม่มีการเปลี่ยนแปลงข้อมูล"); return;}

    if (Object.values(errors).some((err) => err)) return showNotification("กรุณาตรวจสอบข้อมูลอีกครั้ง");

    try {
      await axios.post(`${API_BASE_URL}/saveChangesToJson`, {
        changes: userData, originalName: selectuser.name
      });
      setEditMode(false);
      showNotification("แก้ไขข้อมูลแล้ว (รอการยืนยันจาก Chureeporn)");
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
    if (admin.name === "Apatnipa") {
      const isPendingApproval = Object.values(personal).some((notification) => notification._id === selectuser._id);

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
    }
    return null;
  };

  const renderAdmin2Table = () => {
    if (admin.name === "Chureeporn") {
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
    }
  };

  return (
    <Container fluid>
      <Navigation />
      <h1>ข้อมูลส่วนบุคคล</h1>
      <Form onSubmit={(e) => e.preventDefault()}>
        {[
          { label: "ชื่อ-สกุล", name: "name", type: "text" },
          { label: "เบอร์โทรศัพท์", name: "phone", type: "text" },
          { label: "เบอร์โทรศัพท์ผู้ติดต่อ", name: "other_numbers", type: "text" },
          { label: "อายุ", name: "age", type: "number" },
          { label: "การวินิจฉัยโรคหลัก", name: "diagnosis", type: "textarea" },
          { label: "การรับประทานยา Capecitabine", name: "taking_capecitabine", type: "textarea" },
          { label: "เวลารับประทานยาช่วงเช้า", name: "morningTime", type: "time" },
          { label: "เวลารับประทานยาช่วงเย็น", name: "eveningTime", type: "time" },
          { label: "เลขโรงพยาบาล", name: "hospital_number", type: "text" },
          { label: "ขาดยา", name: "ms_medicine", value: medication.filter((med) => med.from === selectuser._id && med.status === 0).length, disabled: true },
          { label: "วันที่ลงทะเบียน", name: "createdAt", type: "text", value: new Date(selectuser.createdAt).toLocaleString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), disabled: true }
        ].map(({ label, name, type, value, disabled }) => (
          <Form.Group as={Row} className="mb-3" key={name}>
            <Form.Label column sm="6" className="text-center">{label}</Form.Label>
            <Col sm="6">
              <Form.Control
                as={type === "textarea" ? "textarea" : "input"}
                type={type}
                name={name}
                value={value ?? userData[name] ?? ""}
                onChange={handleChange}
                disabled={disabled || admin.name === "Chureeporn" || !editMode}
              />
              {errors[name] && <Alert variant="danger">{errors[name]}</Alert>}
            </Col>
          </Form.Group>
        ))}
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