import React, { useContext, useEffect, useState } from "react";
import { Container, Button, Form, Row, Col, Modal, Alert } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setselectuser } from "../features/selectuserSlice";
import { fetchMedicationsThunk } from "../features/medicationSlice";

function Personal() {
  const selectuser = useSelector((state) => state.selectuser);
  const medication = useSelector((state) => state.medication) || [];
  const { API_BASE_URL } = useContext(AppContext);
  const [member, setMember] = useState(selectuser);
  const [originalMember, setOriginalMember] = useState(selectuser); 
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchMedicationsThunk());
  }, [dispatch]);

  useEffect(() => {
    const msMedicineCount = medication.filter((med) => med.from === selectuser._id && med.status === 0).length;
    setMember((prevMember) => ({
      ...prevMember,
      ms_medicine: msMedicineCount > 0 ? msMedicineCount : 0,
    }));
  }, [medication, selectuser._id]);

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
      axios
        .put(`${API_BASE_URL}/update`, member)
        .then((res) => {
          dispatch(setselectuser(res.data));
          setEditMode(false);
          setShowModal(true);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleEditClick = () => {
    setOriginalMember(member); 
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setMember(originalMember); 
    setEditMode(false);
    setErrors({}); 
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Container fluid>
        <Navigation />
      <h1>ข้อมูลส่วนบุคคล</h1>
      <Form onSubmit={(e) => e.preventDefault()}>
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
              disabled={!editMode}
            />
            {errors.name && <Alert variant="danger">{errors.name}</Alert>}
          </Col>
        </Form.Group>
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
              disabled={!editMode}
            />
            {errors.phone && <Alert variant="danger">{errors.phone}</Alert>}
          </Col>
        </Form.Group>
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
              disabled={!editMode}
            />
            {errors.other_numbers && <Alert variant="danger">{errors.other_numbers}</Alert>}
          </Col>
        </Form.Group>
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
              disabled={!editMode}
            />
            {errors.age && <Alert variant="danger">{errors.age}</Alert>}
          </Col>
        </Form.Group>
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
              disabled={!editMode}
            />
            {errors.diagnosis && <Alert variant="danger">{errors.diagnosis}</Alert>}
          </Col>
        </Form.Group>
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
              disabled={!editMode}
            />
            {errors.taking_capecitabine && <Alert variant="danger">{errors.taking_capecitabine}</Alert>}
          </Col>
        </Form.Group>
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
              disabled={!editMode}
            />
            {errors.morningTime && <Alert variant="danger">{errors.morningTime}</Alert>}
          </Col>
        </Form.Group>
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
              disabled={!editMode}
            />
            {errors.eveningTime && <Alert variant="danger">{errors.eveningTime}</Alert>}
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            ยาที่ใช้ร่วม
          </Form.Label>
          <Col sm="6">
            <Form.Control
              as="textarea"
              name="other_medicine"
              value={member.other_medicine || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
            {errors.other_medicine && <Alert variant="danger">{errors.other_medicine}</Alert>}
          </Col>
        </Form.Group>
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
              disabled={!editMode}
            />
            {errors.hospital_number && <Alert variant="danger">{errors.hospital_number}</Alert>}
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            ขาดยา
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="ms_medicine"
              value={member.ms_medicine > 0 ? member.ms_medicine : 0} // Show 0 if no missed medications
              disabled
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Col
            sm={{ span: 6, offset: 6 }}
            className="d-flex justify-content-end"
          >
            {editMode ? (
              <>
                <Button
                  variant="outline-success"
                  type="button"
                  onClick={handleSubmit}
                >
                  บันทึก
                </Button>
                <Button
                  variant="outline-danger"
                  type="button"
                  onClick={handleCancelEdit}
                  style={{ marginLeft: "10px" }}
                >
                  ยกเลิก
                </Button>
              </>
            ) : (
              <Button
                variant="outline-dark"
                type="button"
                onClick={handleEditClick}
              >
                แก้ไข
              </Button>
            )}
          </Col>
        </Form.Group>
      </Form>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>แจ้งเตือน</Modal.Title>
        </Modal.Header>
        <Modal.Body>แก้ไขข้อมูลเรียบร้อย</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Personal;