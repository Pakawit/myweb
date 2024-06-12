import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Dropdown,
  Modal,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import axios from "axios";
//import { setEstimation } from "../features/estimationSlice";

function Estimation() {
  const [hfsLevel, setHfsLevel] = useState(0);
  const { API_BASE_URL } = useContext(AppContext);
  const estimation = useSelector((state) => state.estimation);
  const selectuser = useSelector((state) => state.selectuser);
  //const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // useEffect(() => {
  //   const fetchEstimation = async () => {
  //     try {
  //       const response = await axios.post(`${API_BASE_URL}/getestimation`, {
  //         _id: selectuser._id,
  //       });
  //       if (response.data) {
  //         dispatch(setEstimation(response.data));
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch estimation data:", error);
  //     }
  //   };

  //   fetchEstimation();
  // }, [selectuser._id, API_BASE_URL, dispatch]);

  async function handleSubmit(_id) {
    try {
      await axios.put(`${API_BASE_URL}/editestimation`, {
        _id: _id,
        hfsLevel: hfsLevel,
      });
    } catch (err) {
      console.log(err);
    }
  }

  const handleShowModal = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

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
              {estimation &&
                estimation
                  .filter((est) => est.from === selectuser._id)
                  .map((est, index) => (
                    <tr key={index}>
                      <td className="table-center">{est.date}</td>
                      <td className="table-center">{est.time}</td>
                      <td className="table-center">
                        {est.photos &&
                          est.photos.map((photo, photoIndex) => (
                            <img
                              key={photoIndex}
                              src={`data:image/jpeg;base64,${photo}`}
                              alt={`รูปภาพ ${photoIndex}`}
                              style={{
                                width: "100px",
                                height: "100px",
                                marginRight: "10px",
                                cursor: "pointer",
                              }}
                              onClick={() => handleShowModal(photo)}
                            />
                          ))}
                      </td>
                      <td className="table-center">{est.painLevel}</td>
                      <td className="table-center">
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="outline-success"
                            id="dropdown-basic"
                          >
                            ระดับที่ {hfsLevel}
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            {[0, 1, 2, 3].map((level) => (
                              <Dropdown.Item
                                key={level}
                                onClick={() => setHfsLevel(level)}
                              >
                                ระดับที่ {level}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                      <td>
                        <Button
                          variant="outline-success"
                          onClick={() => handleSubmit(est._id)}
                        >
                          แจ้งผู้ป่วย
                        </Button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="รูปภาพ"
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "80vh",
                margin: "auto",
                display: "block",
              }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Estimation;
