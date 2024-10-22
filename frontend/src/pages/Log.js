import React, { useContext, useState, useEffect } from "react";
import { Table, Container, Row, Col } from "react-bootstrap";
import Navigation from "../components/Navigation";
import axios from "axios";
import { AppContext } from "../context/appContext";
import ReactPaginate from "react-paginate";
import "./style.css"; 

const Log = () => {
  const [logs, setLogs] = useState([]);
  const { API_BASE_URL } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/logs`);
        setLogs(response.data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };
    fetchLogs();
  }, [API_BASE_URL]);

  const handlePageChange = ({ selected }) => setCurrentPage(selected);

  const paginatedLogs = logs.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <Container fluid>
      <Navigation />
      <Row className="mt-5">
        <Col>
          <h1 className="text-center mb-4">รายละเอียดการทำงาน</h1>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>การทำงาน</th>
                <th>ผู้ทำงาน</th>
                <th>รายละเอียด</th>
                <th>เวลา</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log, index) => (
                  <tr key={log._id}>
                    <td>{currentPage * itemsPerPage + index + 1}</td>
                    <td>{log.action}</td>
                    <td>{log.user}</td>
                    <td>{log.details || "N/A"}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {logs.length > itemsPerPage && (
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              pageCount={Math.ceil(logs.length / itemsPerPage)}
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
    </Container>
  );
};

export default Log;