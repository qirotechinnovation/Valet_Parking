import Hero from "./components/Hero";
import LoginCard from "./components/LoginCard";
import "./App.css";

function App() {
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

export default App;