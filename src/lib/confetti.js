/**
 * Zero-dependency celebratory confetti particle engine
 */
export function triggerConfetti() {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = [
    "#6366f1", // Indigo
    "#a855f7", // Violet
    "#ec4899", // Pink
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#06b6d4", // Cyan
    "#3b82f6"  // Blue
  ];

  const particles = [];
  const count = 120;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: width / 2,
      y: height * 0.45,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 12 + 4,
      gravity: 0.35,
      friction: 0.96,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      decay: Math.random() * 0.015 + 0.008,
      wobble: Math.random() * 10
    });
  }

  let animationFrame;
  function update() {
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;
    for (const p of particles) {
      if (p.opacity > 0) {
        activeParticles++;
        p.speed *= p.friction;
        p.x += Math.cos(p.angle) * p.speed + Math.sin(p.wobble) * 0.5;
        p.y += Math.sin(p.angle) * p.speed + p.gravity * 4;
        p.wobble += 0.1;
        p.rotation += p.rotSpeed;
        p.opacity -= p.decay;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }

    if (activeParticles > 0) {
      animationFrame = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  update();
}
