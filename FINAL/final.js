//canvas 
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function clamp (val,min,max) {
    return Math.min(Math.max(val,min),max);
}

//volume state 
let volume = 50;

//upadte volume 

function updateHUD(){
    const disp = document.getElementById("volume-display");
    if (disp) disp.textContent = volume;
    const bar = document.getElementById("volume-bar");
    if (bar) bar.style.width = volume + "%";
}

//bubbles 

const TYPES = [
  { color: "rgb(68, 136, 255)",  glow: "rgb(34, 85, 255)",   label: "+5",    delta:  5   },
  { color: "rgb(255, 68, 85)",   glow: "rgb(204, 17, 34)",   label: "-5",    delta: -5   },
  { color: "rgb(68, 238, 136)",  glow: "rgb(34, 204, 102)",  label: "+1",    delta:  1   },
  { color: "rgb(255, 136, 187)", glow: "rgb(221, 68, 136)",  label: "-1",    delta: -1   },
  { color: "rgb(255, 221, 68)",  glow: "rgb(204, 153, 0)",   label: "Reset", delta: null },
];

const TYPE_POOL = [];
for (let i = 0; i < 3; i++) TYPE_POOL.push(TYPES[0], TYPES[1]);
for (let i = 0; i < 5; i++) TYPE_POOL.push(TYPES[2], TYPES[3]);
TYPE_POOL.push(TYPES[4]);

function randomType() {
    return TYPE_POOL[random(0, TYPE_POOL.length)];
}

class Bubble {
  constructor (x, y, velX, velY, type, size) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.type = type;
    this.size = size;
    this.wobble = Math.random() * Math.PI * 2;
    this.alpha = 0;
    this.popped = false;
    this.popScale = 1;
    this.popAlpha = 1;
  }

  draw() {
    ctx.save();
    if (this.popped) {
      ctx.globalAlpha = this.popAlpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.popScale, 0, 2 * Math.PI);
      ctx.strokeStyle = this.type.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.globalAlpha = this.alpha;
    ctx.shadowColor = this.type.glow;
    ctx.shadowBlur = 18;

    const grad = ctx.createRadialGradient(
      this.x,
      this.y,
      this.size * 0.1,
      this.x,
      this.y,
      this.size
    );
    grad.addColorStop(0, this.type.color.replace("rgb", "rgba").replace(")", ", 0.8)"));
    grad.addColorStop(0.6, this.type.color.replace("rgb", "rgba").replace(")", ", 0.3)"));
    grad.addColorStop(1, this.type.color.replace("rgb", "rgba").replace(")", ", 0.05)"));

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = this.type.color.replace("rgb", "rgba").replace(")", ", 0.7)");
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(
      this.x - this.size * 0.3,
      this.y - this.size * 0.3,
      this.size * 0.22,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = `bold ${Math.max(10, this.size * 0.45)}px Segoe UI`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText(this.type.label, this.x, this.y);

    ctx.restore();
  }

  update() {
    if (this.popped) {
      this.popScale += 0.1;
      this.popAlpha -= 0.08;
      return;
    }

    if (this.alpha < 1) {
      this.alpha = Math.min(1, this.alpha + 0.03);
    }

    this.wobble += 0.025;
    this.x += this.velX + Math.sin(this.wobble) * 0.5;
    this.y += this.velY;

    if (this.x + this.size >= width) {
      this.x = width - this.size;
      this.velX = -this.velX;
    }
    if (this.x - this.size <= 0) {
      this.x = this.size;
      this.velX = -this.velX;
    }
    if (this.y + this.size < 0) {
      this.y = height + this.size;
    }
  }

  isDead() {
    return this.popped && this.popAlpha <= 0;
  }

  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.size * this.size;
  }
}

const bubbles = [];

while (bubbles.length < 14) {
  const size = random(18, 44);
  const bubble = new Bubble(
    random(size, width - size),
    random(size, height - size),
    (Math.random() - 0.5) * 1.4,  // slow horizontal drift
    -(0.6 + Math.random() * 1.0), // always floats upward
    randomType(),
    size
  );
  bubbles.push(bubble);
}

function spawnBubble() {
  const size = random(18, 44);
  const bubble = new Bubble(
    random(size, width - size),
    height + size,
    (Math.random() - 0.5) * 1.4,
    -(0.6 + Math.random() * 1.0),
    randomType(),
    size
  );
  bubbles.push(bubble);
}

function applyDelta(type) {
  if (type.delta === null) {
    volume = 0;
  } else {
    volume = clamp(volume + type.delta, 0, 100);
  }
  updateHUD();
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    if (!b.popped && b.contains(cx, cy)) {
      b.popped = true;
      applyDelta(b.type);
      break;
    }
  }
});

const submitBtn = document.getElementById("submit-btn");
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const strong = document.querySelector("#toast-msg strong");
    if (strong) strong.textContent = volume;
    const toast = document.getElementById("toast");
    if (toast) {
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2800);
    }
  });
}

function loop() {
  ctx.fillStyle = "rgba(10, 10, 26, 0.35)";
  ctx.fillRect(0, 0, width, height);
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].draw();
    bubbles[i].update();

    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1);
      spawnBubble();
    }
  }
  while (bubbles.length < 14) {
    spawnBubble();
  }

  requestAnimationFrame(loop);
}

updateHUD();
loop();
 