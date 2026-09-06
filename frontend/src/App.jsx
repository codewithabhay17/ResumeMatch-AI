import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Onboarding & Loading
import Onboarding from "./pages/Onboarding";
import AnalysisLoading from "./pages/AnalysisLoading";

// Protected pages
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeList from "./pages/ResumeList";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import MatchAudit from "./pages/MatchAudit";
import MatchAuditReport from "./pages/MatchAuditReport";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================= */}

          {/* Landing page - root */}
          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />


          {/* =========================
              PROTECTED ROUTES
          ========================= */}

          <Route element={<ProtectedRoute />}>

            {/* Onboarding flow — no sidebar Layout */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/analysis-loading" element={<AnalysisLoading />} />

            {/* Main app with sidebar Layout */}
            <Route element={<Layout />}>

              <Route path="/dashboard" element={<Dashboard />} />

              {/* Resume routes — support both URL patterns */}
              <Route path="/resumes" element={<ResumeList />} />
              <Route path="/resume-upload" element={<ResumeUpload />} />
              <Route path="/resume/upload" element={<ResumeUpload />} />
              <Route path="/resumes/:id" element={<ResumeAnalysis />} />
              <Route path="/resume/:id" element={<ResumeAnalysis />} />

              {/* Job routes */}
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />

              {/* Match / Audit routes */}
              <Route path="/matches/:id" element={<MatchAudit />} />
              <Route path="/job-match/:id" element={<MatchAuditReport />} />

              {/* Profile & Settings */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

            </Route>

          </Route>


          {/* =========================
              FALLBACK / 404
          ========================= */}

          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;