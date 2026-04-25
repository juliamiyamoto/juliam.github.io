//canvas

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width  = (canvas.width  = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// random generator 

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// volume

let volume = 50;

function applyChange(change) {
  volume = Math.min(100, Math.max(0, volume + change));
  document.getElementById("vol").textContent = volume;
}

// positive or negative 1-50


function randomBubbleType() {
  const isPositive = Math.random() < 0.5;
  const value      = random(1, 50);

  if (isPositive) {
    const pick = Math.random() < 0.5;
    return {
      r: pick ? 100 : 120,
      g: pick ? 170 : 210,
      b: pick ? 255 : 140,
      change: value,
      label:  "+" + value,
    };
  } else {
    const pick = Math.random() < 0.5;
    
    return {
      r: pick ? 255 : 255,    
      g: pick ? 165 : 105,    
      b: pick ? 0   : 180,    
      change: -value,
      label:  "-" + value,
    };
  }
}

// popping graphic 

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

   


    const fill = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
    fill.addColorStop(0,   `rgba(${this.type.r},${this.type.g},${this.type.b},0.05)`);
    fill.addColorStop(0.7, `rgba(${this.type.r},${this.type.g},${this.type.b},0.08)`);
    fill.addColorStop(1,   `rgba(${this.type.r},${this.type.g},${this.type.b},0.22)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();


    const rim = ctx.createLinearGradient(this.x - r, this.y - r, this.x + r, this.y + r);
    rim.addColorStop(0,    `rgba(${this.type.r},${this.type.g},${this.type.b},0.95)`);
    rim.addColorStop(0.3,  `rgba(255,230,240,0.7)`);
    rim.addColorStop(0.65, `rgba(${this.type.r},${this.type.g},${this.type.b},0.75)`);
    rim.addColorStop(1,    `rgba(255,245,250,0.4)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = rim;
    ctx.lineWidth = 2.5;
    ctx.stroke();

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



  
    
    const labelSize = Math.max(9, Math.min(r * 0.45, r * 0.9 * (r / (this.type.label.length * 6 + r))));
    ctx.fillStyle = `rgba(${Math.floor(this.type.r * 0.55)},${Math.floor(this.type.g * 0.55)},${Math.floor(this.type.b * 0.55)},1)`;
    ctx.font = `bold ${Math.max(9, Math.floor(r * 0.38))}px sans-serif`;
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


  }

  isDead() {
    if (this.popped) return this.ringAlpha <= 0;

  if (this.y + this.size < 0) return true;
  
  if (this.x - this.size > width || this.x + this.size < 0) return true;
  return false;
  }

  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy < this.size * this.size;
  }
}


const bubbles  = [];
const droplets = [];

function spawnBubble(startY) {
  const size = random(32, 58);   
  const y    = startY !== undefined ? startY : height + size;
  bubbles.push(new Bubble(
    random(size, width - size),
    y,
    randomFloat(-0.8, 0.8),
    -(randomFloat(0.5, 1.4)),
    randomBubbleType(),
    size,
  ));
}

for (let i = 0; i < 16; i++) {
  spawnBubble(random(100, height - 20));
}



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
  alert("Volume set to " + volume + ".");
});



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