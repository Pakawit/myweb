import React, { useContext, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { useNavigate } from "react-router-dom";
import "./style.css";
import axios from "axios";
import { setUsers } from "../features/usersSlice";

function Home() {
  const user = useSelector((state) => state.user);
  const users = useSelector((state) => state.users);
  const { setMember, API_BASE_URL } = useContext(AppContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/getusers`);
        dispatch(setUsers(res.data));
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [dispatch, API_BASE_URL]);

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
              {users &&
                users.map(
                  (userData) =>
                    userData &&
                    userData._id &&
                    userData._id !== user._id && (
                      <tr key={userData._id}>
                        <td className="table-center">{userData.name}</td>
                        <td className="table-center">{userData.phone}</td>
                        <td className="table-center">{userData.age}</td>
                        <td className="table-center">{userData.ms_medicine}</td>
                        <td className="table-center">
                          {/* แสดงสถานะการกินยา */}
                          <Button
                            className={
                              userData.laststatus === 0
                                ? "btn-danger"
                                : userData.laststatus === 1
                                ? "btn-warning"
                                : "btn-success"
                            }
                            disabled
                          >
                            {userData.laststatus === 0
                              ? "ยังไม่ได้กินยา"
                              : userData.laststatus === 1
                              ? "ยังไม่ได้กินยา"
                              : "กินยาแล้ว"}
                          </Button>
                        </td>
                        {/* ปุ่มที่กดไปหน้าต่างๆ */}
                        <td className="table-center">
                          <Button
                            variant="outline-success"
                            onClick={() => {
                              setMember(userData);
                              navigate("/personal");
                            }}
                          >
                            ข้อมูลส่วนบุคคล
                          </Button>{" "}
                          <Button
                            variant="outline-success"
                            onClick={() => {
                              setMember(userData);
                              navigate("/medication");
                            }}
                          >
                            รายละเอียดการกินยา
                          </Button>{" "}
                          <Button
                            variant="outline-success"
                            onClick={() => {
                              setMember(userData);
                              navigate("/estimation");
                            }}
                          >
                            การประเมินอาการ HFS
                          </Button>{" "}
                          <Button
                            variant="outline-success"
                            onClick={() => {
                              setMember(userData);
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
