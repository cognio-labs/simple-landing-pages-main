import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import Footer from './components/Footer'

export default function App(){
  return (
    <div className="app-root">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}
