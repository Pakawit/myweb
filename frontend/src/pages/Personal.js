import React, { useContext, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";

function Personal() {
  const { privateMemberMsg } = useContext(AppContext);
  const [editedFields, setEditedFields] = useState({}); // เพิ่มสถานะการแก้ไขแต่ละฟิลด์

  const member = privateMemberMsg;

  const handleEdit = (fieldName) => {
    setEditedFields({ ...editedFields, [fieldName]: true }); // ระบุฟิลด์ที่กำลังแก้ไข
  };

  const handleSave = (fieldName) => {
    // ทำการบันทึกข้อมูลในฟิลด์ที่แก้ไข
    console.log(`บันทึกข้อมูล ${fieldName}`);
    setEditedFields({ ...editedFields, [fieldName]: false }); // เมื่อบันทึกแล้วให้เปลี่ยนสถานะการแก้ไขเป็นเท็จ
  };

  const renderEditButton = (fieldName) => {
    if (editedFields[fieldName]) {
      return (
        <Button variant="success" onClick={() => handleSave(fieldName)}>บันทึก</Button>
      );
    } else {
      return (
        <Button variant="outline-secondary" onClick={() => handleEdit(fieldName)}>
          <i className="bi bi-box-arrow-in-down-left"></i>
        </Button>
      );
    }
  };

  const renderDataRow = (label, value, fieldName) => {
    return (
      <Row className="border border-dark p-2 mb-2">
        <Col className="col-5 d-flex justify-content-center">{label}</Col>
        <Col className="col-6 d-flex justify-content-center">{value}</Col>
        <Col className="col-1 d-flex justify-content-center">
          {renderEditButton(fieldName)}
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
