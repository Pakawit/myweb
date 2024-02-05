import "./App.css";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Personal from "./pages/Personal";
import { useState } from "react";
import { AppContext, socket } from "./context/appContext";

function App() {
  const user = useSelector((state) => state.user);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState([]);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [privateMemberMsg, setPrivateMemberMsg] = useState({});
  const [newMessages, setNewMessages] = useState({});

  return (
    <AppContext.Provider
      value={{
        socket,
        currentRoom,
        setCurrentRoom,
        members,
        setMembers,
        messages,
        setMessages,
        privateMemberMsg,
        setPrivateMemberMsg,
        rooms,
        setRooms,
        newMessages,
        setNewMessages,
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* Check if the user is not logged in */}
          {!user ? (
            <>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* Redirect to Login if user tries to access Home or Chat */}
              <Route
                path="/home"
                element={<Navigate to="/" replace />}
              />
              <Route
                path="/chat"
                element={<Navigate to="/" replace />}
              />
                            <Route
                path="/personal"
                element={<Navigate to="/" replace />}
              />
            </>
          ) : (
            <>
              {/* Redirect to Home if user is logged in */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/personal" element={<Personal />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
