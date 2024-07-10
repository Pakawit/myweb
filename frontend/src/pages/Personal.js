import React, { useContext, useEffect, useState } from "react";
import { Container, Button, Form, Row, Col } from "react-bootstrap";
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
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);

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

  const handleChange = (name, value) => {
    setMember((prevMember) => ({
      ...prevMember,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (editMode) {
      axios
        .put(`${API_BASE_URL}/update`, member)
        .then((res) => {
          dispatch(setselectuser(res.data));
          setEditMode(false);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  return (
    <Container>
      <Navigation />
      <h1>ข้อมูลส่วนบุคคล</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            ชื่อ-สกุล
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              name="name"
              value={member.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={!editMode}
            />
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
              value={member.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={!editMode}
            />
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
              value={member.other_numbers}
              onChange={(e) => handleChange("other_numbers", e.target.value)}
              disabled={!editMode}
            />
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
              value={member.age}
              onChange={(e) => handleChange("age", e.target.value)}
              disabled={!editMode}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            การวินิจฉัยโรคหลัก
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              as="textarea"
              name="diagnosis"
              value={member.diagnosis}
              onChange={(e) => handleChange("diagnosis", e.target.value)}
              disabled={!editMode}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            การรับประทานยา Capecitabine
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              as="textarea"
              name="taking_capecitabine"
              value={member.taking_capecitabine}
              onChange={(e) =>
                handleChange("taking_capecitabine", e.target.value)
              }
              disabled={!editMode}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="6" style={{ textAlign: "center" }}>
            ยาที่ใช้ร่วม
          </Form.Label>
          <Col sm="6">
            <Form.Control
              type="text"
              as="textarea"
              name="other_medicine"
              value={member.other_medicine}
              onChange={(e) => handleChange("other_medicine", e.target.value)}
              disabled={!editMode}
            />
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
              value={member.ms_medicine}
              disabled
            />
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
              value={member.hospital_number}
              onChange={(e) => handleChange("hospital_number", e.target.value)}
              disabled={!editMode}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Col
            sm={{ span: 6, offset: 6 }}
            className="d-flex justify-content-end"
          >
            {editMode ? (
              <Button
                variant="outline-success"
                type="button"
                onClick={handleSubmit}
              >
                บันทึก
              </Button>
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
    </Container>
  );
}

export default Personal;
