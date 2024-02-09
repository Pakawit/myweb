import React from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Navigation from "../components/Navigation";


function Medicine() {

  return (
    <Container>
      <Navigation />
      <Row>
        <h1>รายละเอียดการกินยา</h1>
        <Col>
          <Table>
            <thead>
              <tr>
                <th>วัน/เดือน/ปี</th>
                <th>เวลา</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
            <tr>
                  <td>{"1/01/2544"}</td>
                  <td>{"11.11"}</td>
                  <td>{0}</td>
            </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  )
}

export default Medicine;
