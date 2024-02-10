import React , {useState} from "react";
import { Container, Row, Col, Table, Button, Dropdown } from "react-bootstrap";
import Navigation from "../components/Navigation";

function Estimation() {
  const [hfsLevel, setHfslevel] = useState(0);

  return (
    <Container>
      <Navigation />
      <Row>
        <h1>การประเมินอาการ HFS</h1>
        <Col>
          <Table>
            <thead>
              <tr>
                <th className="table-center">วัน/เดือน/ปี</th>
                <th className="table-center">เวลา</th>
                <th className="table-center">รูป</th>
                <th className="table-center">ระดับความเจ็บปวด</th>
                <th className="table-center">การประเมินอาการ HFS</th>
                <th className="table-center">{}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="table-center">{"1/01/2544"}</td>
                <td className="table-center">{"11.11"}</td>
                <td className="table-center">{}</td>
                <td className="table-center">{0}</td>
                <td className="table-center">
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-success" id="dropdown-basic">
                      ระดับที่ {hfsLevel}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setHfslevel(0)}>ระดับที่ 0</Dropdown.Item>
                      <Dropdown.Item onClick={() => setHfslevel(1)}>ระดับที่ 1</Dropdown.Item>
                      <Dropdown.Item onClick={() => setHfslevel(2)}>ระดับที่ 2</Dropdown.Item>
                      <Dropdown.Item onClick={() => setHfslevel(3)}>ระดับที่ 3</Dropdown.Item>
                      <Dropdown.Item onClick={() => setHfslevel(4)}>ระดับที่ 4</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
                <td>
                  <Button variant="outline-success">แจ้งผู้ป่วย</Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Estimation;
