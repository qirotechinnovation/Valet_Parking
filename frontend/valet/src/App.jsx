import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Hero from "./components/Hero";
import LoginCard from "./components/LoginCard";

import Dashboard from "./components/admin_dashboard/Dashboard";
import ParkingAdminDashboard from "./components/parkingAdmin/ParkingAdminDashboard";
import ReceptionDashboard from "./components/reception/ReceptionDashboard";

import "./App.css";


function LoginPage() {
  return (
    <main className="app">

      <section className="hero-section">
        <Hero />
      </section>

      <section className="login-section">
        <LoginCard />
      </section>

    </main>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN / LANDING PAGE */}
        <Route
          path="/"
          element={<LoginPage />}
        />

        {/* SUPER ADMIN DASHBOARD */}
        <Route
          path="/admin-dashboard"
          element={<Dashboard />}
        />

        {/* PARKING ADMIN DASHBOARD */}
        <Route
          path="/parking-admin-dashboard"
          element={<ParkingAdminDashboard />}
        />

        {/* RECEPTION DASHBOARD */}
        <Route
          path="/reception-dashboard"
          element={<ReceptionDashboard />}
        />

        {/* UNKNOWN ROUTE */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;