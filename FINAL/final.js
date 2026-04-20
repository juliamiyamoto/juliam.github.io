//canvas
 
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
 
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);
 
// random number 
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
 
// volume
 
let volume = 50;
 
function updateVolume(amount) {
  if (amount === null) {
    volume = 0;
  } else {
    volume = Math.min(100, Math.max(0, volume + amount));
  }
  document.getElementById("vol").textContent = volume;
}
 
// bubble 
 
const types = [
  { color: "blue",   change:  5   },
  { color: "red",    change: -5   },
  { color: "green",  change:  1   },
  { color: "hotpink",   change: -1   },
  { color: "orange", change: null },
];
 
function randomType() {
  return types[random(0, types.length - 1)];
}
 

 
class Bubble {
  constructor(x, y, velX, velY, type, size) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.type = type;
    this.size = size;
    this.alive = true;
  }
 
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.type.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
 
    ctx.fillStyle = "white";
    ctx.font = `bold ${Math.max(10, this.size * 0.5)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
 
    if (this.type.change === null) {
      ctx.fillText("0", this.x, this.y);
    } else if (this.type.change > 0) {
      ctx.fillText("+" + this.type.change, this.x, this.y);
    } else {
      ctx.fillText(this.type.change, this.x, this.y);
    }
  }
 
  update() {
  
    if (this.x + this.size >= width) {
      this.velX = -Math.abs(this.velX);
    }
    if (this.x - this.size <= 0) {
      this.velX = Math.abs(this.velX);
    }
 
    
    if (this.y + this.size < 0) {
      this.y = height + this.size;
      this.x = random(this.size, width - this.size);
    }
 
    this.x += this.velX;
    this.y += this.velY;
  }
}
 

 
const bubbles = [];
 
while (bubbles.length < 20) {
  const size = random(20, 40);
  const bubble = new Bubble(
    random(size, width - size),
    random(size, height - size),
    (Math.random() - 0.5) * 2,
    -(0.5 + Math.random()),
    randomType(),
    size
  );
  bubbles.push(bubble);
}
 

 
canvas.addEventListener("click", (e) => {
  for (const bubble of bubbles) {
    const dx = e.clientX - bubble.x;
    const dy = e.clientY - bubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
 
    if (distance < bubble.size) {
      updateVolume(bubble.type.change);
      bubble.type = randomType();
      bubble.size = random(20, 40);
      break;
    }
  }
});
 

 
document.getElementById("submit").addEventListener("click", () => {
  alert("Volume set to " + volume + "!");
});
 

 
function loop() {
  ctx.fillStyle = "rgba(17, 17, 17, 0.3)";
  ctx.fillRect(0, 0, width, height);
 
  for (const bubble of bubbles) {
    bubble.draw();
    bubble.update();
  }
 
  requestAnimationFrame(loop);
}
 
loop();