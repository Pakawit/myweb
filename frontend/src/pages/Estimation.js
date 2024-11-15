import React, { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Table, Button, Dropdown, Modal } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { loadEstimationHFSData } from "../features/estimationHFSSlice";
import ReactPaginate from "react-paginate";

function Estimation() {
  const admin = useSelector((state) => state.admin);
  const { API_BASE_URL } = useContext(AppContext);
  const estimationHFS = useSelector((state) => state.estimationHFS);
  const selectuser = useSelector((state) => state.selectuser);
  const dispatch = useDispatch();
  const [estimations, setEstimations] = useState([]);
  const [totalEstimations, setTotalEstimations] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [hfsLevels, setHfsLevels] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 1;

  const fetchEstimations = async (page = 0) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/getestimation`, {
        from: selectuser._id,
        page,
        limit: itemsPerPage,
      });
      setEstimations(response.data.data);
      setTotalEstimations(response.data.total);
    } catch (error) {
      console.error("Error fetching estimations:", error);
    }
  };

  useEffect(() => {
    fetchEstimations(currentPage);

    const intervalId = setInterval(() => {
      fetchEstimations(currentPage);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [currentPage, selectuser._id, API_BASE_URL]);

  useEffect(() => {
    dispatch(loadEstimationHFSData());
  }, [dispatch]);

  const handleHfsLevelChange = (estimationId, level) => {
    setHfsLevels((prevLevels) => ({
      ...prevLevels,
      [estimationId]: level,
    }));
  };

  const handleSubmit = async (estimationId) => {
    const hfsLevel = hfsLevels[estimationId];
    if (hfsLevel !== undefined && hfsLevel !== 0) {
      try {
        const response = await axios.put(`${API_BASE_URL}/evaluateHFS`, {
          estimationId,
          userId: selectuser._id,
          userName: selectuser.name,
          adminName: admin.name,
          hfsLevel: hfsLevel === "ไม่พบอาการ" ? 5 : hfsLevel,
        });
  
        setNotification({ show: true, message: response.data.message });
        await fetchEstimations(currentPage);
        dispatch(loadEstimationHFSData());
      } catch (error) {
        console.error("Error submitting evaluation:", error);
      }
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
    setNotification({ show: false, message: "" });
  };

  const renderPhotos = (photos) => {
    const leftPhotos = [photos[0], photos[1], photos[4], photos[5]];
    const rightPhotos = [photos[2], photos[3], photos[6], photos[7]];

    const createGrid = (photosArray) => (
      <Row className="g-0">
        {photosArray.map((photo, i) => (
          <Col key={i} xs={6} className="p-1 d-flex justify-content-center">
            <img
              src={`data:image/jpeg;base64,${photo}`}
              alt={`รูปภาพ ${i}`}
              className="img-fluid"
              style={{ cursor: "pointer", maxWidth: "150px", maxHeight: "150px" }}
              onClick={() => handleShowModal(photo)}
            />
          </Col>
        ))}
      </Row>
    );

    return (
      <Row>
        <Col>
          <h5 className="fw-bold text-center">รูปฝั่งซ้าย</h5>
          {createGrid(leftPhotos)}
        </Col>
        <Col>
          <h5 className="fw-bold text-center">รูปฝั่งขวา</h5>
          {createGrid(rightPhotos)}
        </Col>
      </Row>
    );
  };

  const checkEstimationStatus = (estimationId, hfsLevel) => {
    const evaluations = estimationHFS[estimationId]?.evaluations || {};
    const ApatnipaLevel = evaluations.Apatnipa?.hfsLevel;
    const ChureepornLevel = evaluations.Chureeporn?.hfsLevel;
  
    if (hfsLevel === 0 && Object.keys(evaluations).length === 0) {
      return { disabled: false, message: "ยืนยัน" };
    }
  
    if (Object.keys(evaluations).length === 0) {
      return { disabled: true, message: "ประเมินแล้ว" };
    }
  
    if (ApatnipaLevel !== undefined && admin.name === "Apatnipa") {
      return { disabled: true, message: "รอการประเมินจาก Chureeporn" };
    }
  
    if (ChureepornLevel !== undefined && admin.name === "Chureeporn") {
      return { disabled: true, message: "รอการประเมินจาก Apatnipa" };
    }
  
    return { disabled: false, message: "ยืนยัน" };
  };
  
  const renderHfsLevel = (est) => {
    const adminEvaluatedLevel = estimationHFS[est._id]?.evaluations?.[admin.name]?.hfsLevel;
    const userEvaluation = adminEvaluatedLevel !== undefined ? `คุณประเมินว่า: ${adminEvaluatedLevel === 5 ? "ไม่พบอาการ" : `ระดับที่ ${adminEvaluatedLevel}`}` : null;

    if (est.hfsLevel !== 0) return <span>{est.hfsLevel === 5 ? "ไม่พบอาการ" : `ระดับที่ ${est.hfsLevel}`}</span>;
    if (userEvaluation) return <span>{userEvaluation}</span>;

    return (
      <Dropdown>
        <Dropdown.Toggle variant="outline-success" id="dropdown-basic">
          ระดับที่ {hfsLevels[est._id] ?? ""}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {["ไม่พบอาการ", 1, 2, 3].map((level, idx) => (
            <Dropdown.Item key={idx} onClick={() => handleHfsLevelChange(est._id, level)}>
              {level}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <Container fluid>
      <Navigation />
      <Row>
        <h1>การประเมินอาการ HFS</h1>
        <Col>
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th className="text-center">วัน/เดือน/ปี</th>
                <th className="text-center">เวลา</th>
                <th className="text-center">รูป</th>
                <th className="text-center">ระดับความเจ็บปวด</th>
                <th className="text-center">การประเมินอาการ HFS</th>
                <th className="text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {estimations.length > 0 ? (
                estimations.map((est) => {
                  const { disabled, message } = checkEstimationStatus(est._id, est.hfsLevel);
                  return (
                    <tr key={est._id} className={est.hfsLevel !== 0 ? "bg-secondary text-white" : ""}>
                      <td className="text-center">{est.date}</td>
                      <td className="text-center">{est.time}</td>
                      <td className="text-center">{renderPhotos(est.photos)}</td>
                      <td className="text-center">{est.painLevel}</td>
                      <td className="text-center">{renderHfsLevel(est)}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center">
                          <Button
                            variant={est.hfsLevel !== 0 ? "outline-secondary" : "outline-success"}
                            onClick={() => handleSubmit(est._id)}
                            disabled={disabled}
                          >
                            {disabled ? message : "ยืนยัน"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {totalEstimations > itemsPerPage && (
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              pageCount={Math.ceil(totalEstimations / itemsPerPage)}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageChange}
              containerClassName={"pagination justify-content-end"}
              activeClassName={"active"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousClassName={"page-item"}
              previousLinkClassName={"page-link"}
              nextClassName={"page-item"}
              nextLinkClassName={"page-link"}
              breakClassName={"page-item"}
              breakLinkClassName={"page-link"}
            />
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton />
        <Modal.Body>
          {selectedImage && (
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="รูปภาพ"
              className="img-fluid"
              style={{ maxHeight: "80vh", margin: "0 auto", display: "block" }}
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal show={notification.show} onHide={handleCloseNotificationModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>ผลการประเมิน</Modal.Title>
        </Modal.Header>
        <Modal.Body>{notification.message}</Modal.Body>
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