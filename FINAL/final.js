// setup canvas

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width  = (canvas.width  = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// helpers

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// volume

let volume = 50;

function applyChange(change) {
  if (change === null) {
    volume = 0;
  } else {
    volume = Math.min(100, Math.max(0, volume + change));
  }
  document.getElementById("vol").textContent = volume;
}

// spring bubble types — soft pastel tints

const TYPES = [
  { r: 100, g: 170, b: 255, label: "+5",    change:  5,   weight: 3 },  // sky blue
  { r: 255, g: 110, b: 130, label: "-5",    change: -5,   weight: 3 },  // rose
  { r: 120, g: 210, b: 140, label: "+1",    change:  1,   weight: 5 },  // mint green
  { r: 230, g: 130, b: 210, label: "-1",    change: -1,   weight: 5 },  // lilac
  { r: 255, g: 210, b: 80,  label: "reset", change: null, weight: 1 },  // soft yellow
];

const TYPE_POOL = [];
for (const t of TYPES) {
  for (let i = 0; i < t.weight; i++) TYPE_POOL.push(t);
}

function randomType() {
  return TYPE_POOL[random(0, TYPE_POOL.length - 1)];
}

// ─── Droplet (pop spray) ──────────────────────────────────────────────────────

class Droplet {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    const angle = randomFloat(0, Math.PI * 2);
    const speed = randomFloat(1, 4);
    this.velX  = Math.cos(angle) * speed;
    this.velY  = Math.sin(angle) * speed;
    this.type  = type;
    this.alpha = 1;
    this.size  = randomFloat(2, 5);
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.type.r},${this.type.g},${this.type.b},0.8)`;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.x    += this.velX;
    this.y    += this.velY;
    this.velY += 0.1;
    this.alpha -= 0.04;
  }

  isDead() { return this.alpha <= 0; }
}

// ─── Bubble class ─────────────────────────────────────────────────────────────

class Bubble {
  constructor(x, y, velX, velY, type, size) {
    this.x      = x;
    this.y      = y;
    this.velX   = velX;
    this.velY   = velY;
    this.type   = type;
    this.size   = size;
    this.wobble = randomFloat(0, Math.PI * 2);
    this.alpha  = 0;
    this.popped    = false;
    this.popRing   = size;
    this.ringAlpha = 1;
  }

  draw() {
    ctx.save();

    if (this.popped) {
      ctx.globalAlpha = this.ringAlpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.popRing, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${this.type.r},${this.type.g},${this.type.b},1)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.globalAlpha = this.alpha;

    const r = this.size;

    // outer soft glow halo
    const glow = ctx.createRadialGradient(this.x, this.y, r * 0.5, this.x, this.y, r * 1.4);
    glow.addColorStop(0, `rgba(${this.type.r},${this.type.g},${this.type.b},0)`);
    glow.addColorStop(1, `rgba(${this.type.r},${this.type.g},${this.type.b},0.08)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // translucent body fill
    const fill = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
    fill.addColorStop(0,   `rgba(${this.type.r},${this.type.g},${this.type.b},0.05)`);
    fill.addColorStop(0.7, `rgba(${this.type.r},${this.type.g},${this.type.b},0.08)`);
    fill.addColorStop(1,   `rgba(${this.type.r},${this.type.g},${this.type.b},0.22)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();

    // iridescent spring rim — shifts from tint → warm white → soft peach
    const rim = ctx.createLinearGradient(
      this.x - r, this.y - r,
      this.x + r, this.y + r
    );
    rim.addColorStop(0,    `rgba(${this.type.r},${this.type.g},${this.type.b},0.95)`);
    rim.addColorStop(0.3,  `rgba(255,230,240,0.7)`);   // warm petal white
    rim.addColorStop(0.65, `rgba(${this.type.r},${this.type.g},${this.type.b},0.75)`);
    rim.addColorStop(1,    `rgba(255,245,250,0.4)`);   // soft blush white
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = rim;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // large soft highlight top-left
    const hi = ctx.createRadialGradient(
      this.x - r * 0.38, this.y - r * 0.38, 0,
      this.x - r * 0.38, this.y - r * 0.38, r * 0.55
    );
    hi.addColorStop(0, "rgba(255,255,255,0.6)");
    hi.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(this.x - r * 0.38, this.y - r * 0.38, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = hi;
    ctx.fill();

    // small bright dot
    ctx.beginPath();
    ctx.arc(this.x - r * 0.3, this.y - r * 0.32, r * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();

    // tiny secondary glint bottom-right
    ctx.beginPath();
    ctx.arc(this.x + r * 0.38, this.y + r * 0.35, r * 0.07, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fill();

    // label — colored to match tint, readable against the light background
    ctx.fillStyle = `rgba(${Math.floor(this.type.r * 0.6)},${Math.floor(this.type.g * 0.6)},${Math.floor(this.type.b * 0.6)},1)`;
    ctx.font = `bold ${Math.max(11, r * 0.45)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = `rgba(${this.type.r},${this.type.g},${this.type.b},0.5)`;
    ctx.shadowBlur = 4;
    ctx.fillText(this.type.label, this.x, this.y);

    ctx.restore();
  }

  update() {
    if (this.popped) {
      this.popRing   += 4;
      this.ringAlpha -= 0.08;
      return;
    }

    if (this.alpha < 1) this.alpha = Math.min(1, this.alpha + 0.025);

    this.wobble += 0.022;
    this.x += this.velX + Math.sin(this.wobble) * 0.6;
    this.y += this.velY;

    if (this.x + this.size >= width)  { this.x = width - this.size;  this.velX = -this.velX; }
    if (this.x - this.size <= 0)      { this.x = this.size;          this.velX = -this.velX; }
  }

  isDead() {
    if (this.popped) return this.ringAlpha <= 0;
    return this.y + this.size < 0;
  }

  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy < this.size * this.size;
  }
}

// ─── Pools ────────────────────────────────────────────────────────────────────

const bubbles  = [];
const droplets = [];

function spawnBubble(startY) {
  const size = random(26, 52);
  const y    = startY !== undefined ? startY : height + size;
  bubbles.push(new Bubble(
    random(size, width - size),
    y,
    randomFloat(-0.8, 0.8),
    -(randomFloat(0.5, 1.4)),
    randomType(),
    size,
  ));
}

for (let i = 0; i < 16; i++) {
  spawnBubble(random(100, height - 20));
}

// ─── Click to pop ─────────────────────────────────────────────────────────────

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const cx   = e.clientX - rect.left;
  const cy   = e.clientY - rect.top;

  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    if (!b.popped && b.contains(cx, cy)) {
      applyChange(b.type.change);
      for (let d = 0; d < 10; d++) droplets.push(new Droplet(b.x, b.y, b.type));
      b.popped = true;
      break;
    }
  }
});

document.getElementById("submit").addEventListener("click", () => {
  alert("Volume set to " + volume + "!");
});

// ─── Loop ─────────────────────────────────────────────────────────────────────

function loop() {
  ctx.clearRect(0, 0, width, height);

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].draw();
    bubbles[i].update();
    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1);
      spawnBubble();
    }
  }

  while (bubbles.length < 16) spawnBubble();

  for (let i = droplets.length - 1; i >= 0; i--) {
    droplets[i].draw();
    droplets[i].update();
    if (droplets[i].isDead()) droplets.splice(i, 1);
  }

  requestAnimationFrame(loop);
}

loop();