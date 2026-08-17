import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

function Hero() {
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.from(".brand", {
        opacity: 0,
        y: -20,
        duration: 0.7,
      })

        // Main heading
        .from(
          ".hero-word",
          {
            opacity: 0,
            y: 45,
            filter: "blur(8px)",
            duration: 0.7,
            stagger: 0.09,
          },
          "-=0.25"
        )

        // Description
        .from(
          ".hero-description",
          {
            opacity: 0,
            y: 25,
            duration: 0.7,
          },
          "-=0.35"
        )

        // Feature cards
        .from(
          ".feature",
          {
            opacity: 0,
            y: 25,
            duration: 0.55,
            stagger: 0.12,
          },
          "-=0.25"
        )

        // Copyright
        .from(
          ".copyright",
          {
            opacity: 0,
            duration: 0.5,
          },
          "-=0.2"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="hero" ref={heroRef}>

      {/* Brand */}
      <div className="brand">
        <div className="brand-logo">A</div>

        <div>
          <h2>AURA</h2>
          <span>VALET PARKING</span>
        </div>
      </div>

      {/* Hero Content */}
      <div className="hero-content">

        <h1>
          <span className="hero-line">
            <span className="hero-word">Elevate</span>{" "}
            <span className="hero-word">Your</span>{" "}
            <span className="hero-word">Arrival.</span>
          </span>

          <br />

          <span className="hero-line">
            <span className="hero-word">We</span>{" "}
            <span className="hero-word">Refine</span>{" "}
            <span className="hero-word purple-text">the</span>{" "}
            <span className="hero-word purple-text">Journey.</span>
          </span>
        </h1>

        <p className="hero-description">
          A seamless and sophisticated valet experience
          <br />
          from check-in to checkout.
          <br />
          Your vehicle is safe in our hands.
        </p>
        
      </div>

      <div className="copyright">
        © 2026 Aura Valet Parking. All rights reserved.
      </div>

    </div>
  );
}

export default Hero;