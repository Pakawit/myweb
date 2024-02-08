import React, { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import { useSelector } from "react-redux";
import {useNavigate} from 'react-router-dom'

function Personal() {
  const user = useSelector((state) => state.user);
  const { member, setMember, socket } = useContext(AppContext);
  const [editedFields, setEditedFields] = useState({});
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if(!member._id){
      navigate('/');
    }
    // Emit the 'new-select' event to fetch the initial member data
    socket.emit("new-select", { memberId: member._id });

    // Listen for changes in member data from the server
    socket.on("new-select", (payload) => {
      setMember(payload);
    });

    // Clean up socket event listener when component unmounts
    return () => {
      socket.off("new-select");
    };
  }, [socket, user, member._id, setMember, navigate]); // Include only necessary dependencies

  const handleEdit = (fieldName, value) => {
    setEditedFields({ ...editedFields, [fieldName]: true });
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleInputChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleSave = async (fieldName) => {
    // Emit the 'edit-field' event to update the member data
    socket.emit("edit-field", {
      memberId: member._id,
      fieldName,
      value: formData[fieldName],
    });

    // Reset editedFields state and fetch updated member data
    setEditedFields({ ...editedFields, [fieldName]: false });
    socket.emit("new-select", { memberId: member._id });
  };

  const renderEditButton = (fieldName, value) => {
    if (editedFields[fieldName]) {
      return (
        <Button variant="success" onClick={() => handleSave(fieldName)}>
          บันทึก
        </Button>
      );
    } else {
      return (
        <Button
          variant="outline-secondary"
          onClick={() => handleEdit(fieldName, value)}
        >
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
          {renderDataRow("ยาที่ใช้ร่วม", member.other_medicine, "other_medicine")}
          {renderDataRow("ขาดยา", member.ms_medicine, "ms_medicine")}
          {renderDataRow(
            "เลขโรงพยาบาล",
            member.hospital_number,
            "hospital_number"
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Personal;
