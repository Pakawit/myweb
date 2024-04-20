import React, { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal } from "react-bootstrap"; 
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { updateUsers } from "../features/usersSlice";

function Personal() {
  const user = useSelector((state) => state.user);
  const { member, setMember } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false); 
  const [editedField, setEditedField] = useState(""); 
  const [editedValue, setEditedValue] = useState(""); // Store the edited value
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!member._id) {
      navigate("/");
    }
  }, [user, member._id, setMember, navigate]);

  const handleEdit = (fieldName, fieldValue) => {
    setEditedField(fieldName); 
    setEditedValue(fieldValue); // Set the edited value when clicking edit
    setShowModal(true); 
  };

  const handleSave = async () => {
    axios
      .put("http://localhost:5001/update", { _id: member._id, [editedField]: editedValue }) // Use editedValue instead of member[editedField]
      .then((res) => {
        dispatch(updateUsers(res.data));
        setMember(prevMember => ({
          ...prevMember,
          [editedField]: editedValue // Update the member state after saving
        }));
        setShowModal(false); 
      })
      .catch((err) => console.log(err));
  };

  const handleClose = () => {
    setShowModal(false); 
  };

  const renderDataRow = (label, value, fieldName) => {
    return (
      <Row className="border border-dark p-2 mb-2">
        <Col className="col-5 d-flex justify-content-center">{label}</Col>
        <Col className="col-6 d-flex justify-content-center">{value}</Col>
        <Col className="col-1 d-flex justify-content-center">
          <Button
            variant="outline-secondary"
            onClick={() => handleEdit(fieldName, value)} // Pass the current field value to handleEdit
          >
            <i className="bi bi-box-arrow-in-down-left"></i>
          </Button>
        </Col>
      </Row>
    );
  };

  return (
    <Container>
      <Navigation />
      <Row>
        <h1>ข้อมูลส่วนบุคคล</h1>
        <Col>
          {renderDataRow("ชื่อ-สกุล", member.name, "name")}
          {renderDataRow("เบอร์โทรศัพท์", member.phone, "phone")}
          {renderDataRow(
            "เบอร์โทรศัพท์ผู้ติดต่อ",
            member.other_numbers,
            "other_numbers"
          )}
          {renderDataRow("อายุ", member.age, "age")}
          {renderDataRow("การวินิจฉัยโรคหลัก", member.diagnosis, "diagnosis")}
          {renderDataRow(
            "การรับประทานยา Capecitabine",
            member.taking_capecitabine,
            "taking_capecitabine"
          )}
          {renderDataRow(
            "ยาที่ใช้ร่วม",
            member.other_medicine,
            "other_medicine"
          )}
          {renderDataRow("ขาดยา", member.ms_medicine, "ms_medicine")}
          {renderDataRow(
            "เลขโรงพยาบาล",
            member.hospital_number,
            "hospital_number"
          )}
        </Col>
      </Row>

    
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>แก้ไขข้อมูลส่วนบุคคล - {editedField}</Modal.Title> 
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            value={editedValue} // Use editedValue instead of member[editedField]
            onChange={(e) => setEditedValue(e.target.value)} // Update editedValue when changing input
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save 
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Personal;
