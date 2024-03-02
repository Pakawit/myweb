import React, { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { updateUsers } from "../features/usersSlice";

function Personal() {
  const user = useSelector((state) => state.user);
  const { member, setMember } = useContext(AppContext);
  const [editedFields, setEditedFields] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!member._id) {
      navigate("/");
    }
  }, [user, member._id, setMember, navigate]);

  const handleEdit = (fieldName) => {
    setEditedFields({ ...editedFields, [fieldName]: true });
  };

  const handleSave = async (fieldName) => {
    axios
      .put("http://localhost:5001/update", { _id: member._id, ...member })
      .then((res) => {
        dispatch(updateUsers(res.data))
      })
      .catch((err) => console.log(err));
    setEditedFields({ ...editedFields, [fieldName]: false });
  };

  const renderEditButton = (fieldName) => {
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
          onClick={() => handleEdit(fieldName)}
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
              value={value}
              onChange={(e) =>
                setMember({ ...member, [fieldName]: e.target.value })
              }
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
    </Container>
  );
}

export default Personal;
