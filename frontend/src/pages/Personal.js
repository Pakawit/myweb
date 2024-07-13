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
  const [originalMember, setOriginalMember] = useState(selectuser); // เก็บค่าเดิม
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
      ms_medicine: msMedicineCount,
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
    setOriginalMember(member); // เก็บค่าเดิมเมื่อเริ่มแก้ไข
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setMember(originalMember); // ย้อนกลับไปใช้ค่าเดิม
    setEditMode(false);
    setErrors({}); // ลบข้อความแจ้งเตือน
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Container>
      <Navigation />
      <h1>ข้อมูลส่วนบุคคล</h1>
      <Form onSubmit={(e) => e.preventDefault()}>
        {[
          { label: "ชื่อ-สกุล", name: "name" },
          { label: "เบอร์โทรศัพท์", name: "phone" },
          { label: "เบอร์โทรศัพท์ผู้ติดต่อ", name: "other_numbers" },
          { label: "อายุ", name: "age", type: "number" },
          { label: "การวินิจฉัยโรคหลัก", name: "diagnosis", as: "textarea" },
          { label: "การรับประทานยา Capecitabine", name: "taking_capecitabine", as: "textarea" },
          { label: "ยาที่ใช้ร่วม", name: "other_medicine", as: "textarea" },
          { label: "เลขโรงพยาบาล", name: "hospital_number" }
        ].map((field, index) => (
          <Form.Group as={Row} className="mb-3" key={index}>
            <Form.Label column sm="6" style={{ textAlign: "center" }}>
              {field.label}
            </Form.Label>
            <Col sm="6">
              <Form.Control
                type={field.type || "text"}
                as={field.as}
                name={field.name}
                value={member[field.name] || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              {errors[field.name] && <Alert variant="danger">{errors[field.name]}</Alert>}
            </Col>
          </Form.Group>
        ))}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            ขาดยา
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="ms_medicine"
              value={member.ms_medicine || ""}
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
          <Modal.Title>การแก้ไขเสร็จสิ้น</Modal.Title>
        </Modal.Header>
        <Modal.Body>แก้ไขข้อมูลเรียบร้อยแล้ว</Modal.Body>
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