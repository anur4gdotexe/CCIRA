import {BrowserRouter,Routes,Route,Navigate,useLocation} from "react-router-dom";

import Home from "./pages/Home";
import SubmitComplaint from "./pages/SubmitComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import TrackComplaint from "./pages/TrackComplaint";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  // const { isAuthenticated } = useAuth();
  // const location = useLocation();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  // }

  return children;
}

function AdminRoute({ children }) {
  // const { isAuthenticated, user } = useAuth();
  // const location = useLocation();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  // }

  // if (user?.role !== "admin" && user?.role !== "officer") {
  //   return <Navigate to="/" replace />;
  // }

  return children;
}

function App() {

  return (
    
  <BrowserRouter>

   <Routes>

    <Route path="/" element={<Home/>}/>

    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route path="/submit" element={<ProtectedRoute><SubmitComplaint/></ProtectedRoute>}/>

      <Route path="/track" element={<TrackComplaint/>}/>

      <Route path="/admin" element={<AdminRoute><AdminDashboard/></AdminRoute>}/>

   </Routes>

  </BrowserRouter>
  )
}

export default App