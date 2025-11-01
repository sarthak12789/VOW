import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import FlowProtectedRoute from "./FlowProtectedRoute";
import RouteWatcher from "./RouteWatcher";

import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./components/signup";
import ForgotPassword from "./components/forgotpassword";
import VerifyOtp from "./pages/verifyotp";
import ResetPassword from "./pages/resetpassword";
import ResetSuccess from "./pages/resetsuccess";
import Dashboard from "./pages/dashboard";
import ProfilePage from "./pages/profile/ProfilePage";
import Map from "./components/map/Map";
import ChatApp from "./components/chat/chat";
import TermsAndConditions from "./components/terms and conditions";
import ApiTester from "./pages/ApiTester";

const App = () => {

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const signupDoneRaw = !!localStorage.getItem("signupDone");
  const forgotRequested = !!localStorage.getItem("forgotRequested");

  const signupDone = isLoggedIn && !forgotRequested ? false : signupDoneRaw;

  const verifyCondition = !isLoggedIn || (signupDone || forgotRequested);
  const verifyRedirectTo = isLoggedIn 
    ? "/"
    : signupDone
    ? "/signup"
    : "/forgot-password";

  return (
    <Router>
      <RouteWatcher />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
        <Route path="/apitester" element={<ApiTester />} />
        <Route
          path="/verify-otp"
          element={
            <FlowProtectedRoute
              condition={verifyCondition}
              redirectTo={verifyRedirectTo}
            >
              <VerifyOtp />
            </FlowProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <FlowProtectedRoute
              condition={!!localStorage.getItem("forgotOtpVerified")}
              redirectTo="/forgot-password"
            >
              <ResetPassword />
            </FlowProtectedRoute>
          }
        />
        <Route
          path="/reset-success"
          element={
            <FlowProtectedRoute
              condition={!!localStorage.getItem("resetDone")}
              redirectTo="/login"
            >
              <ResetSuccess />
            </FlowProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
                <FlowProtectedRoute
                  // allow when session flag set by dashboard button
                  condition={sessionStorage.getItem("allowMap") === "true"}
                  redirectTo="/dashboard"
                >
                  <Map />
                </FlowProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
              <ChatApp username="UserB" roomId="room1" />
          }
        />
        <Route
          path="/"
          element={
            
              <Home />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
