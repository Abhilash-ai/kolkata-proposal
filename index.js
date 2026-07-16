/* -------------------------------------------------------------
 * Kolkata Travel Proposal Page Scripts
 * Interactive animations, runaway button, audio synth, and confetti
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  setupScrollAnimations();
  setupTrainProgressBar();
  setupRSVPInteractive();
  setupAudioSynth();
});

/* ==========================================
 * 1. Scroll-Triggered Animations (Fade In)
 * ========================================== */
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        obs.unobserve(entry.target); // Animates only once
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));
}

/* ==========================================
 * 2. Bottom Train Progress Bar
 * ========================================== */
function setupTrainProgressBar() {
  const trainAvatar = document.getElementById('train-avatar');
  const trainSmoke = trainAvatar.querySelector('.train-smoke');
  let scrollTimeout = null;
  
  let targetTrainPosition = 5;
  let currentTrainPosition = 5;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (docHeight <= 0) return;
    
    const scrollPercent = scrollTop / docHeight;
    // Map scroll percentage (0 to 1) to progress track boundary (5% to 95%)
    targetTrainPosition = 5 + (scrollPercent * 90);
    
    // Puff smoke while moving
    trainSmoke.style.opacity = '1';
    
    // Stop puffing smoke when scroll stops
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      trainSmoke.style.opacity = '0';
    }, 400);
  });

  // Butter-smooth interpolation loop
  function updateSmoothTrain() {
    const diff = targetTrainPosition - currentTrainPosition;
    currentTrainPosition += diff * 0.1; // Lerp rate: 10% movement per frame
    
    trainAvatar.style.left = `${currentTrainPosition}%`;
    requestAnimationFrame(updateSmoothTrain);
  }
  requestAnimationFrame(updateSmoothTrain);
}

/* ==========================================
 * 3. RSVP Interactive System
 * ========================================== */
function setupRSVPInteractive() {
  const btnAccept = document.getElementById('btn-accept');
  const btnDecline = document.getElementById('btn-decline');
  const rsvpDefaultState = document.getElementById('rsvp-default-state');
  const rsvpTicketState = document.getElementById('rsvp-ticket-state');
  const passengerCount = document.getElementById('passenger-count');
  const btnReset = document.getElementById('btn-reset');
  const guiltBubble = document.getElementById('guilt-bubble');
  const guiltText = document.getElementById('guilt-text');
  const rsvpCard = document.querySelector('.rsvp-card');

  let declineHoverCount = 0;
  const guiltMessages = [
    "Wait, are you sure? 🥺",
    "But... who will eat the wafers? 😭",
    "CEO department is crying... 💔",
    "Architect Sahab, please! 📐🥺",
    "Okay, I'll stop running... but please? 🥺👉👈"
  ];

  const rsvpStatusText = document.getElementById('rsvp-status-text');

  // Check LocalStorage on load
  const existingRSVP = localStorage.getItem('kolkata_rsvp');
  if (existingRSVP === 'accepted') {
    showTicket();
  }

  // Accept button handler
  btnAccept.addEventListener('click', () => {
    localStorage.setItem('kolkata_rsvp', 'accepted');
    triggerConfetti();
    playChime();
    showTicket();
  });

  // Reset button handler
  btnReset.addEventListener('click', () => {
    localStorage.removeItem('kolkata_rsvp');
    hideTicket();
  });

  function showTicket() {
    passengerCount.textContent = "2/2";
    if (rsvpStatusText) {
      rsvpStatusText.textContent = "Journey Confirmed! Wafers packed. 🚆❤️";
    }
    
    rsvpDefaultState.classList.add('hidden');
    rsvpTicketState.classList.remove('hidden');
    
    // Reset decline button position if it ran away
    btnDecline.style.transform = '';
    btnDecline.classList.remove('runaway');
    guiltBubble.classList.remove('show');
  }

  function hideTicket() {
    passengerCount.textContent = "1/2";
    if (rsvpStatusText) {
      rsvpStatusText.textContent = "Waiting for my favourite architect's decision. 🤭❤️";
    }
    
    rsvpTicketState.classList.add('hidden');
    rsvpDefaultState.classList.remove('hidden');
    
    // Reset counters
    declineHoverCount = 0;
  }

  /* --- Runaway Button Logic --- */
  
  // Track mouse coordinates to jump BEFORE cursor arrives (feels magical)
  document.addEventListener('mousemove', (e) => {
    if (rsvpDefaultState.classList.contains('hidden')) return;
    if (declineHoverCount >= 5) return; // Stop running away after 5 attempts

    const rect = btnDecline.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const distX = e.clientX - btnCenterX;
    const distY = e.clientY - btnCenterY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    // Trigger runaway if cursor is within 85px
    if (distance < 85) {
      runawayAction();
    }
  });

  // Mobile fallback (touching the button triggers runaway immediately)
  btnDecline.addEventListener('touchstart', (e) => {
    if (declineHoverCount < 5) {
      e.preventDefault(); // stop click event
      runawayAction();
    }
  });

  function runawayAction() {
    declineHoverCount++;
    
    btnDecline.classList.add('runaway');

    // Get boundaries of RSVP card
    const cardRect = rsvpCard.getBoundingClientRect();
    const btnRect = btnDecline.getBoundingClientRect();

    // Random safe offsets within the card padding limits
    const maxX = cardRect.width - btnRect.width - 40;
    const maxY = cardRect.height - btnRect.height - 40;

    const randomX = Math.max(20, Math.min(maxX, Math.random() * maxX));
    const randomY = Math.max(20, Math.min(maxY, Math.random() * maxY));

    // Position it absolutely relative to the rsvp-card container
    btnDecline.style.left = `${randomX}px`;
    btnDecline.style.top = `${randomY}px`;

    // Show guilt trip message bubble
    showGuiltTrip();
  }

  function showGuiltTrip() {
    const msgIndex = Math.min(declineHoverCount - 1, guiltMessages.length - 1);
    guiltText.textContent = guiltMessages[msgIndex];

    // Position the bubble above the decline button
    const btnRect = btnDecline.getBoundingClientRect();
    const cardRect = rsvpCard.getBoundingClientRect();

    const bubbleX = btnRect.left - cardRect.left + (btnRect.width / 2);
    const bubbleY = btnRect.top - cardRect.top - 60; // 60px above button

    guiltBubble.style.left = `${bubbleX}px`;
    guiltBubble.style.top = `${bubbleY}px`;
    guiltBubble.classList.add('show');
  }

  // Handle final click if they bypass the runaway (after 5 attempts)
  btnDecline.addEventListener('click', () => {
    if (declineHoverCount >= 5) {
      // Create a cute dramatic full screen guilt screen
      const dramaticOverlay = document.createElement('div');
      dramaticOverlay.className = 'dramatic-overlay';
      dramaticOverlay.innerHTML = `
        <div class="dramatic-content text-center">
          <div class="crying-emoji">😭💔</div>
          <h2>CEO Department Will Survive Alone...</h2>
          <p>The wafers will taste a bit saltier from tears. But it's okay... the train leaves anyway...</p>
          <button id="btn-regret" class="btn btn-primary" style="margin-top: 30px;">
            <span class="btn-content">Wait, let me change my mind! 🥺👉👈</span>
          </button>
        </div>
      `;
      document.body.appendChild(dramaticOverlay);
      
      // Style overlay dynamically to avoid CSS bloating
      Object.assign(dramaticOverlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: '#09070f',
        color: '#fff',
        zIndex: '10000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        animation: 'fade-slide-in 0.5s ease forwards'
      });

      const cryingEmoji = dramaticOverlay.querySelector('.crying-emoji');
      cryingEmoji.style.fontSize = '5rem';
      cryingEmoji.style.marginBottom = '20px';

      dramaticOverlay.querySelector('#btn-regret').addEventListener('click', () => {
        dramaticOverlay.remove();
        // Click accept instead!
        btnAccept.click();
      });
    }
  });
}

/* ==========================================
 * 4. Ambient Train Audio Synthesizer
 * ========================================== */
let audioCtx = null;
let chugInterval = null;
let isPlaying = false;

function setupAudioSynth() {
  const musicToggle = document.getElementById('music-toggle');

  musicToggle.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (isPlaying) {
      // Stop train sound
      clearInterval(chugInterval);
      musicToggle.querySelector('i').className = 'fa-solid fa-volume-xmark';
      musicToggle.querySelector('.btn-tooltip').textContent = 'Play Lo-fi Train Sounds 🎧';
      isPlaying = false;
    } else {
      // Start train sound
      audioCtx.resume();
      startTrainChug();
      musicToggle.querySelector('i').className = 'fa-solid fa-volume-high';
      musicToggle.querySelector('.btn-tooltip').textContent = 'Mute Sounds 🎧';
      isPlaying = true;
    }
  });
}

function startTrainChug() {
  let beat = 0;
  
  // Play rhythmic train "click-clack... click-clack" using white noise & low pass filters
  chugInterval = setInterval(() => {
    if (!audioCtx) return;

    // Beats 0 & 1 are "click-clack", beat 2 is silent, beat 3 is soft click
    if (beat === 0) {
      playTrainPuff(80, 0.08); // High puff
      setTimeout(() => playTrainPuff(60, 0.06), 120); // Quick follow clack
    } else if (beat === 1) {
      playTrainPuff(75, 0.08);
      setTimeout(() => playTrainPuff(55, 0.06), 120);
    } else if (beat === 3) {
      playTrainPuff(50, 0.05); // Soft track chug
    }

    beat = (beat + 1) % 4;
  }, 400); // Rhythmic chug-chug speed
}

// Generates a soft filtered noise puff resembling a steam/rail friction sound
function playTrainPuff(frequency, duration) {
  if (!audioCtx) return;

  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Fill buffer with random noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;

  // Filter noise to sound like a low rumbling chug
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  filter.Q.value = 1.5;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.04, audioCtx.currentTime); // very low ambient volume
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noiseNode.start();
}

// Success Chime chords
function playChime() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  audioCtx.resume();
  const now = audioCtx.currentTime;
  
  // Magical major pentatonic chord progression (Arpeggio)
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Major
  
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.08);
    
    gain.gain.setValueAtTime(0, now + index * 0.08);
    gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.8);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.8);
  });
}

/* ==========================================
 * 5. Lightweight Canvas Confetti Engine
 * ========================================== */
function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = ['#ff7e5f', '#feb47b', '#ff5e7e', '#ffe3b3', '#9c27b0', '#e5a93b'];
  const particles = [];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height - height, // start above screen
      r: Math.random() * 6 + 4,
      d: Math.random() * height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.random() * 0.05 + 0.02
    });
  }

  let animationFrameId;
  const start = Date.now();

  function draw() {
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    particles.forEach(p => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle) * 2;
      p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 15;

      if (p.y < height) {
        activeParticles++;
      }

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });

    // Run animation for 4.5 seconds or until particles clear
    if (Date.now() - start < 4500 && activeParticles > 0) {
      animationFrameId = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  }

  draw();
}
