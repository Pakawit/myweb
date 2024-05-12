import "./App.css";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AppContext } from "./context/appContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Personal from "./pages/Personal";
import Medication from "./pages/Medication";
import Estimation from "./pages/Estimation";

function App() {
  const user = useSelector((state) => state.user);
  const [member, setMember] = useState([]);
  const API_BASE_URL = "http://localhost:5001";

  return (
    <AppContext.Provider value={{ member, setMember, API_BASE_URL}}>
      <BrowserRouter>
        <Routes>
          {!user ? (
            <Route path="/*" element={<Login />} />
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/personal" element={<Personal />} />
              <Route path="/medication" element={<Medication />} />
              <Route path="/estimation" element={<Estimation />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
