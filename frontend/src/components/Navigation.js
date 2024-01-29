import React, { useEffect, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useLogoutUserMutation } from "../services/appApi";
import { resetNotifications } from "../features/userSlice";
import { AppContext } from "../context/appContext";
import "./Navigation.css"; // Import your CSS file for styling (you can create this file)


function Navigation() {
  const user = useSelector((state) => state.user);
  const [logoutUser] = useLogoutUserMutation();
  const notifications = useSelector((state) => state.user.newMessages);
  const dispatch = useDispatch();
  const { socket, currentRoom, messages } = useContext(AppContext);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    // Update showBadge state based on the number of notifications
    setShowBadge(Object.keys(notifications).length > 0);
  }, [socket, notifications, messages ]);

  function back() {
    dispatch(resetNotifications(currentRoom));
    window.location.replace("/");
  }

  async function handleLogout(e) {
    e.preventDefault();
    await logoutUser(user);

  }

  return (
    <div>
      <Navbar  >
        <Container>
          <Nav.Link onClick={back}>
            <i className="bi bi-chevron-left"></i>
          </Nav.Link>
              <Nav className="ms-autoNav">
              <Nav.Link className="nav-link-with-badge ">
                <i className="bi bi-bell"></i>
                {showBadge && <span className="notification-count">{Object.keys(notifications).length}</span>}
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
