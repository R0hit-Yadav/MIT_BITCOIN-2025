import { useState,useEffect } from "react";
import "./Home.css";

export default function Home() {

  useEffect(() => {
    // Initialize particles
    createParticles();

    // Reveal animations on scroll
    const scrollElements = document.querySelectorAll(".reveal");
    const elementInView = (el, dividend = 1) => {
      const elementTop = el.getBoundingClientRect().top;
      return elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend;
    };

    const displayScrollElement = (element) => {
      element.classList.add("active");
    };

    const hideScrollElement = (element) => {
      element.classList.remove("active");
    };

    const handleScrollAnimation = () => {
      scrollElements.forEach((el) => {
        if (elementInView(el, 1.25)) {
          displayScrollElement(el);
        } else {
          hideScrollElement(el);
        }
      });
    };

    // Initialize scroll animation
    handleScrollAnimation();

    // Add scroll event listener
    window.addEventListener("scroll", () => {
      handleScrollAnimation();

      // Show/hide scroll-top button
      const scrollButton = document.querySelector(".scroll-top");
      if (window.scrollY > 500) {
        scrollButton.classList.add("visible");
      } else {
        scrollButton.classList.remove("visible");
      }
    });

    // Scroll to top button
    const scrollTopButton = document.querySelector(".scroll-top");
    if (scrollTopButton) {
      scrollTopButton.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }

    // Add visible class to feature cards
    const featureCards = document.querySelectorAll(".feature-card");
    setTimeout(() => {
      featureCards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add("visible");
        }, 100 * index);
      });
    }, 500);

    // Add visible class to stat items
    const statItems = document.querySelectorAll(".stat-item");
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.5 });

    statItems.forEach((item) => {
      statObserver.observe(item);
    });

    // Add visible class to CTA section
    const ctaContent = document.querySelector(".cta-content");
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.3 });

    if (ctaContent) {
      ctaObserver.observe(ctaContent);
    }

    // Create particles
    function createParticles() {
      const particlesContainer = document.querySelector(".particles-container");
      if (!particlesContainer) return;

      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;

        // Random size
        const size = Math.random() * 5 + 1;

        // Random speed
        const speedX = Math.random() * 0.5 - 0.25;
        const speedY = Math.random() * 0.5 - 0.25;

        // Random opacity
        const opacity = Math.random() * 0.5 + 0.1;

        // Apply styles
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = opacity;

        // Add to container
        particlesContainer.appendChild(particle);

        // Animate particle
        animateParticle(particle, posX, posY, speedX, speedY);
      }
    }

    function animateParticle(particle, posX, posY, speedX, speedY) {
      let x = posX;
      let y = posY;

      const animate = () => {
        x += speedX;
        y += speedY;

        // Boundary check
        if (x < 0 || x > 100) speedX *= -1;
        if (y < 0 || y > 100) speedY *= -1;

        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;

        requestAnimationFrame(animate);
      };

      animate();
    }
  }, []);
  return (
    <div className="app-container">
    <div className="main-content">
    <div className="hero-card">
      <div className="hero-text">
        <h1>
          <span className="gradient-text">VaultX</span>
          <br />
          <span className="gradient-text"></span>
        </h1>
        
        <div className="hero-description">
          <p>Secure, fast, and easy-to-use Platform for your Ethereum assets</p>
        </div>
        
        <div className="hero-buttons">
          <button className="primary-btn">Get Started</button>
          <button className="secondary-btn">Learn More</button>
        </div>
      </div>
      
      <div className="hero-graphic">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" className="eth-logo">
          <path d="M200 25L50 200L200 275L350 200L200 25Z" fill="#0ea5e9" />
          <path d="M200 25V275L350 200L200 25Z" fill="#6b21a8" fillOpacity="0.5" />
          <path d="M200 300L50 225L200 375L350 225L200 300Z" fill="#0ea5e9" />
          <path d="M200 300V375L350 225L200 300Z" fill="#6b21a8" fillOpacity="0.5" />
          <path d="M200 150L50 200L200 275L350 200L200 150Z" fill="white" fillOpacity="0.15" />
        </svg>
      </div>
    </div>

    <section className="features-section">
      <h2>Key Features</h2>
      <div className="cards-container">
        <div className="feature-card" onClick={() => window.location.href = '/balance'}>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M16 12h4" />
              <circle cx="16" cy="12" r="1" />
            </svg>
          </div>
          <h3>Wallet</h3>
          <p>Check your balance and manage your Ethereum assets</p>
        </div>

        <div className="feature-card" onClick={() => window.location.href = '/send'}>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 14l-5-5-5 5" />
              <path d="M12 9v12" />
              <path d="M20 3H4" />
              <path d="M8 3V7" />
              <path d="M16 3V7" />
            </svg>
          </div>
          <h3>Transactions</h3>
          <p>View your transaction history and pending transactions</p>
        </div>

        <div className="feature-card" onClick={() => window.location.href = '/history'}>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16l-4-4 4-4" />
              <path d="M3 12h18" />
              <path d="M17 8l4 4-4 4" />
            </svg>
          </div>
          <h3>History</h3>
          <p>Track your transaction history</p>
        </div>

        <div className="feature-card" onClick={() => window.location.href = '/crypto'}>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7h-9l-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
              <path d="M12 14.5L7 12l5-2.5L17 12l-5 2.5z" />
            </svg>
          </div>
          <h3>Crypto info</h3>
          <p>Improve your crypto knowledge</p>
        </div>
      </div>
    </section>

    <section className="stats-section">
      <div className="stat-item">
        <h3>5M+</h3>
        <p>Active Users</p>
      </div>
      <div className="stat-item">
        <h3>$10B+</h3>
        <p>Assets Managed</p>
      </div>
      <div className="stat-item">
        <h3>100K+</h3>
        <p>Daily Transactions</p>
      </div>
    </section>

    <section className="cta-section">
      <h2>Ready to Get Started?</h2>
      <p>Create your wallet in seconds and start managing your Ethereum assets</p>
      <button className="connect-button">Launch App</button>
    </section>
  </div>

  <footer className="footer">
    <p>&copy; 2025 VaultX. All rights reserved.</p>
    <div className="footer-links">
      <a href="/about">About</a>
      <a href="/send">Transaction</a>
      <a href="/history">History</a>
      <a href="/contact">Contact</a>
    </div>
  </footer>
</div>
  );
}