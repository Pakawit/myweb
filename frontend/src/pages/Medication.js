import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setMedication } from "../features/medicationSlice";

function Medication() {
  const { member } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [medicationsPerPage] = useState(10); // Number of medications per page
  const medication = useSelector((state) => state.medication);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!member._id) {
      navigate("/");
    }
    const fetchData = async () => {
      try {
        const res = await axios.post("http://localhost:5001/getmedication", {
          _id: member._id,
        });
        dispatch(setMedication(res.data));
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [dispatch, member._id, navigate]);

  // Pagination
  const indexOfLastMedication = currentPage * medicationsPerPage;
  const indexOfFirstMedication = indexOfLastMedication - medicationsPerPage;
  const currentMedications = medication && medication.slice(
    indexOfFirstMedication,
    indexOfLastMedication
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
              {medication && medication.length > 0 ? (
                currentMedications.map((medication, index) => (
                  <tr key={index}>
                    <td className="table-center" style={{ width: "33%" }}>
                      {medication.date}
                    </td>
                    <td className="table-center" style={{ width: "33%" }}>
                      {medication.time}
                    </td>
                    <td className="table-center" style={{ width: "33%" }}>
                      {medication.status === 0 ? (
                        <Button variant="danger" disabled>
                          ยังไม่ได้กินยา
                        </Button>
                      ) : medication.status === 1 ? (
                        <Button variant="warning" disabled>
                          ยังไม่ได้กินยา
                        </Button>
                      ) : (
                        <Button variant="success" disabled>
                          กินยาแล้ว
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">ไม่มีข้อมูลการกินยา</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col className="text-right">
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-end">
              {Array.from(
                { length: Math.ceil((medication && medication.length) / medicationsPerPage) },
                (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </Col>
      </Row>
    </Container>
  );
}

export default Medication;
