import "./App.css";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppContext } from "./context/appContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Personal from "./pages/Personal";
import Medication from "./pages/Medication";
import Estimation from "./pages/Estimation";
import Handbook from "./pages/Handbook";
import Log from "./pages/Log";

function App() {
  const admin = useSelector((state) => state.admin);
  const API_BASE_URL = "http://localhost:4452";

  return (
    <AppContext.Provider value={{ API_BASE_URL }}>
      <BrowserRouter>
        <Routes>
          {!admin ? (
            <>
              <Route path="/*" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
              <Route path="/handbook" element={<Handbook />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/personal" element={<Personal />} />
              <Route path="/medication" element={<Medication />} />
              <Route path="/estimation" element={<Estimation />} />
              <Route path="/log" element={<Log />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;