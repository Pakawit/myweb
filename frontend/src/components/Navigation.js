// src/components/Navigation.jsx
import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Button, Container, Navbar, Dropdown, Badge } from "react-bootstrap";
import axios from "axios";

import config from "../config";

import { deleteUsers } from "../features/usersSlice";
import { deleteMedication } from "../features/medicationSlice";
import { deleteMessage } from "../features/messageSlice";
import { deleteAdmin } from "../features/adminSlice";
import { setselectuser } from "../features/selectuserSlice";

import {
  fetchChatNotifications,
  removeChatNotification,
  clearChatNotifications,
} from "../features/chatnotificationSlice";

import { loadPersonalnotificationData } from "../features/personalnotificationSlice";

import {
  loadHFSNotifications,
  clearHfsNotifications,
} from "../features/hfsnotificationSlice";

import store, { persistor } from "../store";

// ลด re-render
function useAppSelector(selector) {
  return useSelector(selector, shallowEqual);
}

const Navigation = memo(function Navigation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // เลือกเฉพาะที่จำเป็น
  const adminName = useAppSelector((s) => s.admin?.name || "Admin");
  const users = useAppSelector((s) => s.users);
  const selectuserId = useAppSelector((s) => s.selectuser?._id);
  const personal = useAppSelector((s) => s.personalnotification);
  const hfs = useAppSelector((s) => s.hfsnotification);
  const chatnotification = useAppSelector((s) => s.chatnotification);

  // สร้าง map id->user
  const usersById = useMemo(() => {
    const map = Object.create(null);
    for (const u of users) map[u._id] = u;
    return map;
  }, [users]);

  // ชื่อ user ที่เลือกปัจจุบัน (โชว์ตรงกลาง navbar)
  const selectedUserName = useMemo(() => {
    if (!selectuserId) return null;
    return usersById[selectuserId]?.name || "Unknown User";
  }, [usersById, selectuserId]);

  // รวมจำนวนแจ้งเตือน personal + HFS
  const totalPersonalNotifications = useMemo(() => {
    const hfsCount = Object.keys(hfs?.byEstimationId || {}).length;
    return Object.keys(personal || {}).length + hfsCount;
  }, [personal, hfs?.byEstimationId]);

  const hideBackButton = location.pathname === "/";

  // polling แบบคงตัว + หยุดเมื่อแท็บไม่โฟกัส
  const intervalRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchChatNotifications()),
        dispatch(loadPersonalnotificationData()),
        dispatch(loadHFSNotifications()),
      ]);
    } catch {
      // เงียบ เพื่อลด log noise
    }
  }, [dispatch]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(loadData, 3000);
  }, [loadData]);

  const stopPolling = useCallback(() => {
    if (!intervalRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    loadData();
    startPolling();

    const onVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        loadData();
        startPolling();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stopPolling();
    };
  }, [loadData, startPolling, stopPolling]);

  const back = useCallback(() => navigate("/"), [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await axios.post(`${config.API_BASE_URL}/logout`, { name: adminName });
    } catch {
      // เงียบไว้
    } finally {
      try {
        store.dispatch({ type: "RESET_STORE" });
        dispatch(deleteUsers());
        dispatch(deleteMedication());
        dispatch(deleteMessage());
        dispatch(deleteAdmin());
        dispatch(clearHfsNotifications());
        dispatch(clearChatNotifications());
        await persistor.purge();
      } finally {
        navigate("/login");
      }
    }
  }, [adminName, dispatch, navigate]);

  return (
    <Navbar bg="body-tertiary" className="sticky-top border-bottom">
      <Container fluid className="py-2">
        <div className="row w-100 align-items-center g-2">
          {/* ซ้าย */}
          <div className="col-auto d-flex align-items-center">
            <Button
              variant="outline-dark"
              onClick={back}
              style={{ visibility: hideBackButton ? "hidden" : "visible" }}
              className="me-2"
            >
              <i className="bi bi-chevron-left"></i>
            </Button>
            <Navbar.Text className="border border-secondary rounded px-3 py-1 fw-bold text-secondary">
              <span
                className="d-inline-block text-truncate"
                style={{ maxWidth: 160 }}
              >
                {adminName}
              </span>
            </Navbar.Text>
          </div>

          {/* กลาง */}
          <div className="col text-center">
            {selectuserId && (
              <Navbar.Text
                className="fw-bold fs-5 text-truncate d-inline-block"
                style={{ maxWidth: 480 }}
                title={selectedUserName || "Unknown User"}
              >
                {selectedUserName || "Unknown User"}
              </Navbar.Text>
            )}
          </div>

          {/* ขวา */}
          <div className="col-auto d-flex align-items-center gap-2 flex-wrap justify-content-end">
            {/* ปุ่มรวมแจ้งเตือน: แก้ข้อมูล + HFS */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-dark" id="personal-dropdown">
                <i className="bi bi-exclamation-triangle"></i>
                {totalPersonalNotifications > 0 && (
                  <Badge pill bg="warning" className="ms-2">
                    {totalPersonalNotifications}
                  </Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-end">
                {totalPersonalNotifications === 0 ? (
                  <Dropdown.Item>ไม่มีการแจ้งเตือน</Dropdown.Item>
                ) : (
                  <>
                    {/* pending personal edits */}
                    {Object.keys(personal || {}).map((uid) => {
                      const user = usersById[uid];
                      if (!user) return null;
                      return (
                        <Dropdown.Item
                          key={uid}
                          onClick={() => {
                            dispatch(setselectuser(user));
                            navigate("/personal");
                          }}
                        >
                          แก้ไขข้อมูล {user.name}
                        </Dropdown.Item>
                      );
                    })}

                    {/* HFS notifications */}
                    {Object.values(hfs?.byEstimationId || {}).map((it) => {
                      const user = it?.userId ? usersById[it.userId] : null;
                      if (!user) return null;
                      return (
                        <Dropdown.Item
                          key={it.estimationId}
                          onClick={() => {
                            dispatch(setselectuser(user));
                            navigate("/estimation");
                          }}
                        >
                          ประเมินอาการ {user.name}
                        </Dropdown.Item>
                      );
                    })}
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>

            {/* Chat notifications */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-dark" id="chat-dropdown">
                <i className="bi bi-bell"></i>
                {Object.keys(chatnotification || {}).length > 0 && (
                  <Badge pill bg="danger" className="ms-2">
                    {Object.keys(chatnotification).length}
                  </Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-end">
                {Object.keys(chatnotification || {}).length === 0 ? (
                  <Dropdown.Item>ไม่มีการแจ้งเตือน</Dropdown.Item>
                ) : (
                  Object.keys(chatnotification).map((key) => {
                    const n = chatnotification[key];
                    const user = n ? usersById[n.from] : null;
                    if (!n || !user) return null;

                    return (
                      <Dropdown.Item
                        key={key}
                        onClick={() => {
                          // ล้างแจ้งเตือนของ user นี้ แล้วค่อยไปหน้าแชท
                          dispatch(removeChatNotification(n.from));
                          dispatch(setselectuser(user));
                          navigate("/chat");
                        }}
                      >
                        แชทจาก {user.name}
                      </Dropdown.Item>
                    );
                  })
                )}
              </Dropdown.Menu>
            </Dropdown>

            <Button
              variant="outline-dark"
              onClick={() => navigate("/log")}
              title="Log"
            >
              <i className="bi bi-journal"></i>
            </Button>

            <Button
              variant="outline-dark"
              onClick={handleLogout}
              title="Logout"
            >
              <i className="bi bi-box-arrow-in-right"></i>
            </Button>
          </div>
        </div>
      </Container>
    </Navbar>
  );
});

export default Navigation;