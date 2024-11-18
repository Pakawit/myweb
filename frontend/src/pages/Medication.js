import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
//import { AppContext } from "../context/appContext";
//import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loadMedicationsData } from "../features/medicationSlice";
import ReactPaginate from "react-paginate";

function Medication() {
  const dispatch = useDispatch();
  //const { API_BASE_URL } = useContext(AppContext);
  const medications = useSelector((state) => state.medication);
  const selectuser = useSelector((state) => state.selectuser);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {

    dispatch(loadMedicationsData());

    // const fetchDataOnLoad = async () => {
    //   try {
    //     await axios.get(`${API_BASE_URL}/getmedication`);
    //   } catch (error) {
    //     console.error("Failed to fetch medications on load:", error);
    //   }
    // };

    // const intervalId = setInterval(() => {
    //   dispatch(loadMedicationsData());
    // }, 5000);

    // window.addEventListener("beforeunload", fetchDataOnLoad);

    // return () => {
    //   clearInterval(intervalId);
    //   window.removeEventListener("beforeunload", fetchDataOnLoad);
    // };
  }, []);

  // ฟังก์ชันสำหรับแสดงปุ่มสถานะการกินยา
  const getStatusButton = (status) => {
    const statusInfo = {
      0: { variant: "danger", text: "ไม่ได้กิน" },
      1: { variant: "warning", text: "รอกิน" },
      2: { variant: "success", text: "กินแล้ว" },
    };
    return statusInfo[status] || { variant: "secondary", text: "ไม่พบข้อมูล" };  // คืนค่าปุ่มตามสถานะ
  };

  const convertDateTime = (date, time) => {
    const [day, month, year] = date.split("/"); // แยกวันที่เป็นวัน เดือน ปี
    const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`; // ฟอร์แมตวันที่เป็น YYYY-MM-DD
    const formattedTime = time.padStart(5, "0"); // ฟอร์แมตเวลาเป็น HH:MM
    return new Date(`${formattedDate}T${formattedTime}`); // สร้าง Date object ด้วยวันที่และเวลา
  };

  const formatTimeRange = (time) => {
    const [hours, minutes] = time.split(":").map(Number); // แยกชั่วโมงและนาทีจากเวลา
    const startDate = new Date(); // สร้าง Date object สำหรับเวลาเริ่มต้น
    startDate.setHours(hours, minutes);

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 6);

    const formatTime = (date) => date.toTimeString().slice(0, 5); // ดึงเวลา HH:MM จาก Date object
    return `${formatTime(startDate)}-${formatTime(endDate)}`; // คืนค่าช่วงเวลาในรูปแบบ HH:MM-HH:MM
  };

  const sortedMedications = [...medications].filter((med) => med.from === selectuser._id).sort((a, b) => convertDateTime(b.date, b.time) - convertDateTime(a.date, a.time)); // เรียงลำดับข้อมูลตามวันที่และเวลาล่าสุด

  // แบ่งการกินยาตามหน้าปัจจุบัน
  const paginatedMedications = sortedMedications.slice(
    currentPage * itemsPerPage, //0*10
    (currentPage + 1) * itemsPerPage //1*10
  );

  // ฟังก์ชันจัดการเมื่อผู้ใช้คลิกเปลี่ยนหน้า
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected); // อัปเดตหน้าปัจจุบันใน state // Output: { selected: 1 }
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
                <th className="text-center">วัน/เดือน/ปี</th>
                <th className="text-center">เวลา</th>
                <th className="text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMedications.length ? (
                paginatedMedications.map((med, index) => {
                  const { variant, text } = getStatusButton(med.status); // ดึง variant และ text
                  return (
                    <tr key={index}>
                      <td className="text-center">{med.date}</td>
                      <td className="text-center">{formatTimeRange(med.time)}</td>
                      <td className="text-center">
                        <Button variant={variant} disabled>{text}</Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="text-center">
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