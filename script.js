/**
 * THINKSTRA '26 - Main Script (Fixed)
 */
(function() {
  'use strict';

  // ========================================
  // Configuration
  // ========================================
  const CONFIG = {
    particles: { count: 50, maxCount: 80, connectionDistance: 100, mouseRadius: 120 },
    reveal: { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    googleClientId: '50261442231-nr4knv8jnvvq4obpg9ngd39sf2fns4n1.apps.googleusercontent.com'
  };

  const EVENTS_DATA = [
    { id: 1, title: "Prompt Engineering", category: "technical", description: "Master AI communication.", teamSize: "1", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
    { id: 2, title: "Reverse Engineering", category: "technical", description: "Decode software systems.", teamSize: "1-2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>` },
    { id: 3, title: "Paper Presentation", category: "technical", description: "Present research.", teamSize: "2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>` },
    { id: 4, title: "AI Quiz", category: "technical", description: "Test your knowledge.", teamSize: "1-2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>` },
    { id: 5, title: "Act It Out", category: "nontechnical", description: "Dramatic skills.", teamSize: "2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>` },
    { id: 6, title: "Chess", category: "nontechnical", description: "Strategic battle.", teamSize: "1", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 16l-1.447.724a1 1 0 0 0-.553.894V20h12v-2.382"/></svg>` },
    { id: 7, title: "Chase The Clues", category: "nontechnical", description: "Treasure hunt.", teamSize: "1-2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/></svg>` },
    { id: 8, title: "Link-It", category: "nontechnical", description: "Connect the dots.", teamSize: "1-2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/></svg>` }
  ];

  // ========================================
  // DOM Elements
  // ========================================
  const elements = {
    menuToggle: document.getElementById('menuToggle'),
    mainNav: document.getElementById('mainNav'),
    mobileOverlay: document.getElementById('mobileOverlay'),
    eventsGrid: document.getElementById('eventsGrid'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    particleCanvas: document.getElementById('particle-canvas'),
    loginBtn: document.getElementById('loginBtn'),
    userProfile: document.getElementById('userProfile'),
    userImg: document.getElementById('userImg'),
    userName: document.getElementById('userName'),
    dashboardSection: document.getElementById('dashboard'),
    dashUserImg: document.getElementById('dashUserImg'),
    dashUserName: document.getElementById('dashUserName'),
    dashUserEmail: document.getElementById('dashUserEmail'),
    dashUserCode: document.getElementById('dashUserCode')
  };

  // ========================================
  // Google Login Logic
  // ========================================
  let googleInitialized = false;
  let isRegistering = false;

  function initGoogleAuth() {
    checkExistingSession();
    if (elements.loginBtn) elements.loginBtn.addEventListener('click', handleLoginClick);
    attemptGoogleInit();
  }

  function attemptGoogleInit() {
    if (googleInitialized) return true;
    if (typeof google !== 'undefined' && google.accounts) {
      try {
        google.accounts.id.initialize({
          client_id: CONFIG.googleClientId,
          callback: handleGoogleSignIn
        });
        googleInitialized = true;
        return true;
      } catch (e) { return false; }
    }
    return false;
  }

  function handleLoginClick() {
    if (window.location.protocol === 'file:') { alert("Use Live Server."); return; }
    if (!googleInitialized) if (!attemptGoogleInit()) return;
    try { google.accounts.id.prompt(); } catch (e) { console.error(e); }
  }

  function handleGoogleSignIn(response) {
    const payload = parseJwt(response.credential);
    updateUIForUser(payload);
    localStorage.setItem('thinkstra_user', JSON.stringify(payload));
    if (isRegistering) window.location.href = 'register.html';
  }

  function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  function updateUIForUser(user) {
    if(elements.loginBtn) elements.loginBtn.style.display = 'none';
    if(elements.userProfile) elements.userProfile.style.display = 'flex';
    if(elements.userImg) elements.userImg.src = user.picture;
    if(elements.userName) elements.userName.textContent = user.given_name;
    updateDashboard(user);
  }

  window.signOut = function() {
    localStorage.removeItem('thinkstra_user');
    location.reload();
  }

  // ========================================
  // DASHBOARD & TEAM LOGIC
  // ========================================
  function updateDashboard(user) {
    const regCode = localStorage.getItem('registration_code');
    if (!regCode) {
      if(elements.dashboardSection) elements.dashboardSection.style.display = 'none';
      return;
    }

    if(elements.dashboardSection) elements.dashboardSection.style.display = 'block';
    if(elements.dashUserImg) elements.dashUserImg.src = user.picture;
    if(elements.dashUserName) elements.dashUserName.textContent = user.name;
    if(elements.dashUserEmail) elements.dashUserEmail.textContent = user.email;
    if(elements.dashUserCode) elements.dashUserCode.textContent = regCode;
    checkTeamStatus();
  }

  window.copyUserCode = function() {
    const code = localStorage.getItem('registration_code');
    navigator.clipboard.writeText(code).then(() => alert("Code Copied!"));
  }

  window.createTeam = function() {
    const teamName = document.getElementById('teamNameInput').value;
    const user = JSON.parse(localStorage.getItem('thinkstra_user'));
    const code = localStorage.getItem('registration_code');
    if(!teamName) { alert("Enter team name."); return; }
    const teamData = { name: teamName, leader: user.name, leaderCode: code, members: [{ name: user.name, code: code }] };
    localStorage.setItem('team_data', JSON.stringify(teamData));
    alert("Team Created!");
    checkTeamStatus();
  }

  window.joinTeam = function() {
    const joinCode = document.getElementById('joinCodeInput').value;
    const user = JSON.parse(localStorage.getItem('thinkstra_user'));
    const myCode = localStorage.getItem('registration_code');
    if(!joinCode) { alert("Enter code."); return; }
    const teamData = { name: "Joined Team", leaderCode: joinCode, members: [{ name: user.name, code: myCode }], isJoined: true };
    localStorage.setItem('team_data', JSON.stringify(teamData));
    alert("Team Joined! (Simulated)");
    checkTeamStatus();
  }

  function checkTeamStatus() {
    const teamData = JSON.parse(localStorage.getItem('team_data'));
    const createForm = document.getElementById('teamCreateForm');
    const joinSection = document.getElementById('joinTeamSection');
    const teamView = document.getElementById('teamView');

    if (teamData) {
      if(createForm) createForm.style.display = 'none';
      if(joinSection) joinSection.style.display = 'none';
      if(teamView) teamView.style.display = 'block';
      document.getElementById('currentTeamName').textContent = teamData.name;
      const list = document.getElementById('teamMembersList');
      list.innerHTML = teamData.members.map(m => `<li>${m.name} <span class="code-small">(${m.code})</span></li>`).join('');
    } else {
      if(createForm) createForm.style.display = 'block';
      if(joinSection) joinSection.style.display = 'block';
      if(teamView) teamView.style.display = 'none';
    }
  }

  window.leaveTeam = function() {
    localStorage.removeItem('team_data');
    alert("Left team.");
    checkTeamStatus();
  }

  // ========================================
  // Registration Check
  // ========================================
  window.goToRegistration = function() {
    const user = localStorage.getItem('thinkstra_user');
    if (user) {
      window.location.href = 'register.html';
    } else {
      isRegistering = true;
      alert("Please log in to register.");
      if (!googleInitialized) attemptGoogleInit();
      try { google.accounts.id.prompt(); } catch (e) {}
    }
  }

  // ========================================
  // Core UI Functions
  // ========================================
  function initMobileNav() {
    const { menuToggle, mainNav, mobileOverlay } = elements;
    if (!menuToggle || !mainNav) return;
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
      mobileOverlay?.classList.toggle('active');
    });
    mobileOverlay?.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mainNav.classList.remove('active');
      mobileOverlay.classList.remove('active');
    });
  }

  function initEvents() {
    if (!elements.eventsGrid) return;
    renderEvents('all');
    elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderEvents(btn.dataset.filter);
      });
    });
  }

  function renderEvents(filter) {
    if (!elements.eventsGrid) return;
    const filtered = filter === 'all' ? EVENTS_DATA : EVENTS_DATA.filter(e => e.category === filter);
    elements.eventsGrid.innerHTML = filtered.map((event, index) => `
      <article class="event-card animate-reveal delay-${(index % 4) + 1}">
        <div class="event-icon">${event.icon}</div>
        <h3 class="event-title">${event.title}</h3>
        <p class="event-desc">${event.description}</p>
        <div class="event-meta">
          <span class="event-meta-item">${event.teamSize} Member(s)</span>
        </div>
      </article>
    `).join('');
    initScrollReveal();
  }

  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.animate-reveal:not(.revealed)');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, CONFIG.reveal);
      revealElements.forEach(el => observer.observe(el));
    } else { revealElements.forEach(el => el.classList.add('revealed')); }
  }

  function initParticles() {
    const canvas = elements.particleCanvas; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768) { canvas.style.display = 'none'; return; }
    let particles = []; let mouse = { x: null, y: null };
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticleArray(); }
    function initParticleArray() {
      particles = [];
      const count = Math.min(CONFIG.particles.maxCount, Math.floor((canvas.width * canvas.height) / 20000));
      for (let i = 0; i < count; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, radius: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.4 + 0.2 });
    }
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (mouse.x !== null) { const dx = mouse.x - p.x; const dy = mouse.y - p.y; const dist = Math.sqrt(dx*dx + dy*dy); if (dist < CONFIG.particles.mouseRadius) { p.x -= dx * 0.02; p.y -= dy * 0.02; } }
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0; if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(0, 229, 199, ${p.opacity})`; ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    resize(); animate();
  }

  function checkExistingSession() {
    const user = localStorage.getItem('thinkstra_user');
    if (user) { try { updateUIForUser(JSON.parse(user)); } catch(e) { localStorage.removeItem('thinkstra_user'); } }
  }

  function init() {
    initGoogleAuth();
    initMobileNav();
    initEvents();
    initScrollReveal();
    initParticles();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();