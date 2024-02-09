import React from "react";
import { Container, Row, Col, Table,Button } from "react-bootstrap";
import Navigation from "../components/Navigation";


function Estimate() {

  return (
    <Container>
      <Navigation />
      <Row>
        <h1>การประเมินอาการ HFS</h1>
        <Col>
          <Table>
            <thead>
              <tr>
                <th>วัน/เดือน/ปี</th>
                <th>เวลา</th>
                <th>รูป</th>
                <th>ระดับความเจ็บปวด</th>
                <th>การประเมินอาการ HFS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
            <tr>
                  <td>{"1/01/2544"}</td>
                  <td>{"11.11"}</td>
                  <td></td>
                  <td>{0}</td>
                  <td></td>
                  <td><Button>แจ้งผู้ป่วย</Button></td>
            </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  )
}

export default Estimate;
