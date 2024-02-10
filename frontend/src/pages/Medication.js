import React from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Navigation from "../components/Navigation";


function Medication() {

  return (
    <Container>
      <Navigation />
      <Row>
        <h1>รายละเอียดการกินยา</h1>
        <Col>
          <Table>
            <thead>
              <tr>
                <th className="table-center"style={{ width: '33%' }}>วัน/เดือน/ปี</th>
                <th className="table-center"style={{ width: '33%' }}>เวลา</th>
                <th className="table-center"style={{ width: '33%' }}>สถานะ</th>
              </tr>
            </thead>
            <tbody>
            <tr>
                  <td className="table-center"style={{ width: '33%' }}>{"1/01/2544"}</td>
                  <td className="table-center"style={{ width: '33%' }}>{"11.11"}</td>
                  <td className="table-center"style={{ width: '33%' }}>{0}</td>
            </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  )
}

export default Medication;
