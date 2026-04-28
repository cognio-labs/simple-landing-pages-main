import React from 'react'

export default function Navbar(){
  return (
    <header className="nav glass">
      <div className="container nav-inner">
        <a className="brand" href="#">Nimbus</a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#pricing" className="btn small">Get Started</a>
        </nav>
      </div>
    </header>
  )
}
