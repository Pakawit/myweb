import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Pagination } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchMedicationsThunk } from "../features/medicationSlice";

function Medication() {
  const { API_BASE_URL } = useContext(AppContext);
  const medication = useSelector((state) => state.medication);
  const selectuser = useSelector((state) => state.selectuser);
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1); // สร้าง state สำหรับหน้าปัจจุบัน
  const itemsPerPage = 10; // จำนวนรายการที่จะแสดงต่อหน้า

  useEffect(() => {
    const fetchData = () => {
      axios.post(`${API_BASE_URL}/getmedication`);
    };
    dispatch(fetchMedicationsThunk());

    const intervalId = setInterval(() => {
      dispatch(fetchMedicationsThunk());
    }, 5000); 
    window.addEventListener('beforeunload', fetchData);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', fetchData);
    }
  }, [dispatch, API_BASE_URL]);

  const renderStatusButton = (status) => {
    switch (status) {
      case 0:
        return (
          <Button variant="danger" disabled>
            ไม่ได้กิน
          </Button>
        );
      case 1:
        return (
          <Button variant="warning" disabled>
            ล่าช้า
          </Button>
        );
      case 2:
        return (
          <Button variant="success" disabled>
            กินแล้ว
          </Button>
        );
      default:
        return null;
    }
  };

  // คำนวณจำนวนหน้าทั้งหมด
  const filteredMedications = medication.filter((med) => med.from === selectuser._id);
  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage);

  // ตัดข้อมูลการกินยาตามหน้าที่เลือก
  const paginatedMedications = filteredMedications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Container>
      <Navigation />
      <Row>
        <h1>รายละเอียดการกินยา</h1>
      </Row>
      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th className="table-center" style={{ width: "33%" }}>
                  วัน/เดือน/ปี
                </th>
                <th className="table-center" style={{ width: "33%" }}>
                  เวลา
                </th>
                <th className="table-center" style={{ width: "33%" }}>
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedMedications.length > 0 ? (
                paginatedMedications.map((med, index) => (
                  <tr key={index}>
                    <td className="table-center" style={{ width: "33%" }}>
                      {med.date}
                    </td>
                    <td className="table-center" style={{ width: "33%" }}>
                      {med.time}
                    </td>
                    <td className="table-center" style={{ width: "33%" }}>
                      {renderStatusButton(med.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="table-center" style={{ width: "100%" }}>
                    ไม่มีข้อมูลการกินยา
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <Pagination className="justify-content-end">
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {[...Array(totalPages).keys()].map((pageNumber) => (
              <Pagination.Item key={pageNumber + 1} active={pageNumber + 1 === currentPage} onClick={() => handlePageChange(pageNumber + 1)}>
                {pageNumber + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
}

export default Medication;
