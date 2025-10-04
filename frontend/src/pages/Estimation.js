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
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";

// 🔁 ใช้ตัวรวมแจ้งเตือน HFS
import { loadHFSNotifications } from "../features/hfsnotificationSlice";

function Estimation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector((state) => state.admin);
  const selectuser = useSelector((state) => state.selectuser);
  const { API_BASE_URL } = useContext(AppContext);

  const [estimations, setEstimations] = useState([]);
  const [totalEstimations, setTotalEstimations] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [hfsLevels, setHfsLevels] = useState({}); // { [estimationId]: level }
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 1;

  // ถ้าไม่มี selectuser (เช่นรีเฟรชหน้า) -> กลับหน้าแรก
  useEffect(() => {
    if (!selectuser?._id) navigate("/");
  }, [selectuser, navigate]);

  const fetchEstimations = async (page = 0) => {
    if (!selectuser?._id) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/getestimation`, {
        from: selectuser._id,
        page,
        limit: itemsPerPage,
      });
      setEstimations(res.data?.data || []);
      setTotalEstimations(res.data?.total || 0);
    } catch (err) {
      console.error("Error fetching estimations:", err);
    }
  };

  // โหลดรายการ (เปลี่ยนหน้า/เปลี่ยนคน)
  useEffect(() => {
    if (!selectuser?._id) return;
    fetchEstimations(currentPage);
    const t = setInterval(() => fetchEstimations(currentPage), 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectuser?._id]);

  // โหลด notification map เพื่ออัปเดต badge ที่ navbar หลังมีการยืนยัน
  useEffect(() => {
    dispatch(loadHFSNotifications());
  }, [dispatch]);

  const handleHfsLevelChange = (estimationId, level) => {
    setHfsLevels((prev) => ({ ...prev, [estimationId]: level }));
  };

  const handleSubmit = async (estimationId) => {
    const chosen = hfsLevels[estimationId];
    if (chosen === undefined || chosen === 0) return;

    try {
      const payload = {
        estimationId,
        userId: selectuser._id,
        userName: selectuser.name,
        adminName: admin.name,
        hfsLevel: chosen === "ไม่พบอาการ" ? 5 : chosen,
      };

      const res = await axios.put(`${API_BASE_URL}/evaluateHFS`, payload);

      setNotification({ show: true, message: res.data?.message || "ดำเนินการสำเร็จ" });

      // ดึงรายการล่าสุดเพื่อให้เห็นผล evaluations/hfsLevel ที่อัปเดตจริง
      await fetchEstimations(currentPage);

      // อัปเดตแจ้งเตือน (ใช้ทั้งแบดจ์ขวาบน + ปุ่มเหลืองหน้า Home)
      dispatch(loadHFSNotifications());
    } catch (err) {
      console.error("Error submitting evaluation:", err);
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
  const handleCloseNotificationModal = () =>
    setNotification({ show: false, message: "" });

  // ✅ เช็คสถานะจากข้อมูลจริงในเอกสาร Estimation (est.evaluations/hfsLevel)
  const checkEstimationStatus = (est, adminName) => {
    const evaluations = est.evaluations || {};
    const A = evaluations?.Apatnipa?.hfsLevel;
    const C = evaluations?.Chureeporn?.hfsLevel;

    // ยังไม่มีใครประเมิน และยังไม่สรุป
    if (est.hfsLevel === 0 && Object.keys(evaluations).length === 0) {
      return { disabled: false, message: "ยืนยัน" };
    }

    // มีใครสักคนประเมินแล้ว แต่ยังไม่สรุป
    if (Object.keys(evaluations).length > 0 && est.hfsLevel === 0) {
      // ถ้าคนล็อกอินคือคนที่ "ยังไม่" ประเมิน -> ให้ยืนยันได้
      if (adminName === "Apatnipa" && A === undefined) {
        return { disabled: false, message: "ยืนยัน" };
      }
      if (adminName === "Chureeporn" && C === undefined) {
        return { disabled: false, message: "ยืนยัน" };
      }
      // คนนี้ประเมินไปแล้ว → รออีกคน
      if (adminName === "Apatnipa" && A !== undefined) {
        return { disabled: true, message: "รอการประเมินจาก Chureeporn" };
      }
      if (adminName === "Chureeporn" && C !== undefined) {
        return { disabled: true, message: "รอการประเมินจาก Apatnipa" };
      }
    }

    // สรุปแล้ว (hfsLevel !== 0)
    if (est.hfsLevel !== 0) {
      return { disabled: true, message: "ประเมินแล้ว" };
    }

    return { disabled: false, message: "ยืนยัน" };
  };

  const handlePageChange = (selected) => setCurrentPage(selected.selected);

  return (
    <Container fluid className="px-2 px-sm-3 px-md-4">
      <Navigation />

      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 my-3">
        <h1 className="h3 h2-md m-0">การประเมินอาการ HFS</h1>
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/create-estimation")}
          className="mt-2 mt-md-0"
        >
          สร้างข้อมูลการประเมิน
        </Button>
      </div>

      <Row>
        <Col>
          <Table responsive="md" striped bordered hover className="align-middle">
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
                  const { disabled, message } = checkEstimationStatus(est, admin.name);
                  const myEval = est.evaluations?.[admin.name]?.hfsLevel;

                  return (
                    <tr
                      key={est._id}
                      className={est.hfsLevel !== 0 ? "bg-secondary text-white" : ""}
                    >
                      <td className="text-center">{est.date}</td>
                      <td className="text-center">{est.time}</td>

                      <td className="text-center">
                        <Row className="gx-2 gy-2">
                          <Col xs={12} md={6}>
                            <h6 className="fw-bold text-center mb-2">รูปฝั่งซ้าย</h6>
                            <Row className="row-cols-2 g-2 justify-content-center">
                              {[est.photos[0], est.photos[1], est.photos[4], est.photos[5]].map(
                                (photo, i) => (
                                  <Col key={i} className="d-flex justify-content-center">
                                    <img
                                      src={`data:image/jpeg;base64,${photo}`}
                                      alt={`ซ้าย ${i}`}
                                      className="img-fluid rounded border"
                                      style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => handleShowModal(photo)}
                                    />
                                  </Col>
                                )
                              )}
                            </Row>
                          </Col>

                          <Col xs={12} md={6} className="mt-3 mt-md-0">
                            <h6 className="fw-bold text-center mb-2">รูปฝั่งขวา</h6>
                            <Row className="row-cols-2 g-2 justify-content-center">
                              {[est.photos[2], est.photos[3], est.photos[6], est.photos[7]].map(
                                (photo, i) => (
                                  <Col key={i} className="d-flex justify-content-center">
                                    <img
                                      src={`data:image/jpeg;base64,${photo}`}
                                      alt={`ขวา ${i}`}
                                      className="img-fluid rounded border"
                                      style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => handleShowModal(photo)}
                                    />
                                  </Col>
                                )
                              )}
                            </Row>
                          </Col>
                        </Row>
                      </td>

                      <td className="text-center">{est.painLevel}</td>

                      <td className="text-center">
                        {myEval !== undefined ? (
                          <span>
                            คุณประเมินว่า: {myEval === 5 ? "ไม่พบอาการ" : `ระดับที่ ${myEval}`}
                          </span>
                        ) : est.hfsLevel !== 0 ? (
                          <span>{est.hfsLevel === 5 ? "ไม่พบอาการ" : `ระดับที่ ${est.hfsLevel}`}</span>
                        ) : (
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="outline-success"
                              id={`level-${est._id}`}
                              size="sm"
                            >
                              {`เลือกระดับ${hfsLevels[est._id] ? `: ${hfsLevels[est._id]}` : ""}`}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              {["ไม่พบอาการ", 1, 2, 3].map((level) => (
                                <Dropdown.Item
                                  key={String(level)}
                                  onClick={() => handleHfsLevelChange(est._id, level)}
                                >
                                  {level}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </td>

                      <td className="text-center">
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                          <Button
                            variant={est.hfsLevel !== 0 ? "outline-secondary" : "outline-success"}
                            onClick={() => handleSubmit(est._id)}
                            disabled={disabled}
                            size="sm"
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
              containerClassName={"pagination justify-content-end flex-wrap"}
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
              className="img-fluid d-block mx-auto"
              style={{ maxHeight: "80vh", objectFit: "contain" }}
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