import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

function Hero() {
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".brand", { opacity: 0, y: -18, duration: 0.6 })
        .from(".hero-line", { opacity: 0, y: 24, duration: 0.7, stagger: 0.06 }, "-=0.25")
        .from(".hero-description", { opacity: 0, y: 20, duration: 0.6 }, "-=0.2")
        .from(".hero-visual", { opacity: 0, scale: 0.96, duration: 0.7 }, "-=0.15")
        .from(".hero-footer-note", { opacity: 0, y: 12, duration: 0.4 }, "-=0.2");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="hero" ref={heroRef}>
      <div className="brand">
        <div className="brand-logo-wrapper">
          <img src="/aura-logo.svg" alt="Aura Valet Parking" className="brand-logo" />
        </div>
        <div className="brand-text">
          <h2>AURA</h2>
          <span>VALET PARKING</span>
        </div>
      </div>

      <div className="hero-content">
        <span className="hero-eyebrow">Smart valet operating suite</span>
        <h1>
          <span className="hero-line">Smart Parking.</span>
          <span className="hero-line hero-gradient">Seamless Valet Operations.</span>
        </h1>

        <p className="hero-description">
          Manage vehicles, parking slots, valet assignments, retrieval requests and parking operations from one intelligent platform built for modern operations teams.
        </p>

        {/* <div className="hero-actions">
          <button type="button" className="primary-action">Get Started</button>
          <button type="button" className="secondary-action">Explore System</button>
        </div> */}
      </div>

      <div className="hero-visual" aria-label="Parking operations scene">
        <div className="visual-panel panel-main">
          <div className="panel-header-row">
            <span>Operations Live</span>
            <span className="live-pill">Live</span>
          </div>

          <div className="parking-grid">
            <span className="slot occupied">A-12</span>
            <span className="slot available">A-13</span>
            <span className="slot retrieval">A-14</span>
            <span className="slot reserved">A-15</span>
            <span className="slot available">B-04</span>
            <span className="slot occupied">B-05</span>
            <span className="slot ready">B-06</span>
            <span className="slot available">B-07</span>
          </div>
        </div>

        <div className="floating-card card-one">
          <span className="card-kicker">Vehicle in system</span>
          <strong>MH12AB1234</strong>
          <small>Assigned to slot A-12</small>
        </div>

        <div className="floating-card card-two">
          <span className="card-kicker">Retrieval queue</span>
          <strong>06 requests</strong>
          <small>2 valet teams active</small>
        </div>
      </div>

      <div className="hero-footer-note">A premium parking control center for staff, admins, and valet teams.</div>
    </div>
  );
}

export default Hero;