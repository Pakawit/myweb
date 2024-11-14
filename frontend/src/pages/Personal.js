import React, { useContext, useState, useEffect } from "react";
import { Container, Button, Form, Row, Col, Modal, Alert, Table } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { loadMedicationsData } from "../features/medicationSlice";
import { setselectuser } from "../features/selectuserSlice";
import { loadPersonalnotificationData } from "../features/personalnotificationSlice";

function Personal() {
  const { API_BASE_URL } = useContext(AppContext);
  const admin = useSelector((state) => state.admin);
  const selectuser = useSelector((state) => state.selectuser);
  const personal = useSelector((state) => state.personalnotification);
  const medication = useSelector((state) => state.medication);
  const dispatch = useDispatch();

  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: "", show: false });

  const fetchUserDetails = async () => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/getuser`, {
        id: selectuser._id,
      });
      dispatch(setselectuser(data));
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      dispatch(loadMedicationsData());
      dispatch(loadPersonalnotificationData());
      if (selectuser._id && !editMode) {
        await fetchUserDetails();
      }
    };

    fetchInitialData();
  }, [dispatch, selectuser._id, editMode]);

  const handleChange = ({ target: { name, value } }) => {
    const rules = {
      name: /^[a-zA-Zก-๙\s]{1,30}$/,
      phone: /^\d{0,10}$/,
      other_numbers: /^\d{0,10}$/,
      age: /^\d{1,3}$/,
      diagnosis: /^.{0,300}$/,
      taking_capecitabine: /^.{0,300}$/,
      hospital_number: /^.{0,50}$/,
      morningTime: /.+/,
      eveningTime: /.+/,
    };

    const isValid = rules[name]?.test(value) ?? true;
    setErrors((prev) => ({ ...prev, [name]: isValid ? "" : `ข้อมูล ${name} ไม่ถูกต้อง` }));

    dispatch(setselectuser({ ...selectuser, [name]: value }));
  };


  const handleSubmit = async () => {
    if (Object.values(errors).some((err) => err)) return showNotification("กรุณาตรวจสอบข้อมูลอีกครั้ง");
    try {
      await axios.post(`${API_BASE_URL}/saveChangesToJson`, {
        changes: selectuser,
      });
      setEditMode(false);
      showNotification("แก้ไขข้อมูลแล้ว (รอการยืนยันจาก Chureeporn)");
      fetchUserDetails();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleConfirmChanges = async (change) => {
    try {
      await axios.post(`${API_BASE_URL}/confirmChanges`, { _id: change._id, name: change.name });
      showNotification("ยืนยันการเปลี่ยนแปลงแล้ว");
      dispatch(loadPersonalnotificationData());
    } catch (error) {
      console.error("Error in confirmChanges:", error);
    }
  };

  const handleRejectChanges = async (change) => {
    try {
      await axios.post(`${API_BASE_URL}/rejectChanges`, { _id: change._id, name: change.name });
      showNotification("ยกเลิกการเปลี่ยนแปลงแล้ว");
      dispatch(loadPersonalnotificationData());
    } catch (error) {
      console.error("Error in rejectChanges:", error);
    }
  };

  const showNotification = (message) => setNotification({ message, show: true });

  const renderFormFields = (fields) =>
    fields.map(({ label, name, type, value, disabled }) => (
      <Form.Group as={Row} className="mb-3" key={name}>
        <Form.Label column sm="6" className="text-center">
          {label}
        </Form.Label>
        <Col sm="6">
          <Form.Control
            as={type === "textarea" ? "textarea" : "input"}
            type={type}
            name={name}
            value={value ?? selectuser[name] ?? ""}
            onChange={handleChange}
            disabled={disabled || admin.name === "Chureeporn" || !editMode}
          />
          {errors[name] && <Alert variant="danger">{errors[name]}</Alert>}
        </Col>
      </Form.Group>
    ));

  const renderAdminButtons = () => {
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
              <Button variant="outline-danger" onClick={() => {setEditMode(false); setErrors({});}} className="ms-2">ยกเลิก</Button>
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
              {["ชื่อ-สกุล", "เบอร์โทรศัพท์", "เบอร์โทรศัพท์ผู้ติดต่อ", "อายุ", "การวินิจฉัยโรคหลัก", "การรับประทานยา Capecitabine", "เวลารับประทานยาช่วงเช้า", "เวลารับประทานยาช่วงเย็น", "เลขโรงพยาบาล", "การดำเนินการ"].map((header) => (
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
                <Button variant="outline-success" size="sm" onClick={() => handleConfirmChanges(selectedUser)} className="mx-1">ยืนยัน</Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleRejectChanges(selectedUser)} className="mx-1">ปฏิเสธ</Button>
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
        {renderFormFields([
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
        ])}
        {admin.name === "Apatnipa" && renderAdminButtons()}
      </Form>
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