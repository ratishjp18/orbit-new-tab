/* ============================================================
   Orbit New Tab — stars.js
   Delta-time starfield: parallax depth, twinkling, shooting
   stars, mouse parallax. Pauses on hidden tab.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     TUNABLE CONSTANTS — change these to adjust the feel
     ============================================================ */
  const STAR_COUNT      = 200;   // max stars (keep low for CPU)
  const STAR_SPEED_BASE = 0.90;  // px per 16 ms at 1× multiplier (~3× old value)
  const TWINKLE_SPEED   = 0.042; // radians per 16 ms  (~2× old value)
  const SHOOT_MIN_MS    = 5000;  // min gap between shooting stars
  const SHOOT_MAX_MS    = 10000; // max gap
  const MAX_SHOOTING    = 3;     // simultaneous shooting stars

  // Speed multipliers per background-speed setting
  const SPEED_MULT = {
    slow:   0.35,
    normal: 1.00,
    fast:   2.40   // default
  };
  /* ============================================================ */

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.getElementById('starfield');
  const ctx    = canvas.getContext('2d');

  let stars         = [];
  let shootingStars = [];
  let animId        = null;
  let lastTime      = 0;
  let shootCooldown = 0;

  let parallaxX = 0, parallaxY = 0;
  let targetPX  = 0, targetPY  = 0;

  /* ----------------------------------------------------------
     Speed helper — reads live data-bg-speed attribute
  ---------------------------------------------------------- */
  function mult() {
    if (REDUCED_MOTION) return 0.12;
    const s = document.documentElement.dataset.bgSpeed || 'fast';
    return SPEED_MULT[s] ?? SPEED_MULT.fast;
  }

  /* ----------------------------------------------------------
     Canvas resize
  ---------------------------------------------------------- */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ----------------------------------------------------------
     Star
  ---------------------------------------------------------- */
  class Star {
    constructor(randomX = true) { this.reset(randomX); }

    reset(randomX = true) {
      this.x    = randomX ? Math.random() * canvas.width : -2;
      this.y    = Math.random() * canvas.height;
      this.size = Math.random() * 1.8 + 0.2;

      // Parallax depth: larger (closer) stars drift faster
      this.driftSpeed  = STAR_SPEED_BASE * (0.25 + (this.size / 1.8) * 0.75);

      this.baseOpacity  = Math.random() * 0.55 + 0.25;
      this.opacity      = this.baseOpacity;
      this.twinklePhase = Math.random() * Math.PI * 2;

      // ~70% white, ~30% faint blue-violet
      const tinted = Math.random() < 0.30;
      this.hue = tinted ? (Math.random() * 50 + 220) : 0;
      this.sat = tinted ? 35 : 0;
    }

    update(dt) {
      const m = mult();
      this.x += this.driftSpeed * m * (dt / 16);
      this.twinklePhase += TWINKLE_SPEED * m * (dt / 16);
      this.opacity = this.baseOpacity * (0.50 + 0.50 * Math.sin(this.twinklePhase));
      if (this.x > canvas.width + 4) this.reset(false);
    }

    draw() {
      const depth = this.size / 1.8; // bigger = closer = more parallax
      const px = this.x + parallaxX * depth * 14;
      const py = this.y + parallaxY * depth * 14;

      ctx.save();
      ctx.globalAlpha = Math.min(this.opacity, 1);
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
     Shooting star
  ---------------------------------------------------------- */
  class ShootingStar {
    constructor() {
      this.active = true;
      // Random position: upper ~45% of canvas, varied angle ±15° from 45°
      this.x     = Math.random() * canvas.width  * 0.70 + canvas.width  * 0.05;
      this.y     = Math.random() * canvas.height * 0.45;
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.26;
      this.length = Math.random() * 160 + 80;
      this.spd   = Math.random() * 16 + 10;
      this.life  = 1.0;
      this.decay = Math.random() * 0.011 + 0.007;
    }

    update(dt) {
      // Shooting stars keep a minimum speed so they're always visible
      const m = Math.max(mult(), 0.5);
      this.x    += Math.cos(this.angle) * this.spd * m * (dt / 16);
      this.y    += Math.sin(this.angle) * this.spd * m * (dt / 16);
      this.life -= this.decay * m * (dt / 16);
      if (this.life <= 0) this.active = false;
    }

    draw() {
      if (!this.active) return;
      const tailX = this.x - Math.cos(this.angle) * this.length * this.life;
      const tailY = this.y - Math.sin(this.angle) * this.length * this.life;

      const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, `rgba(255,255,255,${this.life * 0.92})`);

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.6;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      // Bright head
      ctx.globalAlpha = this.life * 0.9;
      ctx.fillStyle   = 'white';
      ctx.shadowBlur  = 8;
      ctx.shadowColor = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ----------------------------------------------------------
     Shooting star spawner
  ---------------------------------------------------------- */
  function maybeShoot(dt) {
    if (REDUCED_MOTION) return;
    shootCooldown -= dt;
    if (shootCooldown <= 0 &&
        shootingStars.filter(s => s.active).length < MAX_SHOOTING) {
      shootCooldown = SHOOT_MIN_MS + Math.random() * (SHOOT_MAX_MS - SHOOT_MIN_MS);
      shootingStars.push(new ShootingStar());
    }
  }

  /* ----------------------------------------------------------
     Animation loop (delta-time, frame-rate independent)
  ---------------------------------------------------------- */
  function animate(ts) {
    const dt = Math.min(ts - lastTime, 100); // clamp: handles tab suspend
    lastTime = ts;

    // Ease parallax target
    parallaxX += (targetPX - parallaxX) * 0.06;
    parallaxY += (targetPY - parallaxY) * 0.06;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (REDUCED_MOTION) {
      stars.forEach(s => s.draw()); // static frame
    } else {
      stars.forEach(s => { s.update(dt); s.draw(); });
      maybeShoot(dt);
      shootingStars = shootingStars.filter(s => s.active);
      shootingStars.forEach(s => { s.update(dt); s.draw(); });
    }

    animId = requestAnimationFrame(animate);
  }

  /* ----------------------------------------------------------
     Start / stop helpers
  ---------------------------------------------------------- */
  function startLoop() {
    if (animId || REDUCED_MOTION) return;
    lastTime = performance.now();
    animId   = requestAnimationFrame(animate);
  }

  function stopLoop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  /* ----------------------------------------------------------
     Init
  ---------------------------------------------------------- */
  function init() {
    resize();
    stars         = Array.from({ length: STAR_COUNT }, () => new Star());
    // First shooting star fires sooner (30–60 % into the min gap)
    shootCooldown = SHOOT_MIN_MS * (0.3 + Math.random() * 0.3);

    if (REDUCED_MOTION) {
      stars.forEach(s => s.draw());
      return;
    }
    startLoop();
  }

  /* ----------------------------------------------------------
     Events
  ---------------------------------------------------------- */
  // Pause when tab hidden — saves battery
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopLoop() : startLoop();
  });

  // Background-speed setting changed by app.js
  document.addEventListener('orbitBgSpeedChange', () => {
    startLoop(); // always restart (speed is read live from dataset)
  });

  // Mouse parallax
  document.addEventListener('mousemove', (e) => {
    if (REDUCED_MOTION) return;
    targetPX = (e.clientX / window.innerWidth  - 0.5) * 1.8;
    targetPY = (e.clientY / window.innerHeight - 0.5) * 1.8;
  });

  // Resize
  window.addEventListener('resize', () => {
    resize();
    stars = Array.from({ length: STAR_COUNT }, () => new Star());
  });

  init();
})();
