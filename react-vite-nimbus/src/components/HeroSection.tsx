import React from 'react'

export default function HeroSection(){
  return (
    <section className="hero-section">
      <div className="container hero-inner">
        <div className="hero-copy glass">
          <h1>Design. Ship. Grow — Landing pages that convert.</h1>
          <p className="lead">Nimbus gives product teams a fast, designer-first experience to create high-converting landing pages with instant publishing and built-in performance.</p>
          <div className="cta-row">
            <a className="btn primary" href="#features">Start Free — No Card</a>
            <a className="btn ghost" href="#about">How it works</a>
          </div>
        </div>
        <div className="hero-visual glass">
          <div className="visual-card">
            <div className="visual-header">Editor Preview</div>
            <div className="visual-body">
              <div className="v-line" />
              <div className="v-line short" />
              <div className="v-line" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
