import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";

// Import dashboard components
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import TutorDashboard from "./pages/dashboard/TutorDashboard";
import CoordDashboard from "./pages/dashboard/CoordDashboard";
import ClientDashboard from "./pages/dashboard/ClientDashboard";

import "./App.css";
import MessagePage from "./pages/MessagePage";

// Import Higher-Order Component for role protection
import withRoleProtection from "./pages/components/withRoleProtection";

import "./styles/hoverbar.css";

function App() {
  // Wrap dashboards with role protection
  const ProtectedAdminDashboard = withRoleProtection(AdminDashboard, ["admin"]);
  const ProtectedStudentDashboard = withRoleProtection(StudentDashboard, [
    "student",
  ]);
  const ProtectedTutorDashboard = withRoleProtection(TutorDashboard, ["tutor"]);
  const ProtectedCoordDashboard = withRoleProtection(CoordDashboard, [
    "coordinator",
  ]);
  const ProtectedClientDashboard = withRoleProtection(ClientDashboard, [
    "client",
  ]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect from root to Home */}
          <Route path="/" element={<Navigate to="/Home" replace />} />
          {/* Home page route */}
          <Route path="Home" element={<Home />} />
          {/* Dashboard routes for different roles */}
          <Route path="admin/dashboard" element={<ProtectedAdminDashboard />} />
          <Route
            path="student/dashboard"
            element={<ProtectedStudentDashboard />}
          />
          <Route path="tutor/dashboard" element={<ProtectedTutorDashboard />} />
          <Route
            path="coordinator/dashboard"
            element={<ProtectedCoordDashboard />}
          />
          <Route
            path="client/dashboard"
            element={<ProtectedClientDashboard />}
          />
          {/* Message page route */}
          <Route path="/MessagePage" element={<MessagePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
