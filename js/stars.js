/* ============================================================
   Orbit New Tab — stars.js
   Animated starfield: twinkling stars, drift, shooting stars,
   subtle mouse parallax. Pauses when tab is hidden.
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('starfield');
  const ctx    = canvas.getContext('2d');

  const STAR_COUNT   = 220;
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let stars         = [];
  let shootingStars = [];
  let animationId   = null;
  let lastTime      = 0;
  let parallaxX     = 0;
  let parallaxY     = 0;
  let targetPX      = 0;
  let targetPY      = 0;

  /* ----------------------------------------------------------
     Helpers
  ---------------------------------------------------------- */
  function animSpeed() {
    return document.documentElement.dataset.animSpeed || 'normal';
  }

  function speedFactor() {
    return animSpeed() === 'slow' ? 0.45 : 1.0;
  }

  /* ----------------------------------------------------------
     Star class
  ---------------------------------------------------------- */
  class Star {
    constructor(randomX = true) {
      this.reset(randomX);
    }

    reset(randomX = true) {
      this.x    = randomX ? Math.random() * canvas.width : -2;
      this.y    = Math.random() * canvas.height;
      this.size = Math.random() * 1.6 + 0.25;

      // Drift speed — larger stars (closer) drift faster
      this.speed = (this.size / 1.85) * (Math.random() * 0.10 + 0.04);

      this.baseOpacity  = Math.random() * 0.60 + 0.25;
      this.opacity      = this.baseOpacity;
      this.twinkleSpeed = Math.random() * 0.022 + 0.007;
      this.twinklePhase = Math.random() * Math.PI * 2;

      // Mostly white, ~30% slightly blue/violet
      const blueish = Math.random() < 0.30;
      this.hue = blueish ? (Math.random() * 50 + 220) : 0;
      this.sat = blueish ? 35 : 0;
    }

    update(dt) {
      const sf = speedFactor();
      this.x += this.speed * sf * (dt / 16);
      this.twinklePhase += this.twinkleSpeed;
      this.opacity = this.baseOpacity * (0.55 + 0.45 * Math.sin(this.twinklePhase));

      if (this.x > canvas.width + 4) {
        this.reset(false);
      }
    }

    draw() {
      // Parallax depth: bigger stars move more
      const depthFactor = this.size / 1.85;
      const px = this.x + parallaxX * depthFactor * 10;
      const py = this.y + parallaxY * depthFactor * 10;

      ctx.save();
      ctx.globalAlpha = Math.min(this.opacity, 1);

      // Soft glow for larger stars
      if (this.size > 1.1) {
        ctx.shadowBlur  = 5;
        ctx.shadowColor = `hsl(${this.hue}, ${this.sat}%, 96%)`;
      }

      ctx.fillStyle = `hsl(${this.hue}, ${this.sat}%, 96%)`;
      ctx.beginPath();
      ctx.arc(px, py, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ----------------------------------------------------------
     ShootingStar class
  ---------------------------------------------------------- */
  class ShootingStar {
    constructor() {
      this.active = true;
      this.init();
    }

    init() {
      // Start from upper-center area, travel diagonally down-right
      this.x      = Math.random() * canvas.width  * 0.55 + canvas.width  * 0.1;
      this.y      = Math.random() * canvas.height * 0.35;
      this.length = Math.random() * 130 + 60;
      this.angle  = Math.PI / 4 + (Math.random() - 0.5) * 0.25;
      this.spd    = Math.random() * 7 + 5;
      this.life   = 1.0;
      this.decay  = Math.random() * 0.014 + 0.009;
    }

    update(dt) {
      const sf = speedFactor();
      this.x    += Math.cos(this.angle) * this.spd * sf * (dt / 16);
      this.y    += Math.sin(this.angle) * this.spd * sf * (dt / 16);
      this.life -= this.decay;
      if (this.life <= 0) this.active = false;
    }

    draw() {
      if (!this.active) return;

      const tailX = this.x - Math.cos(this.angle) * this.length * this.life;
      const tailY = this.y - Math.sin(this.angle) * this.length * this.life;

      const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, `rgba(255,255,255,${this.life * 0.9})`);

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.4;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      // Bright head dot
      ctx.globalAlpha = this.life * 0.85;
      ctx.fillStyle   = 'white';
      ctx.shadowBlur  = 6;
      ctx.shadowColor = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ----------------------------------------------------------
     Canvas resize
  ---------------------------------------------------------- */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ----------------------------------------------------------
     Spawn shooting star at random (~1.5% chance per second)
  ---------------------------------------------------------- */
  let shootingCooldown = 0;

  function maybeShoot(dt) {
    if (REDUCED_MOTION) return;
    shootingCooldown -= dt;
    if (shootingCooldown <= 0) {
      // Random wait between 4 and 18 seconds
      shootingCooldown = (Math.random() * 14000 + 4000);
      shootingStars.push(new ShootingStar());
    }
  }

  /* ----------------------------------------------------------
     Main animation loop
  ---------------------------------------------------------- */
  function animate(timestamp) {
    if (animSpeed() === 'off') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => s.draw());
      return; // stop rAF loop
    }

    const dt = Math.min(timestamp - lastTime, 100); // clamp to 100 ms
    lastTime = timestamp;

    // Smooth parallax
    parallaxX += (targetPX - parallaxX) * 0.06;
    parallaxY += (targetPY - parallaxY) * 0.06;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stars
    stars.forEach(s => { s.update(dt); s.draw(); });

    // Shooting stars
    maybeShoot(dt);
    shootingStars = shootingStars.filter(s => s.active);
    shootingStars.forEach(s => { s.update(dt); s.draw(); });

    animationId = requestAnimationFrame(animate);
  }

  /* ----------------------------------------------------------
     Start / stop
  ---------------------------------------------------------- */
  function startLoop() {
    if (animationId) return;
    if (REDUCED_MOTION || animSpeed() === 'off') return;
    lastTime    = performance.now();
    animationId = requestAnimationFrame(animate);
  }

  function stopLoop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  /* ----------------------------------------------------------
     Init
  ---------------------------------------------------------- */
  function init() {
    resize();
    stars = Array.from({ length: STAR_COUNT }, () => new Star());
    shootingCooldown = Math.random() * 6000 + 3000; // first star after 3-9 s

    if (REDUCED_MOTION) {
      // Draw once, static
      stars.forEach(s => s.draw());
      return;
    }

    startLoop();
  }

  /* ----------------------------------------------------------
     Event listeners
  ---------------------------------------------------------- */
  // Pause when tab hidden → save battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  });

  // Respond to animation speed changes from app.js
  document.addEventListener('orbitAnimSpeedChange', () => {
    if (animSpeed() === 'off') {
      stopLoop();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => s.draw());
    } else {
      startLoop();
    }
  });

  // Mouse parallax
  document.addEventListener('mousemove', (e) => {
    if (REDUCED_MOTION || animSpeed() === 'off') return;
    targetPX = (e.clientX / window.innerWidth  - 0.5) * 1.6;
    targetPY = (e.clientY / window.innerHeight - 0.5) * 1.6;
  });

  // Resize
  window.addEventListener('resize', () => {
    resize();
    stars = Array.from({ length: STAR_COUNT }, () => new Star());
  });

  init();
})();
