import React, { useContext, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";

function Personal() {
  const { privateMemberMsg, socket } = useContext(AppContext);
  const [editedFields, setEditedFields] = useState({});
  const [formData, setFormData] = useState({});

  const member = privateMemberMsg;

  const handleEdit = (fieldName, value) => {
    setEditedFields({ ...editedFields, [fieldName]: true });
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleInputChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleSave = async (fieldName) => {
    // ส่งข้อมูลที่แก้ไขไปยังเซิร์ฟเวอร์ผ่าน Socket.IO
    
    socket.emit("edit-field", { memberId: member._id, fieldName, value: formData[fieldName] });
    setEditedFields({ ...editedFields, [fieldName]: false });
};

  const renderEditButton = (fieldName, value) => {
    if (editedFields[fieldName]) {
      return (
        <Button variant="success" onClick={() => handleSave(fieldName)}>บันทึก</Button>
      );
    } else {
      return (
        <Button variant="outline-secondary" onClick={() => handleEdit(fieldName, value)}>
          <i className="bi bi-box-arrow-in-down-left"></i>
        </Button>
      );
    }
  };

  const renderDataRow = (label, value, fieldName) => {
    return (
      <Row className="border border-dark p-2 mb-2">
        <Col className="col-5 d-flex justify-content-center">{label}</Col>
        <Col className="col-6 d-flex justify-content-center">
          {editedFields[fieldName] ? (
            <input
              type="text"
              value={formData[fieldName] || value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
            />
          ) : (
            value
          )}
        </Col>
        <Col className="col-1 d-flex justify-content-center">
          {renderEditButton(fieldName, value)}
        </Col>
      </Row>
    );
  };

  return (
    <Container>
      <Navigation />
      <Row>
        <Col>
          {renderDataRow("ชื่อ-สกุล", member.name, "name")}
          {renderDataRow("เบอร์โทรศัพท์", member.phone, "phone")}
          {renderDataRow("เบอร์โทรศัพท์ผู้ติดต่อ", member.other_numbers, "other_numbers")}
          {renderDataRow("อายุ", member.age, "age")}
          {renderDataRow("การวินิจฉัยโรคหลัก", member.diagnosis, "diagnosis")}
          {renderDataRow("การรับประทานยา Capecitabine", member.taking_capecitabine, "taking_capecitabine")}
          {renderDataRow("ยาที่ใช้ร่วม", member.other_medicine, "other_medicine")}
          {renderDataRow("ขาดยา", member.ms_medicine, "ms_medicine")}
          {renderDataRow("เลขโรงพยาบาล", member.hospital_number, "hospital_number")}
        </Col>
      </Row>
    </Container>
  );
}

export default Personal;
