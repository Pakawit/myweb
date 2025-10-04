import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Alert, Modal, Form } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loadMedicationsData } from "../features/medicationSlice";
import ReactPaginate from "react-paginate";

function Medication() {
  const dispatch = useDispatch();
  const { API_BASE_URL } = useContext(AppContext);
  const medications = useSelector((state) => state.medication);
  const selectuser = useSelector((state) => state.selectuser);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editMedication, setEditMedication] = useState({
    id: "",
    date: "",
    time: "",
    status: 0,
  });

  const fetchDataOnLoad = async () => {
    try {
      await axios.get(`${API_BASE_URL}/getmedication`);
      dispatch(loadMedicationsData());
    } catch (error) {
      console.error("Failed to fetch medications on load:", error);
    }
  };

  useEffect(() => {
    fetchDataOnLoad();
    const intervalId = setInterval(() => {
      dispatch(loadMedicationsData());
    }, 5000);
    window.addEventListener("beforeunload", fetchDataOnLoad);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", fetchDataOnLoad);
    };
  }, []);

  const getStatusButton = (status) => {
    const statusInfo = {
      0: { variant: "danger", text: "ไม่ได้กิน" },
      1: { variant: "warning", text: "รอกิน" },
      2: { variant: "success", text: "กินแล้ว" },
    };
    return statusInfo[status] || { variant: "secondary", text: "ไม่พบข้อมูล" };
  };

  const convertDateTime = (date, time) => {
    const [day, month, year] = date.split("/");
    const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const formattedTime = time.padStart(5, "0");
    return new Date(`${formattedDate}T${formattedTime}`);
  };

  const formatTimeRange = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 6);
    const fmt = (d) => d.toTimeString().slice(0, 5);
    return `${fmt(startDate)}-${fmt(endDate)}`;
  };

  const sortedMedications = [...medications]
    .filter((med) => med.from === selectuser._id)
    .sort((a, b) => convertDateTime(b.date, b.time) - convertDateTime(a.date, a.time));

  const paginatedMedications = sortedMedications.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleDeleteMedication = async (medicationId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      try {
        await axios.delete(`${API_BASE_URL}/deletemedication/${medicationId}`);
        await fetchDataOnLoad();
        setSuccessMessage("ลบข้อมูลการกินยาสำเร็จ!");
        setErrorMessage(null);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error);
        setErrorMessage("ลบข้อมูลการกินยาล้มเหลว!");
        setSuccessMessage(null);
      }
    }
  };

  const handleOpenEditModal = (med) => {
    setEditMedication({
      id: med._id,
      date: med.date,
      time: med.time.padStart(5, "0"),
      status: med.status,
    });
    setShowEditModal(true);
  };

  const handleEditMedicationChange = (e) => {
    const { name, value } = e.target;

    if (name === "time") {
      let [h = "", m = ""] = value.split(":");
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      setEditMedication((prev) => ({ ...prev, time: `${hh}:${mm}` }));
      return;
    }

    if (name === "date") {
      const parts = value.split("/");
      if (parts.length === 3) {
        const [d, mo, y] = parts;
        const dd = String(d).padStart(2, "0");
        const mm = String(mo).padStart(2, "0");
        setEditMedication((prev) => ({ ...prev, date: `${dd}/${mm}/${y}` }));
      } else {
        setEditMedication((prev) => ({ ...prev, date: value }));
      }
      return;
    }

    setEditMedication((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${API_BASE_URL}/editmedication/${editMedication.id}`, {
        date: editMedication.date,
        time: editMedication.time,
        status: Number(editMedication.status),
      });
      await fetchDataOnLoad();
      setShowEditModal(false);
      setSuccessMessage("แก้ไขข้อมูลสำเร็จ!");
      setErrorMessage(null);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล:", error);
      setErrorMessage("แก้ไขข้อมูลล้มเหลว!");
      setSuccessMessage(null);
    }
  };

  return (
    <Container fluid className="px-2 px-sm-3 px-md-4">
      <Navigation />


      <h1 className="h3 h2-md text-center text-md-start my-3">รายละเอียดการกินยา</h1>

      <Row>
        <Col>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {successMessage && (
            <Alert variant={successMessage.includes("แก้ไขข้อมูล") ? "warning" : "success"}>
              {successMessage}
            </Alert>
          )}

          <Table responsive="md" striped bordered hover className="align-middle">
            <thead>
              <tr>
                <th className="text-center">วัน/เดือน/ปี</th>
                <th className="text-center">เวลา</th>
                <th className="text-center">สถานะ</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMedications.length ? (
                paginatedMedications.map((med) => {
                  const { variant, text } = getStatusButton(med.status);
                  return (
                    <tr key={med._id}>
                      <td className="text-center text-truncate">{med.date}</td>
                      <td className="text-center">{formatTimeRange(med.time)}</td>
                      <td className="text-center">
                        <Button variant={variant} size="sm" disabled>
                          {text}
                        </Button>
                      </td>
                      <td className="text-center">
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleOpenEditModal(med)}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteMedication(med._id)}
                          >
                            ลบ
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center">
                    ไม่มีข้อมูลการกินยา
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {sortedMedications.length > itemsPerPage && (
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              pageCount={Math.ceil(sortedMedications.length / itemsPerPage)}
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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>แก้ไขข้อมูลการกินยา</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>วันที่ (วัน/เดือน/ปี)</Form.Label>
              <Form.Control
                type="text"
                name="date"
                value={editMedication.date}
                onChange={handleEditMedicationChange}
                placeholder="เช่น 26/04/2025"
                inputMode="numeric"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>เวลา (hh:mm)</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={editMedication.time}
                onChange={handleEditMedicationChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>สถานะ</Form.Label>
              <Form.Select
                name="status"
                value={editMedication.status}
                onChange={handleEditMedicationChange}
              >
                <option value={0}>ไม่ได้กิน</option>
                <option value={1}>รอกิน</option>
                <option value={2}>กินแล้ว</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            ยกเลิก
          </Button>
          <Button variant="warning" onClick={handleSaveEdit}>
            บันทึกการแก้ไข
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Medication;