// src/pages/Home.jsx
import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Form, InputGroup } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { loadUsersData } from "../features/usersSlice";
import { setselectuser, deleteselectuser } from "../features/selectuserSlice";
import { loadMedicationsData } from "../features/medicationSlice";
import { loadHFSNotifications } from "../features/hfsnotificationSlice";
import { deleteMessage } from "../features/messageSlice";
import axios from "axios";
import { AppContext } from "../context/appContext";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { API_BASE_URL } = useContext(AppContext);

  const users = useSelector((state) => state.users);
  const medication = useSelector((state) => state.medication);
  const hfsUserMap = useSelector((state) => state.hfsnotification.userHasAlerts || {});

  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          dispatch(loadUsersData()),
          dispatch(loadMedicationsData()),
          dispatch(loadHFSNotifications()), // ✅ ตัวใหม่
          dispatch(deleteselectuser()),
          dispatch(deleteMessage()),
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    fetchInitialData();
    const intervalId = setInterval(fetchInitialData, 5000);

    const fetchDataOnPageLoad = async () => {
      try {
        await axios.all([
          axios.get(`${API_BASE_URL}/getusers`),
          axios.get(`${API_BASE_URL}/getmedication`),
        ]);
      } catch (error) {
        console.error("Failed to fetch data on page load:", error);
      }
    };

    window.addEventListener("beforeunload", fetchDataOnPageLoad);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", fetchDataOnPageLoad);
    };
  }, [dispatch, API_BASE_URL]);

  const handleNavigation = (userData, path) => {
    dispatch(setselectuser(userData));
    navigate(path);
  };

  const getStatusButton = (status) => {
    const statusInfo = {
      0: { variant: "danger", text: "ไม่ได้กิน" },
      1: { variant: "warning", text: "รอกิน" },
      2: { variant: "success", text: "กินแล้ว" },
    };
    return statusInfo[status] || { variant: "secondary", text: "ไม่พบข้อมูล" };
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const paginatedUsers = sortedUsers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  return (
    <Container fluid>
      <Navigation />

      <Row className="mb-3 g-2">
        <Col xs={12} md={{ span: 4, offset: 8 }}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="ค้นหาชื่อผู้ป่วย..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <InputGroup.Text>
              <i className="bi bi-search" />
            </InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table responsive="md" striped bordered hover className="align-middle">
            <thead>
              <tr>
                <th className="text-center">ชื่อ-สกุล</th>
                <th className="text-center">เบอร์โทรศัพท์</th>
                <th className="text-center d-none d-sm-table-cell">อายุ</th>
                <th className="text-center d-none d-sm-table-cell">ขาดยา</th>
                <th className="text-center">สถานะการกินยา</th>
                <th className="text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => {
                const lastStatus = medication
                  .filter((med) => med.from === user._id)
                  .at(-1)?.status;

                const missedCount = medication.filter(
                  (med) => med.from === user._id && med.status === 0
                ).length;

                // ✅ ถ้ามี HFS notification ของ user นี้ → ปุ่มเป็นเหลือง
                const hfsVariant = hfsUserMap[user._id]
                  ? "outline-warning"
                  : "outline-success";

                const { variant, text } = getStatusButton(lastStatus);

                return (
                  <tr key={user._id}>
                    <td className="text-center text-truncate">{user.name}</td>
                    <td className="text-center text-truncate">{user.phone}</td>
                    <td className="text-center d-none d-sm-table-cell">
                      {user.age}
                    </td>
                    <td className="text-center d-none d-sm-table-cell">
                      {missedCount}
                    </td>
                    <td className="text-center">
                      <Button variant={variant} disabled size="sm">
                        {text}
                      </Button>
                    </td>
                    <td className="text-center">
                      <div className="d-flex flex-wrap gap-2 justify-content-center">
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleNavigation(user, "/personal")}
                        >
                          ข้อมูลส่วนบุคคล
                        </Button>
                        <Button
                          size="sm"
                          variant={`outline-${variant}`}
                          onClick={() => handleNavigation(user, "/medication")}
                        >
                          รายละเอียดการกินยา
                        </Button>
                        <Button
                          size="sm"
                          variant={hfsVariant}
                          onClick={() => handleNavigation(user, "/estimation")}
                        >
                          การประเมินอาการ HFS
                        </Button>
                        <Button
                          size="sm"
                          variant={`outline-${variant}`}
                          onClick={() => handleNavigation(user, "/chat")}
                        >
                          แชท
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {filteredUsers.length > itemsPerPage && (
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              pageCount={Math.ceil(filteredUsers.length / itemsPerPage)}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageChange}
              containerClassName={"pagination justify-content-end flex-wrap"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousClassName={"page-item"}
              previousLinkClassName={"page-link"}
              nextClassName={"page-item"}
              nextLinkClassName={"page-link"}
              breakClassName={"page-item"}
              breakLinkClassName={"page-link"}
              activeClassName={"active"}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Home;