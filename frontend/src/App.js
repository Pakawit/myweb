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

  return (
    <AppContext.Provider value={{ member, setMember }}>
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
      </BrowserRouter>z
    </AppContext.Provider>
  );
}

export default App;
