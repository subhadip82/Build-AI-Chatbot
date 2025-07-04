// text animetion 
var typed = new Typed('.neon-heading', {
  strings: ['Hii There<br>Welcome Dip Chat Bot'],
  typeSpeed: 50,
  backSpeed: 100,
  backDelay: 1000,
  loop: true
});

// transfrom to main page
document.getElementById('startBtn').addEventListener('click', () => {
  window.location.href = 'main.html'; // Replace with your actual chatbot page
});


