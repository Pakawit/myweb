import "./Navigation.css";
import React, { useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Nav, Navbar } from "react-bootstrap";
import { AppContext } from "../context/appContext";
import { useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "../services/appApi";
import { deleteUsers } from "../features/usersSlice";
import { deleteMedication } from "../features/medicationSlice";
import { deleteMessage } from "../features/messageSlice";

function Navigation() {
  const user = useSelector((state) => state.user);
  const [logoutUser] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const { setMember } = useContext(AppContext);
  const navigate = useNavigate();

  async function back() {
    await setMember([]);
    await dispatch(deleteMedication());
    await dispatch(deleteMessage());    
    await navigate("/");
  }

  async function handleLogout(e) {
    e.preventDefault();
    await dispatch(deleteUsers());
    await setMember([]);
    await dispatch(deleteMedication());
    await dispatch(deleteMessage());  
    await logoutUser(user);  
  }
  

  return (
    <div>
      <Navbar>
        <Container>
          <Nav.Link onClick={back}>
            <i className="bi bi-chevron-left"></i>
          </Nav.Link>
          <Nav className="ms-autoNav">
            <Nav.Link className="nav-link-with-badge ">
              <i className="bi bi-bell"></i>
            </Nav.Link>
            <Nav.Link onClick={handleLogout}>
              <i className="bi bi-box-arrow-in-right"></i>
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
}

export default Navigation;
