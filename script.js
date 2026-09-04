const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");

let width;
let height;

let stars = [];
let particles = [];
let ripples = [];

let mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
};

let pulseAngle = 0;
let rotation = 0;

const COLORS = {
    navy: "#01020D",
    turquoise: "#00E5D4",
    purple: "#8055FF",
    pink: "#FF3DBE",
    lavender: "#B9ACFF"
};

/* =====================================================
   RESIZE
===================================================== */
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    mouse.x = width / 2;
    mouse.y = height / 2;

    mouse.targetX = width / 2;
    mouse.targetY = height / 2;

    createStars();
}

window.addEventListener("resize", resize);

/* =====================================================
   MOUSE
===================================================== */
window.addEventListener("mousemove", (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;

    if (particles.length < 140) {
        for (let i = 0; i < 2; i++) {
            const random = Math.random();
            let color;

            if (random < 0.65) {
                color = COLORS.turquoise;
            } else if (random < 0.88) {
                color = COLORS.purple;
            } else {
                color = COLORS.pink;
            }

            particles.push({
                x: e.clientX,
                y: e.clientY,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                alpha: 0.8,
                size: Math.random() * 1.5 + 0.5,
                color: color
            });
        }
    }
});

/* =====================================================
   CLICK
===================================================== */
window.addEventListener("click", (e) => {
    ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        alpha: 1
    });

    const available = 140 - particles.length;
    const particleAmount = Math.min(35, Math.max(0, available));

    for (let i = 0; i < particleAmount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        const random = Math.random();
        let color;

        if (random < 0.6) {
            color = COLORS.turquoise;
        } else if (random < 0.87) {
            color = COLORS.purple;
        } else {
            color = COLORS.pink;
        }

        particles.push({
            x: e.clientX,
            y: e.clientY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            size: Math.random() * 2.5 + 0.7,
            color: color
        });
    }
});

/* =====================================================
   STAR
===================================================== */
class Star {
    constructor() {
        this.reset(Math.random() * 1200);
    }

    reset(startingZ = 1200) {
        this.x = (Math.random() - 0.5) * width * 2.2;
        this.y = (Math.random() - 0.5) * height * 2.2;
        this.z = startingZ;
        this.prevZ = this.z;
        this.size = Math.random() * 1.8 + 0.5;

        const random = Math.random();
        if (random < 0.68) {
            this.color = COLORS.turquoise;
        } else if (random < 0.91) {
            this.color = COLORS.purple;
        } else {
            this.color = COLORS.pink;
        }

        this.twinkle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 1.5 + 0.8;
    }

    update() {
        this.prevZ = this.z;
        this.z -= this.speed * 2.2;

        this.x += (mouse.x - width / 2) * 0.0007;
        this.y += (mouse.y - height / 2) * 0.0007;

        if (this.z < 1) {
            this.reset(1200);
        }
    }

    draw() {
        const fov = 420;
        const scale = fov / this.z;
        const previousScale = fov / this.prevZ;

        const x = width / 2 + this.x * scale;
        const y = height / 2 + this.y * scale;

        const previousX = width / 2 + this.x * previousScale;
        const previousY = height / 2 + this.y * previousScale;

        if (x < -100 || x > width + 100 || y < -100 || y > height + 100) {
            return;
        }

        let brightness = Math.min(1, (1200 - this.z) / 800);
        brightness = Math.max(0.15, brightness);

        const twinkle = 0.8 + Math.sin(performance.now() * 0.003 + this.twinkle) * 0.2;
        brightness *= twinkle;

        let rgb;
        if (this.color === COLORS.turquoise) {
            rgb = "0,229,212";
        } else if (this.color === COLORS.purple) {
            rgb = "128,85,255";
        } else {
            rgb = "255,61,190";
        }

        ctx.beginPath();
        ctx.moveTo(previousX, previousY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(${rgb}, ${brightness * 0.38})`;
        ctx.lineWidth = Math.max(0.4, this.size * scale);
        ctx.stroke();

        const radius = Math.max(0.5, this.size * scale);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${brightness})`;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8 + radius * 4;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

/* =====================================================
   CREATE STARFIELD
===================================================== */
function createStars() {
    stars = [];
    const amount = Math.min(520, Math.max(280, Math.floor((width * height) / 2500)));

    for (let i = 0; i < amount; i++) {
        stars.push(new Star());
    }
}

/* =====================================================
   STAR CONNECTIONS
===================================================== */
function drawStarConnections() {
    const distanceLimit = 90;

    for (let i = 0; i < stars.length; i++) {
        const a = stars[i];
        const scaleA = 420 / a.z;
        const ax = width / 2 + a.x * scaleA;
        const ay = height / 2 + a.y * scaleA;

        for (let j = i + 1; j < stars.length; j++) {
            const b = stars[j];
            const scaleB = 420 / b.z;
            const bx = width / 2 + b.x * scaleB;
            const by = height / 2 + b.y * scaleB;

            const dx = ax - bx;
            const dy = ay - by;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < distanceLimit) {
                let opacity = (1 - distance / distanceLimit) * 0.09;

                const mouseA = Math.hypot(mouse.x - ax, mouse.y - ay);
                const mouseB = Math.hypot(mouse.x - bx, mouse.y - by);

                if (mouseA < 140 || mouseB < 140) {
                    opacity *= 2.5;
                }

                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.strokeStyle = `rgba(0, 229, 212, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

/* =====================================================
   PARTICLES
===================================================== */
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        let rgb;
        if (p.color === COLORS.turquoise) {
            rgb = "0,229,212";
        } else if (p.color === COLORS.purple) {
            rgb = "128,85,255";
        } else {
            rgb = "255,61,190";
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

/* =====================================================
   RIPPLE
===================================================== */
function updateRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];

        ripple.radius += 5;
        ripple.alpha -= 0.025;

        if (ripple.alpha <= 0) {
            ripples.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 212, ${ripple.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = COLORS.turquoise;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

/* =====================================================
   CURSOR
===================================================== */
function drawCursor() {
    pulseAngle += 0.045;
    rotation += 0.015;

    const radius = 23 + Math.sin(pulseAngle) * 5;

    ctx.save();
    ctx.translate(mouse.x, mouse.y);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,61,190,0.65)";
    ctx.lineWidth = 1.2;
    ctx.shadowColor = COLORS.pink;
    ctx.shadowBlur = 12;
    ctx.stroke();

    ctx.rotate(rotation);

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const start = angle + 0.18;
        const end = angle + 0.68;

        ctx.moveTo(Math.cos(start) * 30, Math.sin(start) * 30);
        ctx.lineTo(Math.cos(end) * 30, Math.sin(end) * 30);
    }

    ctx.strokeStyle = "rgba(0,229,212,0.8)";
    ctx.lineWidth = 1;
    ctx.shadowColor = COLORS.turquoise;
    ctx.shadowBlur = 9;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(185,172,255,0.8)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-7, 0);
    ctx.moveTo(7, 0);
    ctx.lineTo(15, 0);
    ctx.moveTo(0, -15);
    ctx.lineTo(0, -7);
    ctx.moveTo(0, 7);
    ctx.lineTo(0, 15);

    ctx.strokeStyle = "rgba(185,172,255,0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = COLORS.pink;
    ctx.shadowBlur = 18;
    ctx.fill();

    ctx.restore();
}

/* =====================================================
   ANIMATION
===================================================== */
function animate() {
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.fillStyle = "rgba(1,2,13,0.42)";
    ctx.fillRect(0, 0, width, height);

    for (const star of stars) {
        star.update();
    }

    drawStarConnections();

    for (const star of stars) {
        star.draw();
    }

    updateParticles();
    updateRipples();
    drawCursor();

    requestAnimationFrame(animate);
}

/* =====================================================
   START
===================================================== */
resize();
animate();