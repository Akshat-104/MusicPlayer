import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login";
import LandingPage from "./Pages/LandingPage";
import DashBoard from "./Pages/DashBoard";

function App() {
  const token = localStorage.getItem("token");
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/dashboard" element={token ? <DashBoard/> : <Navigate to={"/"}/>}/>
      </Routes>
    </Router>
  );
}

export default App;