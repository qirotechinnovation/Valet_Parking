import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Hero from "./components/Hero";
import LoginCard from "./components/LoginCard";
import Dashboard from "./components/admin_dashboard/Dashboard";

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
        <Route path="/" element={<LoginPage />} />

        <Route path="/admin-dashboard" element={<Dashboard />} />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;