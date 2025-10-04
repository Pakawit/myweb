import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Card,
  ProgressBar,
} from "react-bootstrap";
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
  const [previews, setPreviews] = useState(Array(8).fill(null));
  const [painLevel, setPainLevel] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selectuser || !selectuser._id) navigate("/");
  }, [selectuser, navigate]);

  const validateFile = (file) => {
    if (!file) return "กรุณาเลือกไฟล์";
    const valid = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!valid.includes(file.type)) return "รองรับเฉพาะ JPG / PNG / WEBP";
    if (file.size > 5 * 1024 * 1024) return "ไฟล์ต้องไม่เกิน 5MB";
    return null;
  };

  const handleImageChange = (index, file) => {
    const err = validateFile(file);
    if (err) {
      setMessage(err);
      return;
    }

    const next = [...images];
    next[index] = file;
    setImages(next);

    const reader = new FileReader();
    reader.onload = (e) => {
      const pv = [...previews];
      pv[index] = e.target.result;
      setPreviews(pv);
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.some((img) => !img)) {
      setMessage("❗ กรุณาเลือกรูปภาพให้ครบทั้ง 8 รูป");
      return;
    }
    try {
      setBusy(true);
      const base64Images = await Promise.all(images.map((img) => resizeImage(img)));

      const now = new Date();
      const date = now.toLocaleDateString("th-TH");
      const time = now.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });

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
    } finally {
      setBusy(false);
    }
  };

  const resizeImage = (file, maxWidth = 800, maxHeight = 800) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          const canvas = document.createElement("canvas");
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

  return (
    <Container fluid className="px-2 px-sm-3 px-md-4">
      <Navigation />

      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 my-3">
        <h2 className="h4 h2-md m-0">สร้างข้อมูลการประเมินอาการ HFS</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate("/estimation")}>
            กลับไปหน้าการประเมิน
          </Button>
        </div>
      </div>

      {message && <Alert variant="warning">{message}</Alert>}

      <Form onSubmit={handleSubmit}>
        <div className="pb-5 pb-md-4">
          <Card className="mb-3">
            <Card.Body>
              <Row className="g-3">
                {[...Array(8)].map((_, i) => (
                  <Col key={i} xs={6} md={3}>
                    <div className="border rounded-3 p-2 h-100 d-flex flex-column">
                      <div className="small text-muted mb-2">รูปที่ {i + 1}</div>

                      <div
                        className="d-flex justify-content-center align-items-center mb-2 rounded bg-light"
                        style={{ aspectRatio: "1 / 1", overflow: "hidden" }}
                      >
                        {previews[i] ? (
                          <img
                            src={previews[i]}
                            alt={`preview-${i + 1}`}
                            className="img-fluid"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span className="text-secondary small">ยังไม่เลือกรูป</span>
                        )}
                      </div>

                      <Form.Control
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleImageChange(i, e.target.files?.[0])}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {busy && (
            <div className="mt-2">
              <ProgressBar animated now={70} />
            </div>
          )}
        </div>

        <div
          className="position-sticky bottom-0 start-0 end-0 bg-body border-top"
          style={{ zIndex: 1020 }}
        >
          <Container fluid className="px-2 px-sm-3 px-md-4">
            <Row className="align-items-center g-2 py-2">
              <Col xs={12} md="auto">
                <Form.Label className="fw-semibold m-0">ระดับความเจ็บปวด</Form.Label>
              </Col>

              <Col xs={12} md className="order-3 order-md-2">
                <Form.Range
                  value={painLevel}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  aria-label="Pain level"
                />
              </Col>

              <Col xs="auto" className="order-2 order-md-3">
                <Form.Control
                  type="number"
                  value={painLevel}
                  min={0}
                  max={10}
                  onChange={(e) =>
                    setPainLevel(Math.max(0, Math.min(10, Number(e.target.value ?? 0))))
                  }
                  className="text-center"
                  style={{ width: 72 }}
                />
              </Col>

              <Col xs={12} md="auto" className="ms-md-auto order-4">
                <div className="d-flex justify-content-end">
                  <Button
                    variant="outline-success"
                    type="submit"
                    disabled={busy}
                    className="px-4"
                  >
                    {busy ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </Form>
    </Container>
  );
}

export default CreateEstimation;