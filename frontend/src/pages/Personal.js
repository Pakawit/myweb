import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Button,
  Form,
  Row,
  Col,
  Modal,
  Alert,
  Table,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchMedicationsThunk } from "../features/medicationSlice";
import { setselectuser } from "../features/selectuserSlice";
import { fetchPersonalDataThunk } from "../features/personalSlice";

function Personal() {
  const { API_BASE_URL } = useContext(AppContext);
  const admin = useSelector((state) => state.admin);
  const selectuser = useSelector((state) => state.selectuser) || {};
  const personal = useSelector((state) => state.personal) || {};
  const medication = useSelector((state) => state.medication) || [];
  const dispatch = useDispatch();

  const [member, setMember] = useState(selectuser || {});
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    dispatch(fetchMedicationsThunk());
    dispatch(fetchPersonalDataThunk());
  }, [dispatch]);

  useEffect(() => {
    if (selectuser._id && !editMode) {
      const intervalId = setInterval(fetchUserDetails, 3000);
      return () => clearInterval(intervalId);
    }
  }, [selectuser, editMode]);

  const fetchUserDetails = async () => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/getuser`, {
        id: selectuser._id,
      });
      setMember(data);
      dispatch(setselectuser(data));
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const validate = (name, value) => {
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
    setErrors((prev) => ({
      ...prev,
      [name]: isValid ? "" : `ข้อมูล ${name} ไม่ถูกต้อง`,
    }));
  };

  const handleChange = ({ target: { name, value } }) => {
    validate(name, value);
    setMember((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => Object.values(errors).every((err) => !err);

  const handleSubmit = async () => {
    if (isFormValid()) {
      try {
        await axios.post(`${API_BASE_URL}/saveChangesToJson`, {
          changes: member,
        });
        setEditMode(false);
        showNotification("แก้ไขข้อมูลแล้ว (รอการยืนยันจาก Admin2)");
      } catch (error) {
        console.error("Error saving changes:", error);
      }
    } else {
      showNotification("กรุณาตรวจสอบข้อมูลอีกครั้ง");
    }
  };

  const handleAction = async (action, change) => {
    try {
      await axios.post(`${API_BASE_URL}/${action}`, {
        _id: change._id,
        name: change.name,
      });
      showNotification(
        action === "confirmChanges"
          ? "ยืนยันการเปลี่ยนแปลงแล้ว"
          : "ยกเลิกการเปลี่ยนแปลงแล้ว"
      );
    } catch (error) {
      console.error(`Error in ${action}:`, error);
    }
  };

  const getMsMedicineCount = (userId) =>
    medication.filter((med) => med.from === userId && med.status === 0).length;

  const showNotification = (message) => {
    setNotificationMessage(message);
    setShowModal(true);
  };

  return (
    <Container fluid>
      <Navigation />
      <h1>ข้อมูลส่วนบุคคล</h1>
      <Form onSubmit={(e) => e.preventDefault()}>
        {renderFormFields([
          { label: "ชื่อ-สกุล", name: "name", type: "text" },
          { label: "เบอร์โทรศัพท์", name: "phone", type: "text" },
          {
            label: "เบอร์โทรศัพท์ผู้ติดต่อ",
            name: "other_numbers",
            type: "text",
          },
          { label: "อายุ", name: "age", type: "number" },
          { label: "การวินิจฉัยโรคหลัก", name: "diagnosis", type: "textarea" },
          {
            label: "การรับประทานยา Capecitabine",
            name: "taking_capecitabine",
            type: "textarea",
          },
          {
            label: "เวลารับประทานยาช่วงเช้า",
            name: "morningTime",
            type: "time",
          },
          {
            label: "เวลารับประทานยาช่วงเย็น",
            name: "eveningTime",
            type: "time",
          },
          { label: "เลขโรงพยาบาล", name: "hospital_number", type: "text" },
          {
            label: "ขาดยา",
            name: "ms_medicine",
            value: getMsMedicineCount(member._id),
            disabled: true,
          },
        ])}
        {admin.name === "admin1" && renderAdminButtons()}
      </Form>
      {admin.name === "admin2" && renderAdmin2Table()}
      {renderModal()}
    </Container>
  );

  function renderFormFields(fields) {
    return fields.map(({ label, name, type, value, disabled }) => (
      <Form.Group as={Row} className="mb-3" key={name}>
        <Form.Label column sm="6" className="text-center">
          {label}
        </Form.Label>
        <Col sm="6">
          <Form.Control
            as={type === "textarea" ? "textarea" : "input"}
            type={type}
            name={name}
            value={value ?? member[name] ?? ""}
            onChange={handleChange}
            disabled={disabled || admin.name === "admin2" || !editMode}
          />
          {errors[name] && <Alert variant="danger">{errors[name]}</Alert>}
        </Col>
      </Form.Group>
    ));
  }

  function renderAdminButtons() {
    return (
      <Row className="mb-3">
        <Col sm={{ span: 6, offset: 6 }} className="d-flex justify-content-end">
          {editMode ? (
            <>
              <Button variant="outline-success" onClick={handleSubmit}>
                บันทึก
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => setEditMode(false)}
                className="ms-2"
              >
                ยกเลิก
              </Button>
            </>
          ) : (
            <Button variant="outline-dark" onClick={() => setEditMode(true)}>
              แก้ไข
            </Button>
          )}
        </Col>
      </Row>
    );
  }

  function renderAdmin2Table() {
    const selectedUser = personal[selectuser._id];

    return (
      selectedUser && (
        <Table striped bordered hover>
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
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{selectedUser.name}</td>
              <td>{selectedUser.phone}</td>
              <td>{selectedUser.other_numbers}</td>
              <td>{selectedUser.age}</td>
              <td>{selectedUser.diagnosis}</td>
              <td>{selectedUser.taking_capecitabine}</td>
              <td>{selectedUser.morningTime}</td>
              <td>{selectedUser.eveningTime}</td>
              <td>{selectedUser.hospital_number}</td>
              <td>
                <Button
                  variant="outline-success"
                  onClick={() => handleAction("confirmChanges", selectedUser)}
                >
                  ยืนยัน
                </Button>
                <Button
                  variant="outline-danger"
                  className="ms-2"
                  onClick={() => handleAction("rejectChanges", selectedUser)}
                >
                  ปฏิเสธ
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      )
    );
  }

  function renderModal() {
    return (
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
    );
  }
}

export default Personal;