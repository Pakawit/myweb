import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Nav, Navbar, Dropdown, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteUsers } from "../features/usersSlice";
import { deleteMedication } from "../features/medicationSlice";
import { deleteMessage } from "../features/messageSlice";
import { deleteAdmin } from "../features/adminSlice";
import { setselectuser } from "../features/selectuserSlice";
import { fetchChatNotifications, removeChatNotification } from '../features/chatnotificationSlice';
import { loadPersonalnotificationData } from "../features/personalnotificationSlice";
import { loadEstimationHFSData } from "../features/estimationHFSSlice";
import { AppContext } from "../context/appContext";
import axios from "axios";

function Navigation() {
  const admin = useSelector((state) => state.admin);
  const chatnotification = useSelector((state) => state.chatnotification);
  const users = useSelector((state) => state.users);
  const selectuser = useSelector((state) => state.selectuser);
  const personal = useSelector((state) => state.personalnotification);
  const estimationHFS = useSelector((state) => state.estimationHFS);
  const dispatch = useDispatch();
  const { API_BASE_URL } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchChatNotifications()),
          dispatch(loadPersonalnotificationData()),
          dispatch(loadEstimationHFSData()),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();

    const intervalId = setInterval(loadData, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const back = () => {
    navigate("/");
  };

  const handleLogout = async (e) => {
    e.preventDefault();  // ป้องกันพฤติกรรมเริ่มต้นของปุ่ม
    try {
      await Promise.all([
        dispatch(deleteUsers()),
        dispatch(deleteMedication()),
        dispatch(deleteMessage()),
        dispatch(deleteAdmin()),
      ]);

      await axios.post(`${API_BASE_URL}/admin/logout`, {
        name: admin.name,
      });

      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const totalPersonalNotifications = Object.keys(personal).length + Object.keys(estimationHFS).length; // รวมจำนวนการแจ้งเตือนส่วนบุคคลและการประเมิน HFS
  const shouldHideBackButton = location.pathname === "/"; // ซ่อนปุ่ม "Back" ถ้าอยู่ในหน้าแรก

  return (
    <Navbar>
      <Container fluid>
        <div className="d-flex align-items-center">
          <Button variant="outline-dark" onClick={back} style={{ visibility: shouldHideBackButton ? "hidden" : "visible" }} className="me-2">
            <i className="bi bi-chevron-left"></i>
          </Button>

          <Navbar.Text className="border border-secondary rounded px-3 py-1 fw-bold text-secondary">
            {admin.name}
          </Navbar.Text>
        </div>

        <div className="d-flex flex-grow-1 justify-content-center">
          {selectuser && selectuser._id && (
            <Navbar.Text className="fw-bold fs-5">
              {users.find((user) => user._id === selectuser._id)?.name || "Unknown User"}
            </Navbar.Text>
          )}
        </div>

        <Nav className="ms-auto d-flex align-items-center">

          <Dropdown className="me-2">
            <Dropdown.Toggle variant="outline-dark" id="personal-notification-dropdown">
              <i className="bi bi-exclamation-triangle"></i>
              {totalPersonalNotifications > 0 && (
                <Badge pill bg="warning" style={{ marginLeft: "5px" }}>{totalPersonalNotifications}</Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {totalPersonalNotifications === 0 ? (
                <Dropdown.Item>ไม่มีการแจ้งเตือน</Dropdown.Item>
              ) : (
                <>
                  {/* Personal Notification */}
                  {Object.keys(personal).map((userId) => {
                    const user = users.find((user) => user._id === userId); // ค้นหา user ใน users
                    return (
                      <Dropdown.Item key={userId}
                        onClick={() => {
                          if (user) {
                            dispatch(setselectuser(user));
                            navigate("/personal");
                          }
                        }}>
                        แก้ไขข้อมูล {user ? user.name : "Unknown User"}
                      </Dropdown.Item>
                    );
                  })}

                  {/* HFS Notification */}
                  {Object.keys(estimationHFS).map((estimationId) => {
                    const estimationUser = estimationHFS[estimationId];
                    const user = estimationUser ? users.find((user) => user._id === estimationUser.userId) : null; // ค้นหา user ใน estimationHFS
                    return (
                      <Dropdown.Item
                        key={estimationId}
                        onClick={() => {
                          if (user) {
                            dispatch(setselectuser(user));
                            navigate("/estimation");
                          }
                        }}
                      >
                        ประเมินอาการ {user ? user.name : "Unknown User"}
                      </Dropdown.Item>
                    );
                  })}
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>

          {/* Chat Notification */}
          <Dropdown className="me-2">
            <Dropdown.Toggle variant="outline-dark" id="dropdown-basic">
              <i className="bi bi-bell"></i>
              {chatnotification.length > 0 && (<Badge pill bg="danger" style={{ marginLeft: "5px" }}>{chatnotification.length}</Badge>)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {chatnotification.length === 0 ? (
                <Dropdown.Item>ไม่มีการแจ้งเตือน</Dropdown.Item>
              ) : (
                chatnotification.map((notification) => {
                  const user = users.find((user) => user._id === notification.from);
                  return (
                    <Dropdown.Item
                      key={notification.from}
                      onClick={() => {
                        if (user) {
                          dispatch(setselectuser(user));
                          dispatch(removeChatNotification(notification.from)); // ลบการแจ้งเตือน
                          navigate("/chat"); // นำทางไปยังหน้าแชท
                        }
                      }}
                    >
                      แชทจาก {user ? user.name : "Unknown User"} {/* แสดงชื่อผู้ใช้ หรือ Unknown User */}
                    </Dropdown.Item>
                  );
                })
              )}
            </Dropdown.Menu>
          </Dropdown>

          <Button variant="outline-dark" className="me-2" onClick={() => navigate("/log")}>
            <i className="bi bi-journal"></i>
          </Button>

          <Button variant="outline-dark" onClick={handleLogout}>
            <i className="bi bi-box-arrow-in-right"></i>
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Navigation;