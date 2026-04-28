import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import FeaturesSection from '../components/FeaturesSection'
import Footer from '../components/Footer'

export default function Index(){
  return (
    <div>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}
