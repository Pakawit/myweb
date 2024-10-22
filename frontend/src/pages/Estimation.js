import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Dropdown,
  Modal,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { fetchEstimationHFSThunk } from "../features/estimationHFSSlice";
import ReactPaginate from "react-paginate";

function Estimation() {
  const admin = useSelector((state) => state.admin);
  const { API_BASE_URL } = useContext(AppContext);
  const estimationHFS = useSelector((state) => state.estimationHFS) || {};
  const selectuser = useSelector((state) => state.selectuser) || {};
  const dispatch = useDispatch();
  const [estimations, setEstimations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [hfsLevels, setHfsLevels] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2;

  const fetchEstimations = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/getestimation`, {
        from: selectuser._id,
      });
      setEstimations(response.data);
    } catch (error) {
      console.error("Error fetching estimations:", error);
    }
  };

  useEffect(() => {
    dispatch(fetchEstimationHFSThunk());
    fetchEstimations();

    const intervalId = setInterval(() => {
      fetchEstimations();
      dispatch(fetchEstimationHFSThunk());
    }, 3000);

    return () => clearInterval(intervalId);
  }, [dispatch, selectuser, API_BASE_URL]);

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
          user: selectuser,
          adminName: admin.name,
          hfsLevel: hfsLevel === "ไม่พบอาการ" ? 5 : hfsLevel,
        });

        setNotificationMessage(response.data.message);
        setShowNotificationModal(true);

        await fetchEstimations();

        dispatch(fetchEstimationHFSThunk());
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

  const filteredEstimations = estimations.sort((a, b) => {
    const dateA = new Date(`${convertDate(a.date)} ${a.time}`);
    const dateB = new Date(`${convertDate(b.date)} ${b.time}`);
    return dateA < dateB ? 1 : -1;
  });

  const paginatedEstimations = filteredEstimations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
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

  const checkEstimationStatus = (estimationId, hfsLevel) => {
    const evaluations = estimationHFS[estimationId]?.evaluations || {};
    const admin1Level = evaluations.admin1?.hfsLevel;
    const admin2Level = evaluations.admin2?.hfsLevel;

    if (hfsLevel === 0 && Object.keys(evaluations).length === 0) {
      return { disabled: false, message: "ยืนยัน" };
    }

    if (Object.keys(evaluations).length === 0) {
      return { disabled: true, message: "ประเมินแล้ว" };
    }

    if (admin1Level !== undefined && admin.name === "admin1") {
      return { disabled: true, message: "รอการประเมินจาก Admin2" };
    }

    if (admin2Level !== undefined && admin.name === "admin2") {
      return { disabled: true, message: "รอการประเมินจาก Admin1" };
    }

    return { disabled: false, message: "ยืนยัน" };
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
                paginatedEstimations.map((est) => {
                  const { disabled, message } = checkEstimationStatus(
                    est._id,
                    est.hfsLevel
                  );
                  return (
                    <tr
                      key={est._id}
                      className={
                        est.hfsLevel !== 0 ? "bg-secondary text-white" : ""
                      }
                    >
                      <td className="table-center">{est.date}</td>
                      <td className="table-center">{est.time}</td>
                      <td className="table-center">
                        {renderPhotos(est.photos)}
                      </td>
                      <td className="table-center">{est.painLevel}</td>
                      <td className="table-center">
                        {est.hfsLevel !== 0 ? (
                          <span>
                            {est.hfsLevel === 5
                              ? "ไม่พบอาการ"
                              : `ระดับที่ ${est.hfsLevel}`}
                          </span>
                        ) : admin.name === "admin1" &&
                          estimationHFS[est._id]?.evaluations?.admin1
                            ?.hfsLevel !== undefined ? (
                          <span>{`คุณประเมินว่า: ${
                            estimationHFS[est._id]?.evaluations?.admin1
                              ?.hfsLevel === 5
                              ? "ไม่พบอาการ"
                              : `ระดับที่ ${
                                  estimationHFS[est._id]?.evaluations?.admin1
                                    ?.hfsLevel
                                }`
                          }`}</span>
                        ) : admin.name === "admin2" &&
                          estimationHFS[est._id]?.evaluations?.admin2
                            ?.hfsLevel !== undefined ? (
                          <span>{`คุณประเมินว่า: ${
                            estimationHFS[est._id]?.evaluations?.admin2
                              ?.hfsLevel === 5
                              ? "ไม่พบอาการ"
                              : `ระดับที่ ${
                                  estimationHFS[est._id]?.evaluations?.admin2
                                    ?.hfsLevel
                                }`
                          }`}</span>
                        ) : (
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="outline-success"
                              id="dropdown-basic"
                            >
                              ระดับที่{" "}
                              {hfsLevels[est._id] !== undefined
                                ? hfsLevels[est._id]
                                : ""}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              {["ไม่พบอาการ", 1, 2, 3].map((level, idx) => (
                                <Dropdown.Item
                                  key={idx}
                                  onClick={() =>
                                    handleHfsLevelChange(est._id, level)
                                  }
                                >
                                  {level}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </td>

                      <td>
                        <Button
                          variant={
                            est.hfsLevel !== 0
                              ? "outline-secondary"
                              : "outline-success"
                          }
                          onClick={() => handleSubmit(est._id)}
                          disabled={disabled}
                        >
                          {disabled ? message : "ยืนยัน"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="table-center">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {filteredEstimations.length > itemsPerPage && (
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              pageCount={Math.ceil(filteredEstimations.length / itemsPerPage)}
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
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "80vh",
                margin: "0 auto",
                display: "block",
              }}
            />
          )}
        </Modal.Body>
      </Modal>
      <Modal
        show={showNotificationModal}
        onHide={handleCloseNotificationModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>ผลการประเมิน</Modal.Title>
        </Modal.Header>
        <Modal.Body>{notificationMessage}</Modal.Body>
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