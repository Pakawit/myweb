import React, { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Table, Button, Dropdown, Modal, Pagination } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { fetchEstimationsThunk } from "../features/estimationSlice";

function Estimation() {
  const admin = useSelector((state) => state.admin);
  const { API_BASE_URL } = useContext(AppContext);
  const estimation = useSelector((state) => state.estimation) || [];
  const selectuser = useSelector((state) => state.selectuser);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [hfsLevels, setHfsLevels] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    dispatch(fetchEstimationsThunk());
    const intervalId = setInterval(() => dispatch(fetchEstimationsThunk()), 5000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleHfsLevelChange = (estimationId, level) => {
    setHfsLevels((prevLevels) => ({
      ...prevLevels,
      [estimationId]: level,
    }));
  };

  const handleSubmit = async (_id) => {
    const hfsLevel = hfsLevels[_id];
    if (hfsLevel !== undefined && hfsLevel !== 0) {
      try {
        const response = await axios.put(`${API_BASE_URL}/evaluateHFS`, {
          userId: selectuser._id,
          adminName: admin.name,
          hfsLevel: hfsLevel === "ไม่พบอาการ" ? 5 : hfsLevel,
        });

        // ตรวจสอบ response ที่ได้จาก API
        setNotificationMessage(response.data.message);
        setShowNotificationModal(true);
        
        // ทำการอัพเดตสถานะการประเมิน
        dispatch(fetchEstimationsThunk());
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
    setShowNotificationModal(false);
  };

  const convertDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const filteredEstimations = estimation
    .filter((est) => est.from === selectuser._id)
    .sort((a, b) => {
      const dateA = new Date(`${convertDate(a.date)} ${a.time}`);
      const dateB = new Date(`${convertDate(b.date)} ${b.time}`);
      return dateA < dateB ? 1 : -1;
    });

  const totalPages = Math.ceil(filteredEstimations.length / itemsPerPage);

  const paginatedEstimations = filteredEstimations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPhotos = (photos) => {
    const leftPhotos = [photos[0], photos[1], photos[4], photos[5]]; 
    const rightPhotos = [photos[2], photos[3], photos[6], photos[7]]; 

    const createGrid = (photosArray) => {
      return (
        <Row className="g-0"> 
          {photosArray.map((photo, i) => (
            <Col key={i} xs={6} className="p-1"> 
              <img
                src={`data:image/jpeg;base64,${photo}`}
                alt={`รูปภาพ ${i}`}
                style={{ width: "100px", height: "100px", cursor: "pointer" }}
                onClick={() => handleShowModal(photo)}
              />
            </Col>
          ))}
        </Row>
      );
    };

    return (
      <Row>
        <Col>
          <h5 className="fw-bold">รูปฝั่งซ้าย</h5> 
          {createGrid(leftPhotos)}
        </Col>
        <Col>
          <h5 className="fw-bold">รูปฝั่งขวา</h5> 
          {createGrid(rightPhotos)}
        </Col>
      </Row>
    );
  };

  return (
    <Container fluid > 
      <Navigation />
      <Row>
        <h1>การประเมินอาการ HFS</h1>
        <Col>
          <Table responsive striped bordered hover> 
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
              {paginatedEstimations.length > 0 ? (
                paginatedEstimations.map((est, index) => (
                  <tr key={index} className={est.hfsLevel !== 0 ? "bg-secondary text-white" : ""}>
                    <td className="table-center">{est.date}</td>
                    <td className="table-center">{est.time}</td>
                    <td className="table-center">{renderPhotos(est.photos)}</td>
                    <td className="table-center">{est.painLevel}</td>
                    <td className="table-center">
                      {est.hfsLevel !== 0 ? (
                        <span>{est.hfsLevel === 5 ? "ไม่พบอาการ" : `ระดับที่ ${est.hfsLevel}`}</span>
                      ) : (
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-success" id="dropdown-basic">
                            ระดับที่ {hfsLevels[est._id] !== undefined ? hfsLevels[est._id] : ""}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {["ไม่พบอาการ", 1, 2, 3].map((level, idx) => (
                              <Dropdown.Item key={idx} onClick={() => handleHfsLevelChange(est._id, level)}>
                                {level}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </td>
                    <td>
                      <Button
                        variant={est.hfsLevel !== 0 ? "outline-secondary" : "outline-success"}
                        onClick={() => handleSubmit(est._id)}
                        disabled={est.hfsLevel !== 0}
                      >
                        {est.hfsLevel !== 0 ? "ยืนยันแล้ว" : "ยืนยัน"}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="table-center">ไม่มีข้อมูล</td>
                </tr>
              )}
            </tbody>
          </Table>
          <Pagination className="justify-content-end">
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {[...Array(totalPages).keys()].map((pageNumber) => (
              <Pagination.Item
                key={pageNumber + 1}
                active={pageNumber + 1 === currentPage}
                onClick={() => handlePageChange(pageNumber + 1)}
              >
                {pageNumber + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </Col>
      </Row>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton />
        <Modal.Body>
          {selectedImage && <img src={`data:image/jpeg;base64,${selectedImage}`} alt="รูปภาพ" style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "80vh", margin: "0 auto", display: "block" }} />}
        </Modal.Body>
      </Modal>
      <Modal show={showNotificationModal} onHide={handleCloseNotificationModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>ผลการประเมิน</Modal.Title>
        </Modal.Header>
        <Modal.Body>{notificationMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseNotificationModal}>ปิด</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Estimation;