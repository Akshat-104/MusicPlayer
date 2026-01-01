import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login";
import LandingPage from "./Pages/LandingPage";
import DashBoard from "./Pages/DashBoard";
import CreatePlaylist from "./Pages/CreatePlaylist";
import ShowPlaylist from "./Pages/ShowPlaylist";
import PlaylistPage from "./Pages/PlaylistPage";

function App() {
  const token = localStorage.getItem("token");
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/dashboard" element={token ? <DashBoard/> : <Navigate to={"/"}/>}/>
        <Route path="/createplaylist" element={token ? <CreatePlaylist/> : <Navigate to={"/"}/>}/>
        <Route path="/showplaylist" element={token ? <ShowPlaylist/> : <Navigate to={"/"}/>}/>
        <Route path="/playlist/:id" element={token ? <PlaylistPage/> : <Navigate to={"/"}/>}/>
      </Routes>
    </Router>
  );
}

export default App;