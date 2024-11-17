import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { loadUsersData } from "../features/usersSlice";
import { setselectuser, deleteselectuser } from "../features/selectuserSlice";
import { loadMedicationsData } from "../features/medicationSlice";
import { loadHFSNotifications } from "../features/hfsnotificationSlice";
import { deleteMessage } from "../features/messageSlice";
//import axios from "axios";
//import { AppContext } from "../context/appContext";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  //const { API_BASE_URL } = useContext(AppContext);
  const users = useSelector((state) => state.users);
  const medication = useSelector((state) => state.medication);
  const hfsNotifications = useSelector((state) => state.hfsnotification);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          dispatch(loadUsersData()),
          dispatch(loadMedicationsData()),
          dispatch(loadHFSNotifications()),
          dispatch(deleteselectuser()),
          dispatch(deleteMessage())
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    fetchInitialData();

    // const intervalId = setInterval(() => {
    //   fetchInitialData();
    // }, 5000); // ตั้ง interval เพื่ออัปเดตข้อมูลทุก 5 วินาที

    // const fetchDataOnPageLoad = async () => {
    //   try {
    //     await axios.all([
    //       axios.get(`${API_BASE_URL}/getusers`),
    //       axios.get(`${API_BASE_URL}/getmedication`),
    //     ]);
    //   } catch (error) {
    //     console.error("Failed to fetch data on page load:", error);
    //   }
    // };

    // window.addEventListener("beforeunload", fetchDataOnPageLoad);  // ดึงข้อมูลอีกครั้งเมื่อผู้ใช้ปิดหน้า

    // return () => {
    //   clearInterval(intervalId); // Cleanup เมื่อคอมโพเนนต์ถูกทำลาย
    //   window.removeEventListener("beforeunload", fetchDataOnPageLoad); // ลบ event listener
    // };
  }, []);

  // ฟังก์ชันนำทางไปยังหน้าอื่น
  const handleNavigation = (userData, path) => {
    dispatch(setselectuser(userData));
    navigate(path);
  };

  // ฟังก์ชันสำหรับแสดงปุ่มสถานะการกินยา
  const getStatusButton = (status) => {
    const statusInfo = {
      0: { variant: "danger", text: "ไม่ได้กิน" },
      1: { variant: "warning", text: "รอกิน" },
      2: { variant: "success", text: "กินแล้ว" },
    };
    return statusInfo[status] || { variant: "secondary", text: "ไม่พบข้อมูล" };  // คืนค่าปุ่มตามสถานะ
  };

  // ฟังก์ชันสร้างแถวของข้อมูลผู้ใช้
  const renderUserRow = (user) => {

    const lastStatus = medication.filter((med) => med.from === user._id).at(-1)?.status; // หาสถานะสุดท้ายของการกินยา
    const missedCount = medication.filter((med) => med.from === user._id && med.status === 0).length; // นับจำนวนครั้งที่ขาดยา
    const hfsVariant = hfsNotifications.some((notif) => notif.userId === user._id) ? "outline-warning" : "outline-success"; //กำหนดสถานะการแจ้งเตือน HFS
    const { variant, text } = getStatusButton(lastStatus);

    return (
      <tr key={user._id}>
        <td className="text-center">{user.name}</td>
        <td className="text-center">{user.phone}</td>
        <td className="text-center">{user.age}</td>
        <td className="text-center">{missedCount}</td>
        <td className="text-center">
          <Button variant={variant} disabled>{text}</Button>
        </td>
        <td className="text-center">
          <Button variant="outline-success" onClick={() => handleNavigation(user, "/personal")}>ข้อมูลส่วนบุคคล</Button>
          <Button variant={`outline-${variant}`} onClick={() => handleNavigation(user, "/medication")}>รายละเอียดการกินยา</Button>
          <Button variant={hfsVariant} onClick={() => handleNavigation(user, "/estimation")}>การประเมินอาการ HFS</Button>
          <Button variant={`outline-${variant}`} onClick={() => handleNavigation(user, "/chat")}>แชท</Button>
        </td>
      </tr>
    );
  };

  const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // เรียงผู้ป่วยตามวันที่สร้าง (ใหม่ไปเก่า)ใหม่กว่าค่าบวก

  // แบ่งผู้ป่วยตามหน้าปัจจุบัน
  const paginatedUsers = sortedUsers.slice(
    currentPage * itemsPerPage, //0*10
    (currentPage + 1) * itemsPerPage //1*10
  );

  // ฟังก์ชันจัดการเมื่อผู้ใช้คลิกเปลี่ยนหน้า
  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected); // อัปเดตหน้าปัจจุบันใน state
  };

  return (
    <Container fluid>
      <Navigation />
      <Row>
        <Col>
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th className="text-center">ชื่อ-สกุล</th>
                <th className="text-center">เบอร์โทรศัพท์</th>
                <th className="text-center">อายุ</th>
                <th className="text-center">ขาดยา</th>
                <th className="text-center">สถานะการกินยา</th>
                <th />
              </tr>
            </thead>
            <tbody>{paginatedUsers.map(renderUserRow)}</tbody>
          </Table>
          {/* แสดงการแบ่งหน้าเฉพาะเมื่อผู้ใช้มีมากกว่า 10 คน*/}
          {users.length > itemsPerPage && (
            <ReactPaginate
              previousLabel={"<"} // ปุ่มสำหรับย้อนกลับ
              nextLabel={">"} // ปุ่มสำหรับถัดไป
              breakLabel={"..."} // จุดไข่ปลาแสดงหน้าห่าง
              pageCount={Math.ceil(users.length / itemsPerPage)} // จำนวนหน้าทั้งหมด
              marginPagesDisplayed={2} // แสดงหน้าที่อยู่ใกล้จุดเริ่ม/จุดสิ้นสุด
              pageRangeDisplayed={5} // แสดงหน้าที่อยู่ใกล้กับหน้าปัจจุบัน
              onPageChange={handlePageChange} // เรียกฟังก์ชันเมื่อเปลี่ยนหน้า
              containerClassName={"pagination justify-content-end"} // ตั้งค่า class ของ pagination
              pageClassName={"page-item"} // ตั้งค่า class สำหรับหน้าปกติ
              pageLinkClassName={"page-link"} // ตั้งค่า class สำหรับลิงก์ในหน้า
              previousClassName={"page-item"} // ตั้งค่า class สำหรับปุ่มย้อนกลับ
              previousLinkClassName={"page-link"} // ตั้งค่า class สำหรับลิงก์ย้อนกลับ
              nextClassName={"page-item"} // ตั้งค่า class สำหรับปุ่มถัดไป
              nextLinkClassName={"page-link"} // ตั้งค่า class สำหรับลิงก์ถัดไป
              breakClassName={"page-item"} // ตั้งค่า class สำหรับจุดไข่ปลา
              breakLinkClassName={"page-link"} // ตั้งค่า class สำหรับลิงก์จุดไข่ปลา
              activeClassName={"active"} // ตั้งค่า class สำหรับหน้าปัจจุบัน
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Home;