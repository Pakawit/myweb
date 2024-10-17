import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { fetchUsersThunk } from "../features/usersSlice";
import { setselectuser, deleteselectuser } from "../features/selectuserSlice";
import { fetchMedicationsThunk } from "../features/medicationSlice";
import { fetchHFSNotificationsThunk } from "../features/hfsnotificationSlice";
import axios from "axios";
import { AppContext } from "../context/appContext";
import "./style.css";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { API_BASE_URL } = useContext(AppContext);
  const admin = useSelector((state) => state.admin);
  const users = useSelector((state) => state.users) || [];
  const medication = useSelector((state) => state.medication) || [];
  const hfsNotifications = useSelector((state) => state.hfsnotification) || [];
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 10;
  const pageCount = Math.ceil(users.length / itemsPerPage);

  const fetchData = async () => {
    try {
      await axios.all([
        axios.get(`${API_BASE_URL}/getusers`),
        axios.post(`${API_BASE_URL}/getmedication`),
      ]);
      dispatch(fetchUsersThunk());
      dispatch(fetchMedicationsThunk());
      dispatch(fetchHFSNotificationsThunk());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    dispatch(deleteselectuser());
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
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

  const renderUserRow = (user) => {
    if (user._id === admin._id) return null;

    const lastStatus = medication
      .filter((med) => med.from === user._id)
      .at(-1)?.status;
    const missedCount = medication.filter(
      (med) => med.from === user._id && med.status === 0
    ).length;
    const hfsVariant = hfsNotifications.some(
      (notif) => notif.userId === user._id
    )
      ? "outline-warning"
      : "outline-success";

    const { variant, text } = getStatusButton(lastStatus);

    return (
      <tr key={user._id} className={`row-${variant}`}>
        <td className="table-center">{user.name}</td>
        <td className="table-center">{user.phone}</td>
        <td className="table-center">{user.age}</td>
        <td className="table-center">{missedCount}</td>
        <td className="table-center">
          <Button variant={variant} disabled>
            {text}
          </Button>
        </td>
        <td className="table-center">
          <Button
            variant="outline-success"
            onClick={() => handleNavigation(user, "/personal")}
          >
            ข้อมูลส่วนบุคคล
          </Button>
          <Button
            variant={`outline-${variant}`}
            onClick={() => handleNavigation(user, "/medication")}
          >
            รายละเอียดการกินยา
          </Button>
          <Button
            variant={hfsVariant}
            onClick={() => handleNavigation(user, "/estimation")}
          >
            การประเมินอาการ HFS
          </Button>
          <Button
            variant={`outline-${variant}`}
            onClick={() => handleNavigation(user, "/chat")}
          >
            แชท
          </Button>
        </td>
      </tr>
    );
  };

  const handlePageClick = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  const paginatedUsers = users.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <Container fluid>
      <Navigation />
      <Row>
        <Col>
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th className="table-center">ชื่อ-สกุล</th>
                <th className="table-center">เบอร์โทรศัพท์</th>
                <th className="table-center">อายุ</th>
                <th className="table-center">ขาดยา</th>
                <th className="table-center">สถานะการกินยา</th>
                <th />
              </tr>
            </thead>
            <tbody>{paginatedUsers.map(renderUserRow)}</tbody>
          </Table>

          {users.length > itemsPerPage && (
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={"pagination justify-content-end"}
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