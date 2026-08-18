import Hero from "./components/Hero";
import LoginCard from "./components/LoginCard";
import Dashboard from "./components/admin_dashboard/Dashboard";
import "./App.css";

function App() {
  // return (
  //   <main className="app">
  //     <section className="hero-section">
  //       <Hero />
  //     </section>

  //     <section className="login-section">
  //       <LoginCard />
  //     </section>
  //   </main>
  // );

  return <Dashboard />;
}

export default App;