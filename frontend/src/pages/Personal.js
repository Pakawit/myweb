import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  Container,
  Button,
  Form,
  Row,
  Col,
  Modal,
  Alert,
  Table,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { AppContext } from "../context/appContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { loadMedicationsData } from "../features/medicationSlice";
import { setselectuser } from "../features/selectuserSlice";
import { loadPersonalnotificationData } from "../features/personalnotificationSlice";
import { loadUsersData } from "../features/usersSlice";
import { useNavigate } from "react-router-dom";

const LabelCol = React.memo(({ children }) => (
  <Form.Label
    column
    xs={12}
    md={6}
    className="text-center text-md-end text-wrap"
    style={{ wordBreak: "keep-all" }}
  >
    {children}
  </Form.Label>
));

const FieldCol = React.memo(({ children }) => <Col xs={12} md={6}>{children}</Col>);

function Personal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { API_BASE_URL } = useContext(AppContext);

  const admin = useSelector((state) => state.admin);
  const selectuser = useSelector((state) => state.selectuser);
  const users = useSelector((state) => state.users);
  const personal = useSelector((state) => state.personalnotification);
  const medication = useSelector((state) => state.medication);

  // redirect ถ้าไม่มี selectuser (กันรีเฟรชหน้า)
  useEffect(() => {
    if (!selectuser || !selectuser._id) {
      navigate("/");
    }
  }, [selectuser, navigate]);

  // initial load (ครั้งเดียว)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        await Promise.all([
          dispatch(loadMedicationsData()),
          dispatch(loadPersonalnotificationData()),
          dispatch(loadUsersData()),
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchAll();
  }, [dispatch]);

  // current user จาก store
  const currentUser = useMemo(() => {
    if (!selectuser?._id) return null;
    return users.find((u) => u._id === selectuser._id) || selectuser;
  }, [users, selectuser]);

  const [userData, setUserData] = useState(currentUser || {});
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: "", show: false });

  // input แรก
  const firstInputRef = useRef(null);

  // 👉 ซิงก์จาก currentUser เฉพาะตอนที่ "ไม่ได้แก้ไข"
  useEffect(() => {
    if (!editMode && currentUser) {
      setUserData(currentUser);
    }
  }, [currentUser, editMode]);

  const rules = useMemo(
    () => ({
      name: /^[a-zA-Zก-๙\s]{1,30}$/,
      phone: /^\d{0,10}$/,
      other_numbers: /^\d{0,10}$/,
      age: /^\d{1,3}$/,
      diagnosis: /^.{0,300}$/,
      taking_capecitabine: /^.{0,300}$/,
      hospital_number: /^.{0,50}$/,
      morningTime: /.+/,
      eveningTime: /.+/,
    }),
    []
  );

  // onChange: อัปเดตเฉยๆ (ไม่ validate ตรงนี้)
  const handleChange = useCallback(({ target: { name, value } }) => {
    setUserData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // validate ตอน blur เพื่อลดงานตอนพิมพ์
  const validateField = useCallback(
    (name, value) => {
      const rule = rules[name];
      if (!rule) return;
      const isValid = rule.test(value ?? "");
      setErrors((prev) => ({
        ...prev,
        [name]: isValid ? "" : `ข้อมูล ${name} ไม่ถูกต้อง`,
      }));
    },
    [rules]
  );

  const showNotification = (message) =>
    setNotification({ message, show: true });

  const handleSubmit = async () => {
    // ไม่มีการเปลี่ยนแปลง
    if (JSON.stringify(userData) === JSON.stringify(currentUser)) {
      showNotification("ไม่มีการเปลี่ยนแปลงข้อมูล");
      return;
    }
    // มี error ค้าง
    if (Object.values(errors).some((e) => e)) {
      showNotification("กรุณาตรวจสอบข้อมูลอีกครั้ง");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/saveChanges`, {
        changes: userData,
        originalName: currentUser.name,
      });
      setEditMode(false);
      showNotification("แก้ไขข้อมูลแล้ว (รอการยืนยันจาก Chureeporn)");
      dispatch(loadPersonalnotificationData());
      // ให้ฟอร์มสะท้อนค่าปัจจุบันจาก store (ฝั่งอนุมัติ)
      setUserData(currentUser);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleConfirmChanges = async () => {
    try {
      await axios.post(`${API_BASE_URL}/confirmChanges`, {
        _id: currentUser._id,
        name: currentUser.name,
      });
      showNotification("ยืนยันการเปลี่ยนแปลงแล้ว");
      await dispatch(loadUsersData());
      await dispatch(loadPersonalnotificationData());
    } catch (error) {
      console.error("Error in confirmChanges:", error);
    }
  };

  const handleRejectChanges = async () => {
    try {
      await axios.post(`${API_BASE_URL}/rejectChanges`, {
        _id: currentUser._id,
        name: currentUser.name,
      });
      showNotification("ยกเลิกการเปลี่ยนแปลงแล้ว");
      await dispatch(loadUsersData());
      await dispatch(loadPersonalnotificationData());
    } catch (error) {
      console.error("Error in rejectChanges:", error);
    }
  };

  // เข้าโหมดแก้ไข: โฟกัสช่องแรกโดยไม่เลื่อนจอ และไม่ setUserData ซ้ำ
  const startEdit = useCallback(() => {
    setErrors({});
    setEditMode(true);
    requestAnimationFrame(() => {
      firstInputRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const renderAdminButtons = () => {
    const isPendingApproval = !!personal[currentUser._id];
    if (isPendingApproval) {
      return (
        <Alert variant="info" className="text-center">
          กำลังรอการยืนยันจาก Chureeporn
        </Alert>
      );
    }
    return (
      <Row className="mb-3">
        <Col xs={12} className="d-grid gap-2 d-md-flex justify-content-md-end">
          {editMode ? (
            <>
              <Button variant="outline-success" onClick={handleSubmit}>
                บันทึก
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => {
                  setEditMode(false);
                  setUserData(currentUser);
                  setErrors({});
                }}
              >
                ยกเลิก
              </Button>
            </>
          ) : (
            <Button variant="outline-dark" onClick={startEdit}>
              แก้ไข
            </Button>
          )}
        </Col>
      </Row>
    );
  };

  const renderAdmin2Table = useMemo(() => {
    const pending = personal[currentUser._id];
    if (!pending) return null;
    return (
      <Table striped bordered hover responsive="md" className="text-center">
        <thead>
          <tr>
            {[
              "ชื่อ-สกุล",
              "เบอร์โทรศัพท์",
              "เบอร์โทรศัพท์ผู้ติดต่อ",
              "อายุ",
              "การวินิจฉัยโรคหลัก",
              "การรับประทานยา Capecitabine",
              "เวลารับประทานยาช่วงเช้า",
              "เวลารับประทานยาช่วงเย็น",
              "เลขโรงพยาบาล",
              "การดำเนินการ",
            ].map((h) => (
              <th key={h} className="text-center">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-truncate">{pending.name || "N/A"}</td>
            <td className="text-truncate">{pending.phone || "N/A"}</td>
            <td className="text-truncate">{pending.other_numbers || "N/A"}</td>
            <td>{pending.age}</td>
            <td className="text-break">{pending.diagnosis || "N/A"}</td>
            <td className="text-break">
              {pending.taking_capecitabine || "N/A"}
            </td>
            <td>{pending.morningTime || "N/A"}</td>
            <td>{pending.eveningTime || "N/A"}</td>
            <td className="text-truncate">
              {pending.hospital_number || "N/A"}
            </td>
            <td>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={handleConfirmChanges}
                >
                  ยืนยัน
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleRejectChanges}
                >
                  ปฏิเสธ
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
    );
  }, [personal, currentUser?._id]); // memo ตารางให้ไม่ re-render ระหว่างพิมพ์

  if (!currentUser) return null;

  return (
    <Container fluid className="px-2 px-sm-3 px-md-4">
      <Navigation />

      <h1 className="h3 h2-md text-center text-md-start my-3">
        ข้อมูลส่วนบุคคล
      </h1>

      <Form onSubmit={(e) => e.preventDefault()} autoComplete="off">
        <Form.Group as={Row} className="mb-3 gy-2 align-items-center">
          <LabelCol>ชื่อ-สกุล</LabelCol>
          <FieldCol>
            <Form.Control
              ref={firstInputRef}
              type="text"
              name="name"
              value={userData.name || ""}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              disabled={!editMode}
              autoComplete="off"
              spellCheck={false}
            />
            {errors.name && (
              <Alert variant="danger" className="mt-2 py-2 mb-0">
                {errors.name}
              </Alert>
            )}
          </FieldCol>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 gy-2 align-items-center">
          <LabelCol>เบอร์โทรศัพท์</LabelCol>
          <FieldCol>
            <Form.Control
              type="text"
              name="phone"
              value={userData.phone || ""}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              disabled={!editMode}
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
            />
            {errors.phone && (
              <Alert variant="danger" className="mt-2 py-2 mb-0">
                {errors.phone}
              </Alert>
            )}
          </FieldCol>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 gy-2 align-items-center">
          <LabelCol>เบอร์โทรศัพท์ผู้ติดต่อ</LabelCol>
          <FieldCol>
            <Form.Control
              type="text"
              name="other_numbers"
              value={userData.other_numbers || ""}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              disabled={!editMode}
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
            />
            {errors.other_numbers && (
              <Alert variant="danger" className="mt-2 py-2 mb-0">
                {errors.other_numbers}
              </Alert>
            )}
          </FieldCol>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 gy-2 align-items-center">
          <LabelCol>อายุ</LabelCol>
          <FieldCol>
            <Form.Control
              type="number"
              name="age"
              value={userData.age || ""}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              disabled={!editMode}
              min={0}
            />
            {errors.age && (
              <Alert variant="danger" className="mt-2 py-2 mb-0">
                {errors.age}
              </Alert>
            )}
          </FieldCol>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 gy-2">
          <LabelCol>การวินิจฉัยโรคหลัก</LabelCol>
          <FieldCol>
            <Form.Control
              as="textarea"
              name="diagnosis"
              value={userData.diagnosis || ""}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              disabled={!editMode}
              rows={3}
            />
            {errors.diagnosis && (
              <Alert variant="danger" className="mt-2 py-2 mb-0">
                {errors.diagnosis}
              </Alert>
            )}
          </FieldCol>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 gy-2">
          <LabelCol>การรับประทานยา Capecitabine</LabelCol>
          <FieldCol>
            <Form.Control
              as="textarea"
              name="taking_capecitabine"
              value={userData.taking_capecitabine || ""}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              disabled={!editMode}
              rows={3}
            />
            {errors.taking_capecitabine && (
              <Alert variant="danger" className="mt-2 py-2 mb-0">
                {errors.taking_capecitabine}
              </Alert>
            )}
          </FieldCol>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 gy-2 align-items-center">
          <LabelCol>เวลารับประทานยาช่วงเช้า</LabelCol>
          <FieldCol>
            <Form.Control
              type="time"
              name="morningTime"
              value={userData.morningTime || ""}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              disabled={!editMode}
            />
            {errors.morningTime && (
              <Alert variant="danger" className="mt-2 py-2 mb-0">
                {errors.morningTime}
              </Alert>
            )}
          </FieldCol>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 gy-2 align-items-center">
          <LabelCol>เวลารับประทานยาช่วงเย็น</LabelCol>
          <FieldCol>
            <Form.Control
              type="time"
              name="eveningTime"
              value={userData.eveningTime || ""}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              disabled={!editMode}
            />
            {errors.eveningTime && (
              <Alert variant="danger" className="mt-2 py-2 mb-0">
                {errors.eveningTime}
              </Alert>
            )}
          </FieldCol>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 gy-2 align-items-center">
          <LabelCol>เลขโรงพยาบาล</LabelCol>
          <FieldCol>
            <Form.Control
              type="text"
              name="hospital_number"
              value={userData.hospital_number || ""}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              disabled={!editMode}
              autoComplete="off"
              spellCheck={false}
            />
            {errors.hospital_number && (
              <Alert variant="danger" className="mt-2 py-2 mb-0">
                {errors.hospital_number}
              </Alert>
            )}
          </FieldCol>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 gy-2 align-items-center">
          <LabelCol>ขาดยา</LabelCol>
          <FieldCol>
            <Form.Control
              type="text"
              name="ms_medicine"
              value={
                medication.filter(
                  (m) => m.from === currentUser._id && m.status === 0
                ).length
              }
              disabled
              readOnly
            />
          </FieldCol>
        </Form.Group>

        <Form.Group as={Row} className="mb-4 gy-2 align-items-center">
          <LabelCol>วันที่ลงทะเบียน</LabelCol>
          <FieldCol>
            <Form.Control
              type="text"
              name="createdAt"
              value={
                currentUser?.createdAt
                  ? new Date(currentUser.createdAt).toLocaleString("th-TH", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""
              }
              disabled
              readOnly
            />
          </FieldCol>
        </Form.Group>
      </Form>

      {admin?.name === "Apatnipa" && renderAdminButtons()}
      {admin?.name === "Chureeporn" && renderAdmin2Table}

      <Modal
        show={notification.show}
        onHide={() => setNotification({ message: "", show: false })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>แจ้งเตือน</Modal.Title>
        </Modal.Header>
        <Modal.Body>{notification.message}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setNotification({ message: "", show: false })}
          >
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Personal;