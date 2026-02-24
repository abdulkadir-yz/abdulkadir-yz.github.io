// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
});

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== MOBILE MENU =====
const hamburger = document.getElementById('nav-hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ===== TYPING EFFECT =====
const commands = [
    'echo "Hello World!"',
    'dotnet new webapi --name Portfolio',
    'docker build -t abdulkadir/app .',
    'kubectl apply -f deployment.yaml',
    'az login --use-device-code',
    'git push origin main',
    'python train_model.py --epochs 50'
];

let cmdIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedText = document.getElementById('typed-text');

function type() {
    const current = commands[cmdIndex];

    if (!isDeleting) {
        typedText.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
            isDeleting = true;
            setTimeout(type, 2000);
            return;
        }
        setTimeout(type, 60);
    } else {
        typedText.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            cmdIndex = (cmdIndex + 1) % commands.length;
            setTimeout(type, 500);
            return;
        }
        setTimeout(type, 30);
    }
}

type();

// ===== SCROLL ANIMATIONS =====
const faders = document.querySelectorAll('.section-title, .timeline-item, .tech-category, .edu-card, .roadmap-step, .contact-card, .highlight-card, .about-text');

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in', 'visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

faders.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});