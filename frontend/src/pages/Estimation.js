import React, { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Table, Button, Dropdown, Modal } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { fetchEstimationsThunk } from "../features/estimationSlice";

function Estimation() {
  const { API_BASE_URL } = useContext(AppContext);
  const estimation = useSelector((state) => state.estimation);
  const selectuser = useSelector((state) => state.selectuser);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [hfsLevels, setHfsLevels] = useState({});

  useEffect(() => {
    const fetchData = () => {
      axios.post(`${API_BASE_URL}/getestimation`);
    };

    dispatch(fetchEstimationsThunk());

    const intervalId = setInterval(() => {
      dispatch(fetchEstimationsThunk());
    }, 5000);
    window.addEventListener('beforeunload', fetchData);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', fetchData);
    };
  }, [dispatch, API_BASE_URL]);

  const handleHfsLevelChange = (estimationId, level) => {
    setHfsLevels((prevLevels) => ({
      ...prevLevels,
      [estimationId]: level,
    }));
  };

  const handleSubmit = async (_id) => {
    try {
      const hfsLevel = hfsLevels[_id];
      if (hfsLevel === undefined || hfsLevel === 0) return;

      await axios.put(`${API_BASE_URL}/editestimation`, {
        _id,
        hfsLevel: hfsLevel === "ไม่พบอาการ" ? 5 : hfsLevel,
      });
      dispatch(fetchEstimationsThunk());
      setShowNotificationModal(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleShowModal = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    window.location.reload(); 
  };

  return (
    <Container>
      <Navigation />
      <Row>
        <h1>การประเมินอาการ HFS</h1>
        <Col>
          <Table>
            <thead>
              <tr>
                <th className="table-center">วัน/เดือน/ปี</th>
                <th className="table-center">เวลา</th>
                <th className="table-center">รูป</th>
                <th className="table-center">ระดับความเจ็บปวด</th>
                <th className="table-center">การประเมินอาการ HFS</th>
                <th className="table-center">{}</th>
              </tr>
            </thead>
            <tbody>
              {estimation && selectuser && estimation.filter((est) => est.from === selectuser._id).length > 0 ? (
                estimation
                  .filter((est) => est.from === selectuser._id)
                  .map((est, index) => (
                    <tr key={index}>
                      <td className="table-center">{est.date}</td>
                      <td className="table-center">{est.time}</td>
                      <td className="table-center">
                        {est.photos &&
                          est.photos.map((photo, photoIndex) => (
                            <img
                              key={photoIndex}
                              src={`data:image/jpeg;base64,${photo}`}
                              alt={`รูปภาพ ${photoIndex}`}
                              style={{
                                width: "100px",
                                height: "100px",
                                marginRight: "10px",
                                cursor: "pointer",
                              }}
                              onClick={() => handleShowModal(photo)}
                            />
                          ))}
                      </td>
                      <td className="table-center">{est.painLevel}</td>
                      <td className="table-center">
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="outline-success"
                            id="dropdown-basic"
                          >
                            ระดับที่ {hfsLevels[est._id] !== undefined ? hfsLevels[est._id] : (est.hfsLevel === 0 ? "" : est.hfsLevel)}
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            {["ไม่พบอาการ", 1, 2, 3].map((level, index) => (
                              <Dropdown.Item
                                key={index}
                                onClick={() => handleHfsLevelChange(est._id, level)}
                              >
                                {level}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                      <td>
                        <Button
                          variant="outline-success"
                          onClick={() => handleSubmit(est._id)}
                        >
                          แจ้งผู้ป่วย
                        </Button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="table-center">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="รูปภาพ"
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "80vh",
                margin: "auto",
                display: "block",
              }}
            />
          )}
        </Modal.Body>
      </Modal>
      <Modal show={showNotificationModal} onHide={handleCloseNotificationModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>แจ้งเตือน</Modal.Title>
        </Modal.Header>
        <Modal.Body>แจ้งเตือนเรียบร้อย</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseNotificationModal}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Estimation;