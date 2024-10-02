import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Pagination } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { fetchUsersThunk } from "../features/usersSlice";
import { setselectuser, deleteselectuser } from "../features/selectuserSlice";
import { fetchMedicationsThunk } from "../features/medicationSlice";
import { fetchEstimationsThunk } from "../features/estimationSlice";
import { fetchPersonalDataThunk } from "../features/personalSlice"; 
import { fetchEstimationHFSThunk } from "../features/estimationHFSSlice"; 
import { addNotification } from "../features/notificationsSlice";
import axios from "axios";
import { AppContext } from "../context/appContext";

function Home() {
  const admin = useSelector((state) => state.admin);
  const users = useSelector((state) => state.users) || [];
  const medication = useSelector((state) => state.medication) || [];
  const estimation = useSelector((state) => state.estimation) || [];
  const estimationHFS = useSelector((state) => state.estimationHFS) || {}; // New estimation HFS state
  const personal = useSelector((state) => state.personal) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { API_BASE_URL } = useContext(AppContext);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.all([
          axios.get(`${API_BASE_URL}/getusers`),
          axios.post(`${API_BASE_URL}/getmedication`),
          axios.post(`${API_BASE_URL}/getestimation`),
        ]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    dispatch(deleteselectuser());
    dispatch(addNotification());
    dispatch(fetchUsersThunk());
    dispatch(fetchMedicationsThunk());
    dispatch(fetchEstimationsThunk());
    dispatch(fetchPersonalDataThunk());
    dispatch(fetchEstimationHFSThunk()); // Fetch estimation HFS data

    const intervalId = setInterval(() => {
      dispatch(fetchUsersThunk());
      dispatch(fetchMedicationsThunk());
      dispatch(fetchEstimationsThunk());
      dispatch(fetchPersonalDataThunk());
      dispatch(fetchEstimationHFSThunk()); // Fetch estimation HFS data every 5 seconds
    }, 5000);

    window.addEventListener('beforeunload', fetchData);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', fetchData);
    };
  }, [dispatch, API_BASE_URL]);

  const getLastMedicationStatus = (userId) => {
    const userMedications = medication.filter((med) => med.from === userId);
    return userMedications.length > 0 ? userMedications[userMedications.length - 1].status : null;
  };

  const getMsMedicineCount = (userId) => {
    return medication.filter((med) => med.from === userId && med.status === 0).length;
  };

  const hasEstimation = (userId) => {
    // Check if there's an estimation for the user with hfsLevel === 0
    return Array.isArray(estimation) && estimation.some((est) => est.from === userId && est.hfsLevel === 0);
  };

  // New function to check if there is an HFS evaluation from either admin1 or admin2
  const hasEstimationHFS = (userId) => {
    // Check if the userId exists in the estimationHFS object
    const evaluations = estimationHFS[userId]?.evaluations;
    if (!evaluations) return false;

    // Check for hfsLevel in evaluations from both admin1 and admin2
    const admin1Evaluated = evaluations.admin1 && evaluations.admin1.hfsLevel !== undefined;
    const admin2Evaluated = evaluations.admin2 && evaluations.admin2.hfsLevel !== undefined;

    return admin1Evaluated || admin2Evaluated;
  };

  const hasPersonalData = (userId) => {
    return personal.hasOwnProperty(userId); // Check if the userId exists as a key in the personal object
  };

  const sortedUsers = users.slice().sort((a, b) => {
    const statusA = getLastMedicationStatus(a._id);
    const statusB = getLastMedicationStatus(b._id);
    if (statusA === null) return 1; // นำผู้ใช้ที่ไม่มีข้อมูลไปไว้ท้าย
    if (statusB === null) return -1;
    return statusA - statusB;
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNavigation = (userData, path) => {
    dispatch(setselectuser(userData));
    navigate(path);
  };

  const renderUserRows = (userData) => {
    if (!userData || userData._id === admin._id) return null;

    const lastMedicationStatus = getLastMedicationStatus(userData._id);
    const msMedicineCount = getMsMedicineCount(userData._id);
    let rowClass = "row-default";
    let buttonVariant = "secondary";
    let buttonText = "ไม่พบข้อมูล";

    if (lastMedicationStatus !== null) {
      if (lastMedicationStatus === 0) {
        rowClass = "row-danger";
        buttonVariant = "danger";
        buttonText = "ไม่ได้กิน";
      } else if (lastMedicationStatus === 1) {
        rowClass = "row-warning";
        buttonVariant = "warning";
        buttonText = "รอกิน";
      } else if (lastMedicationStatus === 2) {
        rowClass = "row-success";
        buttonVariant = "success";
        buttonText = "กินแล้ว";
      }
    }

    const personalButtonVariant = hasPersonalData(userData._id) ? "outline-warning" : "outline-success";
    
    // Check for hfsLevel === 0 in estimation or any evaluation in estimationHFS (from admin1 or admin2)
    let estimationHFSButtonVariant = "outline-success"; // Default is success
    if (hasEstimation(userData._id)) {
      estimationHFSButtonVariant = "outline-warning"; // If estimation has hfsLevel === 0, change to yellow outline
    }
    if (hasEstimationHFS(userData._id)) {
      estimationHFSButtonVariant = "warning"; // If any evaluation from admin1 or admin2 exists in estimationHFS, make it solid yellow (warning)
    }

    return (
      <tr key={userData._id} className={rowClass}>
        <td className="table-center">{userData.name}</td>
        <td className="table-center">{userData.phone}</td>
        <td className="table-center">{userData.age}</td>
        <td className="table-center">{msMedicineCount}</td>
        <td className="table-center">
          <Button variant={buttonVariant} disabled>
            {buttonText}
          </Button>
        </td>
        <td className="table-center">
          <Button variant={personalButtonVariant} onClick={() => handleNavigation(userData, "/personal")}>
            ข้อมูลส่วนบุคคล
          </Button>
          <Button variant={`outline-${buttonVariant}`} onClick={() => handleNavigation(userData, "/medication")}>
            รายละเอียดการกินยา
          </Button>
          <Button variant={estimationHFSButtonVariant} onClick={() => handleNavigation(userData, "/estimation")}>
            การประเมินอาการ HFS
          </Button>
          <Button variant={`outline-${buttonVariant}`} onClick={() => handleNavigation(userData, "/chat")}>
            แชท
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <Container fluid>
      <Navigation />
      <Row>
        <Col>
          <Table responsive striped bordered hover >
            <thead>
              <tr>
                <th className="table-center">ชื่อ-สกุล</th>
                <th className="table-center">เบอร์โทรศัพท์</th>
                <th className="table-center">อายุ</th>
                <th className="table-center">ขาดยา</th>
                <th className="table-center">สถานะการกินยา</th>
                <th>{}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(renderUserRows)}
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

export default Home;