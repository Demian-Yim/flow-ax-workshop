/* ═══════════════════════════════════════════════════════════
   FLOW~ AX Workshop Platform — Particles Animation
   Canvas-based floating particle system
   ═══════════════════════════════════════════════════════════ */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 120 };
    this.colors = [
      'rgba(99, 102, 241, 0.3)',     // indigo
      'rgba(139, 92, 246, 0.25)',    // violet
      'rgba(6, 182, 212, 0.2)',      // cyan
      'rgba(16, 185, 129, 0.2)',     // emerald
      'rgba(236, 72, 153, 0.15)',    // pink
      'rgba(245, 158, 11, 0.15)',    // amber
    ];
    
    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    const count = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 12000), 120);
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const size = Math.random() * 4 + 1;
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size,
      baseSize: size,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      opacity: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Pulse size
      p.pulsePhase += p.pulseSpeed;
      p.size = p.baseSize + Math.sin(p.pulsePhase) * 0.8;

      // Wrap around
      if (p.x > this.canvas.width + 10) p.x = -10;
      if (p.x < -10) p.x = this.canvas.width + 10;
      if (p.y > this.canvas.height + 10) p.y = -10;
      if (p.y < -10) p.y = this.canvas.height + 10;

      // Mouse interaction
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x += dx * force * 0.03;
          p.y += dy * force * 0.03;
        }
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;

      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = p.color;
          this.ctx.globalAlpha = (1 - dist / 150) * 0.15;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;
        }
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    new ParticleSystem('particles-canvas');
  }
});
