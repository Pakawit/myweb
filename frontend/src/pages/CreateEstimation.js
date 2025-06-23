import React, { useState, useContext, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import Navigation from "../components/Navigation";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateEstimation() {
  const { API_BASE_URL } = useContext(AppContext);
  const selectuser = useSelector((state) => state.selectuser);
  const navigate = useNavigate();

  const [images, setImages] = useState(Array(8).fill(null));
  const [painLevel, setPainLevel] = useState(0); 
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selectuser || !selectuser._id) {
      navigate("/"); 
    }
  }, [selectuser, navigate]);

  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (images.some((img) => !img)) {
      return setMessage("❗ กรุณาเลือกรูปภาพให้ครบทั้ง 8 รูป");
    }
  
    try {
      const base64Images = await Promise.all(
        images.map((img) => resizeImage(img))
      );
  
      const now = new Date();
      const date = now.toLocaleDateString("th-TH");
      const time = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  
      const payload = {
        from: selectuser._id,
        painLevel,
        photos: base64Images,
        date,
        time,
        to: "admin",
      };
  
      await axios.post(`${API_BASE_URL}/createstimation`, payload);
      navigate("/estimation");
    } catch (err) {
      console.error("Error creating estimation:", err);
      setMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };  

  const resizeImage = (file, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve(resizedBase64.split(",")[1]); 
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <Container fluid >
      <Navigation />
      <h2 className="mb-4">สร้างข้อมูลการประเมินอาการ HFS</h2>
      {message && <Alert variant="warning">{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row>
          {[...Array(8)].map((_, i) => (
            <Col xs={6} md={3} className="mb-3" key={i}>
              <Form.Group>
                <Form.Label>รูปที่ {i + 1}</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(i, e.target.files[0])}
                />
              </Form.Group>
            </Col>
          ))}
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>ระดับความเจ็บปวด (0-10)</Form.Label>
          <Form.Select
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
          >
            {[...Array(11)].map((_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button variant="outline-success" type="submit">
          บันทึก
        </Button>
      </Form>
    </Container>
  );
}

export default CreateEstimation;