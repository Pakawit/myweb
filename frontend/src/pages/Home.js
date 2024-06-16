import React, { useEffect } from "react";
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

function Home() {
  const admin = useSelector((state) => state.admin);
  const users = useSelector((state) => state.users) || [];
  const medication = useSelector((state) => state.medication) || [];
  const estimation = useSelector((state) => state.estimation) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(deleteselectuser());
    dispatch(addNotification());
    dispatch(fetchUsersThunk());
    dispatch(fetchMedicationsThunk());
    dispatch(fetchEstimationsThunk());
    dispatch(fetchMessagesThunk());
  }, [dispatch]);

  const getLastMedicationStatus = (userId) => {
    const userMedications = medication.filter((med) => med.from === userId);
    if (userMedications.length > 0) {
      return userMedications[userMedications.length - 1].status;
    }
    return -1;
  };

  const hasEstimation = (userId) => {
    return estimation.some((est) => est.from === userId);
  };

  const sortedUsers = Array.isArray(users)
    ? users
        .slice()
        .sort(
          (a, b) =>
            getLastMedicationStatus(a._id) - getLastMedicationStatus(b._id)
        )
    : [];

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
              {Array.isArray(sortedUsers) &&
                sortedUsers.map(
                  (userData) =>
                    userData &&
                    userData._id &&
                    userData._id !== admin._id && (
                      <tr
                        key={userData._id}
                        className={
                          getLastMedicationStatus(userData._id) === 0
                            ? "row-danger"
                            : getLastMedicationStatus(userData._id) === 1
                            ? "row-warning"
                            : "row-success"
                        }
                      >
                        <td className="table-center">{userData.name}</td>
                        <td className="table-center">{userData.phone}</td>
                        <td className="table-center">{userData.age}</td>
                        <td className="table-center">{userData.ms_medicine}</td>
                        <td className="table-center">
                          <Button
                            className={
                              getLastMedicationStatus(userData._id) === 0
                                ? "btn-danger"
                                : getLastMedicationStatus(userData._id) === 1
                                ? "btn-warning"
                                : "btn-success"
                            }
                            disabled
                          >
                            {getLastMedicationStatus(userData._id) === 0
                              ? "ไม่ได้กิน"
                              : getLastMedicationStatus(userData._id) === 1
                              ? "ล่าช้า"
                              : "กินแล้ว"}
                          </Button>
                        </td>
                        <td className="table-center">
                          <Button
                            variant="outline-success"
                            onClick={() => {
                              dispatch(setselectuser(userData));
                              navigate("/personal");
                            }}
                          >
                            ข้อมูลส่วนบุคคล
                          </Button>{" "}
                          <Button
                            variant={
                              getLastMedicationStatus(userData._id) === 0
                                ? "outline-danger"
                                : getLastMedicationStatus(userData._id) === 1
                                ? "outline-warning"
                                : "outline-success"
                            }
                            onClick={() => {
                              dispatch(setselectuser(userData));
                              navigate("/medication");
                            }}
                          >
                            รายละเอียดการกินยา
                          </Button>{" "}
                          <Button
                            variant={
                              hasEstimation(userData._id)
                                ? "outline-warning"
                                : "outline-success"
                            }
                            onClick={() => {
                              dispatch(setselectuser(userData));
                              navigate("/estimation");
                            }}
                          >
                            การประเมินอาการ HFS
                          </Button>{" "}
                          <Button
                            variant={
                              getLastMedicationStatus(userData._id) === 0
                                ? "outline-danger"
                                : getLastMedicationStatus(userData._id) === 1
                                ? "outline-warning"
                                : "outline-success"
                            }
                            onClick={() => {
                              dispatch(setselectuser(userData));
                              navigate("/chat");
                            }}
                          >
                            แชท
                          </Button>
                        </td>
                      </tr>
                    )
                )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
