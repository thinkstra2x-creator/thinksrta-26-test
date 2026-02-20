(function() {
  'use strict';

  const CONFIG = {
    particles: { count: 50, maxCount: 80, connectionDistance: 100, mouseRadius: 120 },
    reveal: { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    // REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID
    googleClientId: '50261442231-nr4knv8jnvvq4obpg9ngd39sf2fns4n1.apps.googleusercontent.com' 
  };

  const EVENTS_DATA = [
    { id: 1, title: "Prompt Engineering", category: "technical", description: "AI Communication.", teamSize: "1", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
    { id: 2, title: "Reverse Engineering", category: "technical", description: "Decode systems.", teamSize: "1-2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>` },
    { id: 3, title: "Paper Presentation", category: "technical", description: "Research presentation.", teamSize: "2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>` },
    { id: 4, title: "AI Quiz", category: "technical", description: "Knowledge test.", teamSize: "1-2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>` },
    { id: 5, title: "Act It Out", category: "nontechnical", description: "Dramatics.", teamSize: "2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>` },
    { id: 6, title: "Chess", category: "nontechnical", description: "Strategy.", teamSize: "1", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 16l-1.447.724a1 1 0 0 0-.553.894V20h12v-2.382"/></svg>` },
    { id: 7, title: "Treasure Hunt", category: "nontechnical", description: "Find clues.", teamSize: "1-2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/></svg>` },
    { id: 8, title: "Gaming", category: "nontechnical", description: "Esports.", teamSize: "1-4", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/></svg>` }
  ];

  const elements = {
    menuToggle: document.getElementById('menuToggle'), mainNav: document.getElementById('mainNav'), mobileOverlay: document.getElementById('mobileOverlay'),
    eventsGrid: document.getElementById('eventsGrid'), filterBtns: document.querySelectorAll('.filter-btn'), particleCanvas: document.getElementById('particle-canvas'),
    loginBtn: document.getElementById('loginBtn'), userProfile: document.getElementById('userProfile'), userImg: document.getElementById('userImg'), userName: document.getElementById('userName'),
    dashboardSection: document.getElementById('dashboard'), dashUserImg: document.getElementById('dashUserImg'), dashUserName: document.getElementById('dashUserName'), dashUserEmail: document.getElementById('dashUserEmail'), dashUserCode: document.getElementById('dashUserCode')
  };

  let googleInitialized = false;
  let isRegistering = false;

  // --- AUTH LOGIC ---
  function initGoogleAuth() {
    checkSession();
    if(elements.loginBtn) elements.loginBtn.addEventListener('click', handleLoginClick);
    attemptGoogleInit();
  }

  function attemptGoogleInit() {
    if (googleInitialized) return true;
    if (typeof google !== 'undefined' && google.accounts) {
      try {
        google.accounts.id.initialize({ client_id: CONFIG.googleClientId, callback: handleGoogleSignIn });
        googleInitialized = true; return true;
      } catch (e) { return false; }
    } return false;
  }

  function handleLoginClick() {
    if (!googleInitialized) if (!attemptGoogleInit()) return;
    try { google.accounts.id.prompt(); } catch (e) { console.error(e); }
  }

  function handleGoogleSignIn(response) {
    const payload = parseJwt(response.credential);
    updateUI(payload);
    localStorage.setItem('thinkstra_user', JSON.stringify(payload));
    if (isRegistering) window.location.href = 'register.html';
  }

  function parseJwt(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  }

  function updateUI(user) {
    if(elements.loginBtn) elements.loginBtn.style.display = 'none';
    if(elements.userProfile) elements.userProfile.style.display = 'flex';
    if(elements.userImg) elements.userImg.src = user.picture;
    if(elements.userName) elements.userName.textContent = user.given_name;
    updateDashboard(user);
  }

  function checkSession() {
    const user = localStorage.getItem('thinkstra_user');
    if (user) { try { updateUI(JSON.parse(user)); } catch(e) { localStorage.removeItem('thinkstra_user'); } }
  }

  window.signOut = function() {
    localStorage.removeItem('thinkstra_user');
    location.reload();
  };

  window.goToRegistration = function() {
    const user = localStorage.getItem('thinkstra_user');
    if (user) window.location.href = 'register.html';
    else { isRegistering = true; alert("Please log in to register."); if (!googleInitialized) attemptGoogleInit(); try { google.accounts.id.prompt(); } catch (e) {} }
  };

  // --- DASHBOARD & TEAM ---
  function updateDashboard(user) {
    const regCode = localStorage.getItem('registration_code');
    if (!regCode) { if(elements.dashboardSection) elements.dashboardSection.style.display = 'none'; return; }
    if(elements.dashboardSection) elements.dashboardSection.style.display = 'block';
    if(elements.dashUserImg) elements.dashUserImg.src = user.picture;
    if(elements.dashUserName) elements.dashUserName.textContent = user.name;
    if(elements.dashUserEmail) elements.dashUserEmail.textContent = user.email;
    if(elements.dashUserCode) elements.dashUserCode.textContent = regCode;
    checkTeamStatus();
  }

  window.copyUserCode = function() { navigator.clipboard.writeText(localStorage.getItem('registration_code')).then(() => alert("Code Copied!")); }

  window.createTeam = function() {
    const name = document.getElementById('teamNameInput').value;
    const user = JSON.parse(localStorage.getItem('thinkstra_user'));
    const code = localStorage.getItem('registration_code');
    if(!name) { alert("Enter a name."); return; }
    localStorage.setItem('team_data', JSON.stringify({ name: name, leader: user.name, code: code, members: [{name: user.name, code: code}] }));
    alert("Team Created!"); checkTeamStatus();
  }

  window.joinTeam = function() {
    const code = document.getElementById('joinCodeInput').value;
    const user = JSON.parse(localStorage.getItem('thinkstra_user'));
    const myCode = localStorage.getItem('registration_code');
    if(!code) { alert("Enter code."); return; }
    localStorage.setItem('team_data', JSON.stringify({ name: "Joined Team", leaderCode: code, members: [{name: user.name, code: myCode}] }));
    alert("Joined Team! (Simulated)"); checkTeamStatus();
  }

  function checkTeamStatus() {
    const data = JSON.parse(localStorage.getItem('team_data'));
    const createF = document.getElementById('teamCreateForm'); const joinS = document.getElementById('joinTeamSection'); const view = document.getElementById('teamView');
    if (data) {
      if(createF) createF.style.display = 'none'; if(joinS) joinS.style.display = 'none'; if(view) view.style.display = 'block';
      document.getElementById('currentTeamName').textContent = data.name;
      document.getElementById('teamMembersList').innerHTML = data.members.map(m => `<li>${m.name} <span class="code-small">(${m.code})</span></li>`).join('');
    } else { if(createF) createF.style.display = 'block'; if(joinS) joinS.style.display = 'block'; if(view) view.style.display = 'none'; }
  }

  window.leaveTeam = function() { localStorage.removeItem('team_data'); alert("Left team."); checkTeamStatus(); };

  // --- UI RENDERING ---
  function initEvents() {
    if (!elements.eventsGrid) return;
    renderEvents('all');
    elements.filterBtns.forEach(btn => btn.addEventListener('click', () => { elements.filterBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderEvents(btn.dataset.filter); }));
  }
  function renderEvents(filter) {
    const filtered = filter === 'all' ? EVENTS_DATA : EVENTS_DATA.filter(e => e.category === filter);
    elements.eventsGrid.innerHTML = filtered.map((e, i) => `<article class="event-card animate-reveal delay-${(i%4)+1}"><div class="event-icon">${e.icon}</div><h3 class="event-title">${e.title}</h3><p class="event-desc">${e.description}</p></article>`).join('');
    initScrollReveal();
  }
  function initScrollReveal() { document.querySelectorAll('.animate-reveal:not(.revealed)').forEach(el => new IntersectionObserver((es)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');}}).observe(el),CONFIG)); }
  
  function initParticles() {
    const cv = elements.particleCanvas; if(!cv) return; const cx = cv.getContext('2d'); if(!cx) return;
    if(window.innerWidth < 768) return; let pts=[]; let m={x:null,y:null};
    const rs=()=>{cv.width=innerWidth;cv.height=innerHeight;pts=[];for(let i=0;i<60;i++)pts.push({x:Math.random()*cv.w,y:Math.random()*cv.h,vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5,r:Math.random()*1.5+0.5,o:Math.random()*0.4+0.2});};
    const dr=()=>{cx.clearRect(0,0,cv.w,cv.h);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(m.x){let d=Math.hypot(m.x-p.x,m.y-p.y);if(d<100){p.x-=(m.x-p.x)*0.02;p.y-=(m.y-p.y)*0.02;}}if(p.x<0)p.x=cv.w;if(p.x>cv.w)p.x=0;if(p.y<0)p.y=cv.h;if(p.y>cv.h)p.y=0;cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fillStyle=`rgba(0,229,199,${p.o})`;cx.fill();});requestAnimationFrame(dr);};
    onresize=rs;onmousemove=e=>{m.x=e.clientX;m.y=e.clientY;};rs();dr();
  }
  function initMobileNav() {
    if(!elements.menuToggle) return;
    elements.menuToggle.onclick=()=>{elements.mainNav.classList.toggle('active');elements.mobileOverlay.classList.toggle('active');};
    elements.mobileOverlay.onclick=()=>{elements.mainNav.classList.remove('active');elements.mobileOverlay.classList.remove('active');};
  }

  function init() { initGoogleAuth(); initMobileNav(); initEvents(); initScrollReveal(); initParticles(); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();