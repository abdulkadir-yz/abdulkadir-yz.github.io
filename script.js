/* ===========================================================
   THE RED BOOK — script.js
   Theme, navigation, terminal typing, ember canvas, reveals.

   Everything that moves checks prefers-reduced-motion first.
   =========================================================== */

(() => {
    'use strict';

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = () => motionQuery.matches;

    /* ===== THEME ===== */
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel  = document.getElementById('theme-label');

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Mordor' : 'Valinor';
    };

    // localStorage throws in some privacy modes — a missing preference is
    // not an error, the default theme just wins.
    let savedTheme = 'dark';
    try {
        savedTheme = localStorage.getItem('theme') || 'dark';
    } catch { /* stay with the default */ }
    applyTheme(savedTheme);

    themeToggle?.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark'
            ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('theme', next); } catch { /* ignore */ }
        recolourParticles();
    });

    /* ===== NAVBAR: shadow + reading progress ===== */
    const navbar   = document.getElementById('navbar');
    const progress = document.getElementById('nav-progress');

    const onScroll = () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 24);

        if (progress) {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
            progress.style.setProperty('--progress', Math.min(1, Math.max(0, ratio)).toFixed(4));
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ===== MOBILE MENU ===== */
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks  = document.getElementById('nav-links');

    const closeMenu = () => {
        navLinks?.classList.remove('active');
        hamburger?.classList.remove('active');
        hamburger?.setAttribute('aria-expanded', 'false');
    };

    hamburger?.addEventListener('click', () => {
        const open = navLinks.classList.toggle('active');
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
    });

    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks?.classList.contains('active')) {
            closeMenu();
            hamburger?.focus();
        }
    });

    // Tapping the page outside an open drawer should close it.
    document.addEventListener('click', (e) => {
        if (!navLinks?.classList.contains('active')) return;
        if (navbar?.contains(e.target)) return;
        closeMenu();
    });

    /* ===== SCROLL SPY =====
       Marks the nav link whose section currently owns the viewport. */
    const navMap = new Map();
    navLinks?.querySelectorAll('a[href^="#"]').forEach(link => {
        const section = document.querySelector(link.getAttribute('href'));
        if (section) navMap.set(section, link);
    });

    if (navMap.size) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const link = navMap.get(entry.target);
                if (!link) return;
                if (entry.isIntersecting) {
                    navMap.forEach(l => l.removeAttribute('aria-current'));
                    link.setAttribute('aria-current', 'true');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        navMap.forEach((_, section) => spy.observe(section));
    }

    /* ===== PALANTIR TERMINAL =====
       Commands mirror what the site actually claims: .NET, containers,
       local inference, the FHIR project. */
    const commands = [
        { cmd: 'dotnet new webapi -n Kadir.Api',        out: '>> Backend forge initialised' },
        { cmd: 'docker compose up -d --build',          out: '>> HAPI FHIR + app running on :3000' },
        { cmd: 'npm test',                              out: '>> 73 passed, 0 failed' },
        { cmd: 'ollama pull mistral-nemo:12b',          out: '>> Model summoned — nothing leaves the machine' },
        { cmd: 'kubectl apply -f deployment.yaml',      out: '>> deployment "one-ring-api" configured' },
        { cmd: 'helm upgrade --install gondor .',       out: '>> Release "gondor" deployed' },
        { cmd: 'az webapp up --runtime DOTNETCORE:8.0', out: '>> Connected to the Cloud Citadel' },
        { cmd: 'git push origin main',                  out: '>> Changes sent across the Shire' },
    ];

    const typedText   = document.getElementById('typed-text');
    const terminalOut = document.getElementById('terminal-output');

    if (typedText && terminalOut) {
        if (prefersReducedMotion()) {
            // No typing loop — show one finished command and stop.
            typedText.textContent   = commands[0].cmd;
            terminalOut.textContent = commands[0].out;
        } else {
            let cmdIndex = 0, charIndex = 0, deleting = false, outputShown = false;

            const type = () => {
                const current = commands[cmdIndex];

                if (!deleting) {
                    typedText.textContent = current.cmd.slice(0, ++charIndex);
                    if (charIndex === current.cmd.length) {
                        if (!outputShown) {
                            outputShown = true;
                            terminalOut.textContent = current.out;
                        }
                        deleting = true;
                        setTimeout(type, 2200);
                        return;
                    }
                    setTimeout(type, 58);
                } else {
                    typedText.textContent = current.cmd.slice(0, --charIndex);
                    if (charIndex === 0) {
                        deleting = false;
                        outputShown = false;
                        terminalOut.textContent = '';
                        cmdIndex = (cmdIndex + 1) % commands.length;
                        setTimeout(type, 480);
                        return;
                    }
                    setTimeout(type, 26);
                }
            };
            type();
        }
    }

    /* ===== EMBER CANVAS ===== */
    const PARTICLE_SPACING = 14;   // px of viewport width per particle
    const MAX_PARTICLES    = 90;
    const FADE_IN_RATIO    = 0.12;
    const FADE_OUT_START   = 0.78;

    const canvas = document.getElementById('particles-canvas');
    const ctx    = canvas?.getContext('2d');

    let particles = [];
    let animFrame = null;

    const accentColour = () =>
        document.documentElement.getAttribute('data-theme') === 'light'
            ? { r: 139, g: 105, b: 20 }
            : { r: 201, g: 144, b: 42 };

    function recolourParticles() {
        const c = accentColour();
        particles.forEach(p => { p.colour = c; });
    }

    const createParticle = () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.45 + 0.08,
        vx: (Math.random() - 0.5) * 0.28,
        vy: -(Math.random() * 0.35 + 0.08),
        life: Math.random() * 200 + 120,
        age: 0,
        colour: accentColour(),
        pulse: Math.random() * Math.PI * 2,
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            p.age++;
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.025;
            p.vx += (Math.random() - 0.5) * 0.008;   // gentle drift

            const ratio = p.age / p.life;
            const fade = ratio < FADE_IN_RATIO
                ? ratio / FADE_IN_RATIO
                : ratio > FADE_OUT_START
                    ? (1 - ratio) / (1 - FADE_OUT_START)
                    : 1;
            const glow  = Math.sin(p.pulse) * 0.25 + 0.75;
            const alpha = p.alpha * fade * glow;

            const { r, g, b } = p.colour;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.fill();

            if (p.age >= p.life || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
                particles[i] = createParticle();
                if (p.y < -10) particles[i].y = canvas.height + 5;   // re-enter from below
            }
        });

        animFrame = requestAnimationFrame(draw);
    }

    function stopParticles() {
        if (animFrame !== null) cancelAnimationFrame(animFrame);
        animFrame = null;
        particles = [];
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function startParticles() {
        if (!canvas || !ctx) return;

        stopParticles();
        if (prefersReducedMotion()) return;   // drifting embers are exactly what that setting means

        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        const count = Math.min(Math.floor(window.innerWidth / PARTICLE_SPACING), MAX_PARTICLES);
        for (let i = 0; i < count; i++) {
            const p = createParticle();
            p.age = Math.random() * p.life;   // stagger, so they don't all die together
            particles.push(p);
        }
        draw();
    }

    // Pause the canvas while the tab is hidden — no point burning a
    // core animating embers nobody is looking at.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopParticles();
        else startParticles();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(startParticles, 150);
    }, { passive: true });

    motionQuery.addEventListener?.('change', startParticles);

    startParticles();

    /* ===== SCROLL REVEAL ===== */
    const revealTargets = document.querySelectorAll('.fade-in');

    if (prefersReducedMotion()) {
        revealTargets.forEach(el => el.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                // Stagger siblings so a grid arrives as a wave, not a slab.
                const siblings = entry.target.parentElement
                    ? Array.from(entry.target.parentElement.querySelectorAll(':scope > .fade-in'))
                    : [];
                const delay = Math.max(0, siblings.indexOf(entry.target)) * 80;

                setTimeout(() => entry.target.classList.add('visible'), delay);
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealTargets.forEach(el => revealObserver.observe(el));
    }
})();
