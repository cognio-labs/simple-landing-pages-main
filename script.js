// Mobile nav toggle and smooth interactions
document.addEventListener('DOMContentLoaded', function(){
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const primary = document.getElementById('primaryCta');

  if(navToggle && navLinks){
    navToggle.addEventListener('click', ()=>{
      navLinks.classList.toggle('show');
      navToggle.setAttribute('aria-expanded', navLinks.classList.contains('show'))
    })
  }

  // Smooth scroll for internal anchors (polish for older browsers)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if(target){
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({top: y, behavior:'smooth'});
        // close mobile nav after click
        if(navLinks.classList.contains('show')) navLinks.classList.remove('show');
      }
    })
  })

  // Reveal elements on scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    })
  },{threshold:0.12});

  document.querySelectorAll('.feature, .about-card, .stat, .mockup').forEach(el=>observer.observe(el));

  // CTA micro-interaction: pulse on click
  if(primary){
    primary.addEventListener('click', (e)=>{
      primary.animate([
        {transform: 'scale(1)'},
        {transform: 'scale(0.98)'},
        {transform: 'scale(1)'}
      ],{duration:240,easing:'cubic-bezier(.2,.9,.3,1)'});
    })
  }
});
