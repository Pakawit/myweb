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
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setEstimation } from "../features/estimationSlice";

function Estimation() {
  const [hfsLevel, setHfsLevel] = useState(0);
  const user = useSelector((state) => state.user);
  // const [selectedFile, setSelectedFile] = useState(null);
  const { member } = useContext(AppContext);
  const estimation = useSelector((state) => state.estimation);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!member._id) {
      navigate("/");
    }
    const fetchData = async () => {
      try {
        const res = await axios.post("http://localhost:5001/getestimation", {
          _id: member._id,
        });
        dispatch(setEstimation(res.data));
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  });

  async function handleSubmit(_id) {
    try {
      const res = await axios.put("http://localhost:5001/editestimation", {
        _id: _id,
        hfsLevel: hfsLevel,
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }

  // async function handleUploadPhoto(_id) {
  //   try {
  //     const formData = new FormData();
  //     formData.append('photo', selectedFile);
  //     formData.append('_id', _id);

  //     const res = await axios.post("http://localhost:5001/uploadphoto", formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     });
  //     console.log(res);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // function handleFileChange(event) {
  //   setSelectedFile(event.target.files[0]);
  // }

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
                estimation.map((est, index) => (
                  <tr key={est._id}>
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
                      {/* <input type="file" onChange={handleFileChange} />
                  <Button variant="outline-primary" onClick={() => handleUploadPhoto(est._id)}>อัปโหลดรูปภาพ</Button> */}
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
