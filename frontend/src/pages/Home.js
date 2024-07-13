import React, { useContext, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { fetchUsersThunk } from "../features/usersSlice";
import { setselectuser, deleteselectuser } from "../features/selectuserSlice";
import { fetchMedicationsThunk } from "../features/medicationSlice";
import { fetchEstimationsThunk } from "../features/estimationSlice";
import { fetchMessagesThunk } from "../features/messageSlice";
import { addNotification } from "../features/notificationsSlice";
import axios from "axios";
import { AppContext } from "../context/appContext";

function Home() {
  const admin = useSelector((state) => state.admin);
  const users = useSelector((state) => state.users) || [];
  const medication = useSelector((state) => state.medication) || [];
  const estimation = useSelector((state) => state.estimation) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { API_BASE_URL } = useContext(AppContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.all([
          axios.get(`${API_BASE_URL}/getusers`),
          axios.post(`${API_BASE_URL}/getmedication`),
          axios.post(`${API_BASE_URL}/getestimation`),
          axios.post(`${API_BASE_URL}/getmessages`),
          axios.get(`${API_BASE_URL}/getmednoti`)
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
    dispatch(fetchMessagesThunk());

    const intervalId = setInterval(() => {
      dispatch(fetchUsersThunk());
      dispatch(fetchMedicationsThunk());
      dispatch(fetchEstimationsThunk());
      dispatch(fetchMessagesThunk());
    }, 5000);

    window.addEventListener('beforeunload', fetchData);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', fetchData);
    };
  }, [dispatch]);

  const getLastMedicationStatus = (userId) => {
    const userMedications = medication.filter((med) => med.from === userId);
    return userMedications.length > 0 ? userMedications[userMedications.length - 1].status : -1;
  };

  const getMsMedicineCount = (userId) => {
    return medication.filter((med) => med.from === userId && med.status === 0).length;
  };

  const hasEstimation = (userId) => {
    return estimation.some((est) => est.from === userId);
  };

  const sortedUsers = users.slice().sort((a, b) => getLastMedicationStatus(a._id) - getLastMedicationStatus(b._id));

  const handleNavigation = (userData, path) => {
    dispatch(setselectuser(userData));
    navigate(path);
  };

  const renderUserRows = (userData) => {
    if (!userData || userData._id === admin._id) return null;

    const lastMedicationStatus = getLastMedicationStatus(userData._id);
    const rowClass = lastMedicationStatus === 0 ? "row-danger" : lastMedicationStatus === 1 ? "row-warning" : "row-success";
    const buttonVariant = lastMedicationStatus === 0 ? "danger" : lastMedicationStatus === 1 ? "warning" : "success";
    const msMedicineCount = getMsMedicineCount(userData._id);

    return (
      <tr key={userData._id} className={rowClass}>
        <td className="table-center">{userData.name}</td>
        <td className="table-center">{userData.phone}</td>
        <td className="table-center">{userData.age}</td>
        <td className="table-center">{msMedicineCount}</td>
        <td className="table-center">
          <Button variant={buttonVariant} disabled>
            {lastMedicationStatus === 0 ? "ไม่ได้กิน" : lastMedicationStatus === 1 ? "ล่าช้า" : "กินแล้ว"}
          </Button>
        </td>
        <td className="table-center">
          <Button variant="outline-success" onClick={() => handleNavigation(userData, "/personal")}>ข้อมูลส่วนบุคคล</Button>
          <Button variant={`outline-${buttonVariant}`} onClick={() => handleNavigation(userData, "/medication")}>รายละเอียดการกินยา</Button>
          <Button variant={hasEstimation(userData._id) ? "outline-warning" : "outline-success"} onClick={() => handleNavigation(userData, "/estimation")}>การประเมินอาการ HFS</Button>
          <Button variant={`outline-${buttonVariant}`} onClick={() => handleNavigation(userData, "/chat")}>แชท</Button>
        </td>
      </tr>
    );
  };

  return (
    <Container>
      <Navigation />
      <Row>
        <Col>
          <Table>
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
              {sortedUsers.map(renderUserRows)}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;