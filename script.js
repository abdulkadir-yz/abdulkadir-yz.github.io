// ===========================
// LOTR PORTFOLIO — SCRIPT.JS
// ===========================

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const themeLabel  = document.getElementById('theme-label');

const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeLabel(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeLabel(next);
});

function updateThemeLabel(theme) {
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Mordor' : 'Valinor';
    }
}

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

// ===== MOBILE MENU =====
const hamburger = document.getElementById('nav-hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active', isActive);
    hamburger.setAttribute('aria-expanded', String(isActive));
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

// ===== PALANTIR TERMINAL — TYPING EFFECT =====
const commands = [
    { cmd: 'cd /middle-earth/backend',           out: '>> Entered the realm of code...' },
    { cmd: 'docker build -t fellowship/api .',   out: '>> Image forged in the fires of Mount Doom' },
    { cmd: 'kubectl apply -f deployment.yaml',   out: '>> deployment "one-ring-api" applied' },
    { cmd: 'az login --realm azure-cloud',       out: '>> Connected to the Cloud Citadel' },
    { cmd: 'git push origin main',               out: '>> Changes sent across the Shire' },
    { cmd: 'python train_model.py --epochs 50',  out: '>> Training the model of power...' },
    { cmd: 'dotnet new webapi --name Kadir.Api', out: '>> Backend forge initialized' },
    { cmd: 'helm upgrade --install gondor .',    out: '>> Release "gondor" deployed successfully' },
];

let cmdIndex  = 0;
let charIndex = 0;
let isDeleting = false;
let outputShown = false;
const typedText    = document.getElementById('typed-text');
const terminalOut  = document.getElementById('terminal-output');

function type() {
    const current = commands[cmdIndex];

    if (!isDeleting) {
        typedText.textContent = current.cmd.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.cmd.length) {
            // Show output line
            if (!outputShown) {
                outputShown = true;
                terminalOut.textContent = current.out;
            }
            isDeleting = true;
            setTimeout(type, 2200);
            return;
        }
        setTimeout(type, 58);
    } else {
        typedText.textContent = current.cmd.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting  = false;
            outputShown = false;
            terminalOut.textContent = '';
            cmdIndex = (cmdIndex + 1) % commands.length;
            setTimeout(type, 480);
            return;
        }
        setTimeout(type, 26);
    }
}

type();

// ===== CANVAS PARTICLE SYSTEM (fireflies/embers) =====
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let animFrame;

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}

function getAccentColor() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return isDark
        ? { r: 201, g: 144, b: 42 }
        : { r: 139, g: 105, b: 20 };
}

function createParticle() {
    const c = getAccentColor();
    return {
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.45 + 0.08,
        vx:    (Math.random() - 0.5) * 0.28,
        vy:    -(Math.random() * 0.35 + 0.08),
        life:  Math.random() * 200 + 120,
        age:   0,
        color: c,
        pulse: Math.random() * Math.PI * 2,
    };
}

function initParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) {
        const p = createParticle();
        p.age = Math.random() * p.life; // stagger ages
        particles.push(p);
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = performance.now() * 0.001;

    particles.forEach((p, i) => {
        p.age++;
        p.x   += p.vx;
        p.y   += p.vy;
        p.pulse += 0.025;

        // gentle drift
        p.vx += (Math.random() - 0.5) * 0.008;

        const lifeRatio = p.age / p.life;
        const fade      = lifeRatio < FADE_IN_RATIO
            ? lifeRatio / FADE_IN_RATIO
            : lifeRatio > FADE_OUT_START
                ? (1 - lifeRatio) / (1 - FADE_OUT_START)
                : 1;
        const glow = Math.sin(p.pulse) * 0.25 + 0.75;
        const alpha = p.alpha * fade * glow;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const { r, g, b } = p.color;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();

        // Reset particle when it dies or leaves viewport
        if (p.age >= p.life || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
            particles[i] = createParticle();
            if (p.y < -10) {
                particles[i].y = canvas.height + 5;
            }
        }
    });

    animFrame = requestAnimationFrame(drawParticles);
}

// Particle system tuning constants
const PARTICLE_SPACING  = 14; // pixels per particle (lower = denser)
const MAX_PARTICLES     = 90; // cap to keep performance smooth
const FADE_IN_RATIO     = 0.12; // fraction of life spent fading in
const FADE_OUT_START    = 0.78; // fraction of life when fade-out begins

function startParticles() {
    const count = Math.min(Math.floor(window.innerWidth / PARTICLE_SPACING), MAX_PARTICLES);
    resizeCanvas();
    initParticles(count);
    cancelAnimationFrame(animFrame);
    drawParticles();
}

// Refresh particle colors when theme changes
themeToggle.addEventListener('click', () => {
    particles.forEach(p => { p.color = getAccentColor(); });
});

window.addEventListener('resize', () => {
    resizeCanvas();
    startParticles();
}, { passive: true });

startParticles();

// ===== SCROLL-TRIGGERED ANIMATIONS =====
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
            // Stagger siblings slightly
            const siblings = entry.target.parentElement
                ? Array.from(entry.target.parentElement.querySelectorAll('.fade-in'))
                : [];
            const sibIdx = siblings.indexOf(entry.target);
            const delay  = sibIdx >= 0 ? sibIdx * 80 : 0;

            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
