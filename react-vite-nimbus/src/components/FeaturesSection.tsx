import React from 'react'

function FeatureCard({title,desc}:{title:string;desc:string}){
  return (
    <div className="feature-card glass">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  )
}

export default function FeaturesSection(){
  const features = [
    {title:'Visual Editor', desc:'Design pages with a live editor and reusable components.'},
    {title:'Built-in Performance', desc:'Automatic image optimization, CDN delivery, and fast builds.'},
    {title:'SEO & Analytics', desc:'SEO defaults, meta templates, and simple analytics.'},
  ]

  return (
    <section id="features" className="features-section section">
      <div className="container">
        <h2>Everything you need to convert visitors</h2>
        <p className="muted">Simple workflows and developer-friendly tooling to help teams ship landing pages faster.</p>
        <div className="features-grid">
          {features.map(f=> <FeatureCard key={f.title} title={f.title} desc={f.desc} />)}
        </div>
      </div>
    </section>
  )
}
