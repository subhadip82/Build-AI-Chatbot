var typed = new Typed('.neon-heading', {
  strings: ['Welcome Dip Chat Bot'],
  typeSpeed: 50,
  backSpeed: 100,
  backDelay: 1000,
  loop: true
});

document.getElementById('startBtn').addEventListener('click', () => {
  window.location.href = 'main.html'; // Replace with your actual chatbot page
});


