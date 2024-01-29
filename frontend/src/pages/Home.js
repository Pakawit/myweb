import { Container,Row,Col } from "react-bootstrap"
import Sidebar from "../components/Sidebar"
import Navigation from "../components/Navigation";

function Home() {

  return (
    <Container>
      <Navigation />
      <Row>
        <Col><Sidebar/></Col>
      </Row>
    </Container>
  )
}

export default Home