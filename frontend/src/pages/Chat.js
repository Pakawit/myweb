import { Container,Row,Col } from "react-bootstrap"
import MessageForm from "../components/MessageForm"
import Navigation from "../components/Navigation";

function Chat() {
  
  return (
    <Container>
      <Navigation />
      <Row>
        <Col><MessageForm/></Col>
      </Row>
    </Container>
  )
}

export default Chat