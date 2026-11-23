/* ============================================================
   Orbit New Tab — stars.js
   Delta-time starfield: parallax depth, twinkling, shooting
   stars, mouse parallax, constellation lines, interactive
   stardust trail & click comet bursts.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     TUNABLE CONSTANTS — change these to adjust the feel
     ============================================================ */
  const STAR_COUNT = 200;   // max stars (keep low for CPU)
  const STAR_SPEED_BASE = 0.90;  // px per 16 ms at 1× multiplier
  const TWINKLE_SPEED = 0.042; // radians per 16 ms
  const SHOOT_MIN_MS = 500;   // min gap between shooting stars
  const SHOOT_MAX_MS = 1500;  // max gap
  const MAX_SHOOTING = 2;     // simultaneous shooting stars

  // Comet colour tints (RGB strings)
  const COMET_TINTS = [
    '255,255,255', // white
    '180,210,255', // cool blue
    '210,180,255', // violet
    '255,245,180', // warm gold
  ];

  // Speed multipliers per background-speed setting
  const SPEED_MULT = {
    slow: 0.35,
    normal: 1.00,
    fast: 2.40   // default
  };
  /* ============================================================ */

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');

  let stars = [];
  let shootingStars = [];
  let constellations = [];
  let stardustParticles = [];
  let animId = null;
  let lastTime = 0;
  let shootCooldown = 0;
  let constCooldown = 1800;
  let lastTrailTime = 0;

  let parallaxX = 0, parallaxY = 0;
  let targetPX = 0, targetPY = 0;

  /* ----------------------------------------------------------
     Helpers
  ---------------------------------------------------------- */
  function mult() {
    if (REDUCED_MOTION) return 0.12;
    const s = document.documentElement.dataset.bgSpeed || 'fast';
    return SPEED_MULT[s] ?? SPEED_MULT.fast;
  }

    function cometColor() {
      return COMET_TINTS[Math.floor(Math.random() * COMET_TINTS.length)];
    }

    /* ----------------------------------------------------------
       Canvas resize
    ---------------------------------------------------------- */
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    /* ----------------------------------------------------------
       Star
    ---------------------------------------------------------- */
    class Star {
      constructor(randomX = true) {
        this.reset(randomX);
      }

      reset(randomX = true) {
        this.x = randomX ? Math.random() * canvas.width : -2;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.2;
        this.px = this.x;
        this.py = this.y;

        // Parallax depth: larger (closer) stars drift faster
        this.driftSpeed = STAR_SPEED_BASE * (0.25 + (this.size / 1.8) * 0.75);

        this.baseOpacity = Math.random() * 0.55 + 0.25;
        this.opacity = this.baseOpacity;
        this.twinklePhase = Math.random() * Math.PI * 2;

        // ~70% white, ~30% faint blue-violet or theme tint
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

        this.px = px;
        this.py = py;

        ctx.save();
        ctx.globalAlpha = Math.min(this.opacity, 1);
        if (this.size > 1.1) {
          ctx.shadowBlur = 5;
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
       Constellation Lines
    ---------------------------------------------------------- */
    class Constellation {
      constructor(starList) {
        this.stars = starList;
        this.life = 0;
        this.duration = 6200; // 6.2 seconds
        this.active = true;
      }

      update(dt) {
        this.life += dt;
        if (this.life >= this.duration) {
          this.active = false;
        }
      }

      draw() {
        if (!this.active || this.stars.length < 2) return;
        let alpha = 0;
        if (this.life < 1300) {
          alpha = (this.life / 1300) * 0.36;
        } else if (this.life < 4600) {
          alpha = 0.36 + 0.05 * Math.sin(this.life * 0.0035);
        } else {
          alpha = Math.max(0, (1 - (this.life - 4600) / 1600) * 0.36);
        }

        const color = '167, 139, 250'; // nebula violet

        ctx.save();
        ctx.strokeStyle = `rgba(${color}, ${alpha})`;
        ctx.lineWidth = 0.9;
        ctx.setLineDash([3, 4]);

        // Connect stars
        ctx.beginPath();
        for (let i = 0; i < this.stars.length; i++) {
          const s = this.stars[i];
          if (i === 0) ctx.moveTo(s.px, s.py);
          else ctx.lineTo(s.px, s.py);
        }
        ctx.stroke();

        // Node rings around stars
        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(${color}, ${alpha * 1.5})`;
        for (const s of this.stars) {
          ctx.beginPath();
          ctx.arc(s.px, s.py, s.size + 2.2, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    function maybeSpawnConstellation(dt) {
      if (REDUCED_MOTION) return;
      if (document.documentElement.dataset.constellations === 'off') {
        constellations = [];
        return;
      }
      constCooldown -= dt;
      if (constCooldown <= 0 && constellations.filter(c => c.active).length < 2) {
        constCooldown = 4000 + Math.random() * 4500;
        const visibleStars = stars.filter(s =>
          s.px > canvas.width * 0.12 && s.px < canvas.width * 0.88 &&
          s.py > canvas.height * 0.12 && s.py < canvas.height * 0.88
        );
        if (visibleStars.length < 6) return;

        const seed = visibleStars[Math.floor(Math.random() * visibleStars.length)];
        const group = [seed];
        let current = seed;
        for (let step = 0; step < 3; step++) {
          let best = null, bestDist = 9999;
          for (const candidate of visibleStars) {
            if (group.includes(candidate)) continue;
            const d = Math.hypot(candidate.px - current.px, candidate.py - current.py);
            if (d >= 40 && d <= 145 && d < bestDist) {
              best = candidate;
              bestDist = d;
            }
          }
          if (best) {
            group.push(best);
            current = best;
          } else break;
        }

        if (group.length >= 3) {
          constellations.push(new Constellation(group));
        }
      }
    }

    /* ----------------------------------------------------------
       Shooting star
    ---------------------------------------------------------- */
    class ShootingStar {
      constructor() {
        this.active = true;
        this.x = Math.random() * canvas.width * 0.70 + canvas.width * 0.05;
        this.y = Math.random() * canvas.height * 0.45;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.26;
        this.length = Math.random() * 160 + 80;
        this.spd = Math.random() * 16 + 10;
        this.life = 1.0;
        this.decay = Math.random() * 0.011 + 0.007;
        this.color = cometColor();
      }

      update(dt) {
        const m = Math.max(mult(), 0.5);
        this.x += Math.cos(this.angle) * this.spd * m * (dt / 16);
        this.y += Math.sin(this.angle) * this.spd * m * (dt / 16);
        this.life -= this.decay * m * (dt / 16);
        if (this.life <= 0) this.active = false;
      }

      draw() {
        if (!this.active) return;
        const tailX = this.x - Math.cos(this.angle) * this.length * this.life;
        const tailY = this.y - Math.sin(this.angle) * this.length * this.life;

        const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        grad.addColorStop(0, `rgba(${this.color},0)`);
        grad.addColorStop(1, `rgba(${this.color},${this.life * 0.92})`);

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Bright head
        ctx.globalAlpha = this.life * 0.9;
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function maybeShoot(dt) {
      if (REDUCED_MOTION) return;
      if (document.documentElement.dataset.shootingStars === 'off') return;
      shootCooldown -= dt;
      if (shootCooldown <= 0 &&
        shootingStars.filter(s => s.active).length < MAX_SHOOTING) {
        shootCooldown = SHOOT_MIN_MS + Math.random() * (SHOOT_MAX_MS - SHOOT_MIN_MS);
        shootingStars.push(new ShootingStar());
      }
    }

    /* ----------------------------------------------------------
       Stardust & Click Comet Burst
    ---------------------------------------------------------- */
    class StardustParticle {
      constructor(x, y, vx, vy, color, decay, size = 1.2) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.decay = decay;
      }

      update(dt) {
        const f = dt / 16;
        this.x += this.vx * f;
        this.y += this.vy * f;
        this.vx *= 0.93;
        this.vy *= 0.93;
        this.life -= this.decay * f;
      }

      draw() {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = `rgb(${this.color})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgb(${this.color})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function triggerBurst(x, y) {
      if (REDUCED_MOTION) return;
      if (document.documentElement.dataset.stardust === 'off') return;

      const palette = COMET_TINTS;

      // 24 exploding sparkling stardust particles
      const count = 24;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5.2 + 1.2;
        const color = palette[Math.floor(Math.random() * palette.length)];
        stardustParticles.push(new StardustParticle(
          x, y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          Math.random() * 0.024 + 0.014,
          Math.random() * 2.2 + 1.0
        ));
      }

      // Mini comet streaking away from click
      const cometAngle = Math.random() * Math.PI * 2;
      const miniComet = new ShootingStar();
      miniComet.x = x;
      miniComet.y = y;
      miniComet.angle = cometAngle;
      miniComet.length = Math.random() * 85 + 50;
      miniComet.spd = Math.random() * 13 + 10;
      miniComet.color = palette[Math.floor(Math.random() * palette.length)];
      miniComet.decay = 0.024; // quick flash
      shootingStars.push(miniComet);
    }

    /* ----------------------------------------------------------
       Animation loop (delta-time, frame-rate independent)
    ---------------------------------------------------------- */
    function animate(ts) {
      const dt = Math.min(ts - lastTime, 100);
      lastTime = ts;

      // Ease parallax target
      parallaxX += (targetPX - parallaxX) * 0.06;
      parallaxY += (targetPY - parallaxY) * 0.06;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (REDUCED_MOTION) {
        stars.forEach(s => s.draw());
      } else {
        stars.forEach(s => { s.update(dt); s.draw(); });

        // Constellations
        maybeSpawnConstellation(dt);
        constellations = constellations.filter(c => c.active);
        constellations.forEach(c => { c.update(dt); c.draw(); });

        // Shooting stars
        maybeShoot(dt);
        shootingStars = shootingStars.filter(s => s.active);
        shootingStars.forEach(s => { s.update(dt); s.draw(); });

        // Stardust & comet bursts
        stardustParticles = stardustParticles.filter(p => p.life > 0);
        stardustParticles.forEach(p => { p.update(dt); p.draw(); });
      }

      animId = requestAnimationFrame(animate);
    }

    /* ----------------------------------------------------------
       Start / stop helpers
    ---------------------------------------------------------- */
    function startLoop() {
      if (animId || REDUCED_MOTION) return;
      lastTime = performance.now();
      animId = requestAnimationFrame(animate);
    }

    function stopLoop() {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    }

    /* ----------------------------------------------------------
       Init
    ---------------------------------------------------------- */
    function init() {
      resize();
      stars = Array.from({ length: STAR_COUNT }, () => new Star());
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
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stopLoop() : startLoop();
    });

    document.addEventListener('orbitBgSpeedChange', () => {
      startLoop();
    });

    // Mouse parallax + subtle trail
    window.addEventListener('mousemove', (e) => {
      if (REDUCED_MOTION) return;
      targetPX = (e.clientX / window.innerWidth - 0.5) * 1.8;
      targetPY = (e.clientY / window.innerHeight - 0.5) * 1.8;

      if (document.documentElement.dataset.stardust === 'off') return;
      const now = performance.now();
      if (now - lastTrailTime > 38) {
        lastTrailTime = now;
        const color = '180,210,255';

        stardustParticles.push(new StardustParticle(
          e.clientX + (Math.random() - 0.5) * 6,
          e.clientY + (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8,
          color,
          0.045,
          Math.random() * 1.3 + 0.7
        ));
      }
    });

    // Click burst on empty canvas / background
    window.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('.tile, .settings-panel, .settings-toggle, .quick-search, .page-dots, button, input, a, [role="button"]')) {
        return;
      }
      triggerBurst(e.clientX, e.clientY);
    });

    window.addEventListener('resize', () => {
      resize();
      stars = Array.from({ length: STAR_COUNT }, () => new Star());
    });

    init();
  }) ();
