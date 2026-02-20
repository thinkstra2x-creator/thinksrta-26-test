/**
 * THINKSTRA '26 - Firebase Integrated Script
 */
(function() {
  'use strict';

  // ========================================
  // 1. FIREBASE CONFIGURATION
  // ========================================
  // TODO: REPLACE THE PLACEHOLDER BELOW WITH YOUR ACTUAL FIREBASE CONFIG
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Initialize Firebase
  try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase Initialized");
  } catch (e) {
    console.error("Firebase Init Error", e);
  }
  
  const db = firebase.firestore();

  // ========================================
  // 2. APP CONFIGURATION
  // ========================================
  const CONFIG = {
    particles: { count: 50, maxCount: 80, connectionDistance: 100, mouseRadius: 120 },
    reveal: { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' 
  };

  const EVENTS_DATA = [
    { id: 1, title: "Prompt Engineering", category: "technical", description: "AI Communication.", teamSize: "1", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
    { id: 2, title: "Reverse Engineering", category: "technical", description: "Decode.", teamSize: "1-2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>` },
    { id: 3, title: "Paper Presentation", category: "technical", description: "Research.", teamSize: "2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>` },
    { id: 4, title: "AI Quiz", category: "technical", description: "Knowledge.", teamSize: "1-2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>` },
    { id: 5, title: "Act It Out", category: "nontechnical", description: "Drama.", teamSize: "2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>` },
    { id: 6, title: "Chess", category: "nontechnical", description: "Strategy.", teamSize: "1", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 16l-1.447.724a1 1 0 0 0-.553.894V20h12v-2.382"/></svg>` },
    { id: 7, title: "Treasure Hunt", category: "nontechnical", description: "Clues.", teamSize: "1-2", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/></svg>` },
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
  let currentUser = null; 
  let teamUnsubscribe = null;

  // ========================================
  // 3. AUTH LOGIC
  // ========================================
  function initGoogleAuth() {
    checkSession(); // Load user immediately
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
    currentUser = payload;
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
    currentUser = user; // Ensure global variable is set
    if(elements.loginBtn) elements.loginBtn.style.display = 'none';
    if(elements.userProfile) elements.userProfile.style.display = 'flex';
    if(elements.userImg) elements.userImg.src = user.picture;
    if(elements.userName) elements.userName.textContent = user.given_name;
    updateDashboard(user);
  }

  function checkSession() {
    const user = localStorage.getItem('thinkstra_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        currentUser = userData; // SET GLOBAL VARIABLE ON PAGE LOAD
        updateUI(userData);
      } catch(e) { localStorage.removeItem('thinkstra_user'); }
    }
  }

  window.signOut = function() {
    localStorage.removeItem('thinkstra_user');
    localStorage.removeItem('team_data');
    localStorage.removeItem('registration_code');
    location.reload();
  };

  window.goToRegistration = function() {
    const user = localStorage.getItem('thinkstra_user');
    if (user) window.location.href = 'register.html';
    else { isRegistering = true; alert("Please log in to register."); if (!googleInitialized) attemptGoogleInit(); try { google.accounts.id.prompt(); } catch (e) {} }
  };

  // ========================================
  // 4. DASHBOARD & TEAM (FIRESTORE)
  // ========================================
  
  function updateDashboard(user) {
    const regCode = localStorage.getItem('registration_code');
    if (!regCode) { if(elements.dashboardSection) elements.dashboardSection.style.display = 'none'; return; }
    
    if(elements.dashboardSection) elements.dashboardSection.style.display = 'block';
    if(elements.dashUserImg) elements.dashUserImg.src = user.picture;
    if(elements.dashUserName) elements.dashUserName.textContent = user.name;
    if(elements.dashUserEmail) elements.dashUserEmail.textContent = user.email;
    if(elements.dashUserCode) elements.dashUserCode.textContent = regCode;

    listenForTeamChanges();
  }

  window.copyUserCode = function() { navigator.clipboard.writeText(localStorage.getItem('registration_code')).then(() => alert("Code Copied!")); }

  window.createTeam = async function() {
    // 1. Safety Check
    if (!currentUser) { alert("User not loaded. Please refresh or login again."); return; }
    
    const teamName = document.getElementById('teamNameInput').value;
    if(!teamName) { alert("Enter a team name."); return; }
    
    const code = localStorage.getItem('registration_code');
    if(!code) { alert("Registration code missing. Please register first."); return; }

    try {
      // 2. Save to Firestore
      await db.collection('teams').doc(code).set({
        name: teamName,
        leader: currentUser.name,
        code: code,
        members: [ { name: currentUser.name, code: code } ],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // 3. Update Local UI instantly
      localStorage.setItem('team_data', JSON.stringify({ name: teamName, leader: currentUser.name, code: code }));
      alert("Team Created Successfully!");
      // The onSnapshot listener will handle the UI update automatically, but we force it just in case
      renderTeamView({ name: teamName, members: [{ name: currentUser.name, code: code }] });
      
    } catch (error) {
      console.error("Error creating team: ", error);
      alert("Error creating team: " + error.message);
    }
  }

  window.joinTeam = async function() {
    const joinCode = document.getElementById('joinCodeInput').value;
    const myCode = localStorage.getItem('registration_code');
    if(!joinCode) { alert("Enter code."); return; }
    
    if (!currentUser) { alert("User not loaded."); return; }

    try {
      const teamRef = db.collection('teams').doc(joinCode);
      const doc = await teamRef.get();

      if (!doc.exists) { alert("Team not found!"); return; }

      await teamRef.update({
        members: firebase.firestore.FieldValue.arrayUnion({ name: currentUser.name, code: myCode })
      });

      const teamData = doc.data();
      localStorage.setItem('team_data', JSON.stringify({ name: teamData.name, leaderCode: joinCode }));
      
      alert("Joined successfully!");
      listenForTeamChanges(); 
    } catch (error) {
      console.error("Error joining team: ", error);
      alert("Error joining team: " + error.message);
    }
  }

  function listenForTeamChanges() {
    if (teamUnsubscribe) teamUnsubscribe();

    const localTeam = JSON.parse(localStorage.getItem('team_data'));
    const regCode = localStorage.getItem('registration_code');
    
    // Determine Team ID (either leader code or joined code)
    let teamId = null;
    if (localTeam) {
       teamId = localTeam.code || localTeam.leaderCode;
    } else if (regCode) {
       teamId = regCode;
    }

    if (!teamId) { renderNoTeam(); return; }

    // Real-time listener
    teamUnsubscribe = db.collection('teams').doc(teamId)
      .onSnapshot((doc) => {
        if (doc.exists) renderTeamView(doc.data());
        else renderNoTeam();
      }, (error) => {
        console.error("Error listening to team: ", error);
        renderNoTeam();
      });
  }

  function renderTeamView(data) {
    const createForm = document.getElementById('teamCreateForm');
    const joinSection = document.getElementById('joinTeamSection');
    const teamView = document.getElementById('teamView');

    if(createForm) createForm.style.display = 'none';
    if(joinSection) joinSection.style.display = 'none';
    if(teamView) teamView.style.display = 'block';

    document.getElementById('currentTeamName').textContent = data.name;
    
    const list = document.getElementById('teamMembersList');
    if(data.members && data.members.length > 0) {
       list.innerHTML = data.members.map(m => `<li>${m.name} <span class="code-small">(${m.code})</span></li>`).join('');
    } else {
       list.innerHTML = "<li>No members</li>";
    }
  }

  function renderNoTeam() {
    const createForm = document.getElementById('teamCreateForm');
    const joinSection = document.getElementById('joinTeamSection');
    const teamView = document.getElementById('teamView');
    if(createForm) createForm.style.display = 'block';
    if(joinSection) joinSection.style.display = 'block';
    if(teamView) teamView.style.display = 'none';
  }

  window.leaveTeam = function() {
    localStorage.removeItem('team_data');
    renderNoTeam();
    alert("You have left the team view.");
  }

  // ========================================
  // 5. UI RENDERING
  // ========================================
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
  
  function initScrollReveal() { 
    document.querySelectorAll('.animate-reveal:not(.revealed)').forEach(el => {
      const obs = new IntersectionObserver((es) => {
        es.forEach(e => { if(e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
      }, CONFIG);
      obs.observe(el);
    }); 
  }

  function initParticles() {
    const cv = elements.particleCanvas; if(!cv) return; const cx = cv.getContext('2d'); if(!cx) return;
    if(window.innerWidth < 768) return; let pts=[]; let m={x:null,y:null};
    const rs=()=>{cv.width=innerWidth;cv.height=innerHeight;pts=[];for(let i=0;i<60;i++)pts.push({x:Math.random()*cv.width,y:Math.random()*cv.height,vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5,r:Math.random()*1.5+0.5,o:Math.random()*0.4+0.2});};
    const dr=()=>{cx.clearRect(0,0,cv.width,cv.height);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(m.x){let d=Math.hypot(m.x-p.x,m.y-p.y);if(d<100){p.x-=(m.x-p.x)*0.02;p.y-=(m.y-p.y)*0.02;}}if(p.x<0)p.x=cv.width;if(p.x>cv.width)p.x=0;if(p.y<0)p.y=cv.height;if(p.y>cv.height)p.y=0;cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fillStyle=`rgba(0,229,199,${p.o})`;cx.fill();});requestAnimationFrame(dr);};
    onresize=rs;onmousemove=e=>{m.x=e.clientX;m.y=e.clientY;};rs();dr();
  }
  
  function initMobileNav() {
    if(!elements.menuToggle) return;
    elements.menuToggle.onclick=()=>{elements.mainNav.classList.toggle('active');elements.mobileOverlay.classList.toggle('active');};
    elements.mobileOverlay.onclick=()=>{elements.mainNav.classList.remove('active');elements.mobileOverlay.classList.remove('active');};
  }

  function init() {
    initGoogleAuth();
    initMobileNav();
    initEvents();
    initScrollReveal();
    initParticles();
  }
  
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();