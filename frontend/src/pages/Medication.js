import React, { useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchMedicationsThunk } from "../features/medicationSlice";

function Medication() {
  const medication = useSelector((state) => state.medication);
  const selectuser = useSelector((state) => state.selectuser);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMedicationsThunk());
  }, [dispatch]);

  const renderStatusButton = (status) => {
    switch (status) {
      case 0:
        return (
          <Button variant="danger" disabled>
            ไม่ได้กิน
          </Button>
        );
      case 1:
        return (
          <Button variant="warning" disabled>
            ล่าช้า
          </Button>
        );
      case 2:
        return (
          <Button variant="success" disabled>
            กินแล้ว
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Navigation />
      <Row>
        <h1>รายละเอียดการกินยา</h1>
      </Row>
      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th className="table-center" style={{ width: "33%" }}>
                  วัน/เดือน/ปี
                </th>
                <th className="table-center" style={{ width: "33%" }}>
                  เวลา
                </th>
                <th className="table-center" style={{ width: "33%" }}>
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody>
              {medication &&
              medication.filter((med) => med.from === selectuser._id).length >
                0 ? (
                medication
                  .filter((med) => med.from === selectuser._id)
                  .map((med, index) => (
                    <tr key={index}>
                      <td className="table-center" style={{ width: "33%" }}>
                        {med.date}
                      </td>
                      <td className="table-center" style={{ width: "33%" }}>
                        {med.time}
                      </td>
                      <td className="table-center" style={{ width: "33%" }}>
                        {renderStatusButton(med.status)}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={3} className="table-center" style={{ width: "100%" }}>
                    ไม่มีข้อมูลการกินยา
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Medication;
