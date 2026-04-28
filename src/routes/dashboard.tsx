import React from 'react'

export const Route = {
  // placeholder to match TanStack Router expectations in generated file
}

export default function Dashboard(){
  return (
    <div style={{padding:32}}>
      <h1>Dashboard</h1>
      <p>Welcome to your Nimbus dashboard — an overview of sites, analytics, and recent activity.</p>
      <section style={{marginTop:24}}>
        <h2>Quick Stats</h2>
        <ul>
          <li>Active Sites: 12</li>
          <li>Monthly Visits: 48,321</li>
          <li>Published Pages: 84</li>
        </ul>
      </section>
    </div>
  )
}
