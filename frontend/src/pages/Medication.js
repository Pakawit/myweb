import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchMedicationsThunk } from "../features/medicationSlice";
import ReactPaginate from "react-paginate";

function Medication() {
  const { API_BASE_URL } = useContext(AppContext);
  const medications = useSelector((state) => state.medication) || [];
  const selectuser = useSelector((state) => state.selectuser) || {};
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDataOnLoad = async () => {
      try {
        await axios.post(`${API_BASE_URL}/getmedication`);
        dispatch(fetchMedicationsThunk());
      } catch (error) {
        console.error("Failed to fetch medications on load:", error);
      }
    };

    fetchDataOnLoad();

    const intervalId = setInterval(() => {
      dispatch(fetchMedicationsThunk());
    }, 5000);

    const handleBeforeUnload = () => {
      fetchDataOnLoad();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch, API_BASE_URL]);

  const getStatusButton = (status) => {
    const statusInfo = {
      0: { variant: "danger", text: "ไม่ได้กิน" },
      1: { variant: "warning", text: "รอกิน" },
      2: { variant: "success", text: "กินแล้ว" },
    };
    const { variant, text } = statusInfo[status] || {};
    return (
      variant && (
        <Button variant={variant} disabled>
          {text}
        </Button>
      )
    );
  };

  const convertDateTime = (date, time) => {
    const [day, month, year] = date.split("/");
    const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}`;
    const formattedTime = time.padStart(5, "0");
    return new Date(`${formattedDate}T${formattedTime}`);
  };

  const sortedMedications = medications
    .filter((med) => med.from === selectuser._id)
    .sort(
      (a, b) =>
        convertDateTime(b.date, b.time) - convertDateTime(a.date, a.time)
    );

  const totalPages = Math.ceil(sortedMedications.length / itemsPerPage);
  const paginatedMedications = sortedMedications.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  return (
    <Container fluid>
      <Navigation />
      <Row>
        <h1>รายละเอียดการกินยา</h1>
      </Row>
      <Row>
        <Col>
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th className="table-center">วัน/เดือน/ปี</th>
                <th className="table-center">เวลา</th>
                <th className="table-center">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMedications.length ? (
                paginatedMedications.map((med, index) => (
                  <tr key={index}>
                    <td className="table-center">{med.date}</td>
                    <td className="table-center">{med.time}</td>
                    <td className="table-center">
                      {getStatusButton(med.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="table-center">
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
              pageCount={totalPages}
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
    </Container>
  );
}

export default Medication;