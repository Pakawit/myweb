import "./Navigation.css";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { AppContext } from "../context/appContext";
import { useNavigate } from "react-router-dom";
import { deleteUsers } from "../features/usersSlice";
import { deleteMedication } from "../features/medicationSlice";
import { deleteMessage } from "../features/messageSlice";
import { deleteEstimation } from "../features/estimationSlice";
import { deleteUser } from "../features/userSlice";

function Navigation() {
  const dispatch = useDispatch();
  const { setMember } = useContext(AppContext);
  const navigate = useNavigate();

  async function back() {
    await navigate("/");
    await setMember([]);
    await dispatch(deleteMedication());
    await dispatch(deleteMessage());
    await dispatch(deleteEstimation());
  }

  async function handleLogout(e) {
    e.preventDefault();
    await dispatch(deleteUsers());
    await setMember([]);
    await dispatch(deleteMedication());
    await dispatch(deleteMessage());
    await dispatch(deleteEstimation());
    await dispatch(deleteUser());
  }

  return (
    <div>
      <Navbar>
        <Container>
            <Button variant="outline-dark" onClick={back}><i className="bi bi-chevron-left"></i></Button>
          <Nav className="ms-autoNav">
              <Button variant="outline-dark" className="mx-1"><i className="bi bi-bell" ></i></Button>
              <Button variant="outline-dark" onClick={handleLogout} ><i className="bi bi-box-arrow-in-right"></i></Button>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
}

export default Navigation;