/**
 * THINKSTRA '26 - Backend Enabled with Firebase
 */
(function() {
  'use strict';

  // ========================================
  // 1. FIREBASE CONFIGURATION
  // ========================================
  // TODO: PASTE YOUR CONFIG OBJECT HERE FROM FIREBASE CONSOLE
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // ========================================
  // 2. APP CONFIGURATION
  // ========================================
  const CONFIG = {
    particles: { count: 50, maxCount: 80, connectionDistance: 100, mouseRadius: 120 },
    reveal: { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    googleClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com' 
  };

  const EVENTS_DATA = [ /* ... (Keep your existing events data here) ... */ 
    { id: 1, title: "Prompt Engineering", category: "technical", description: "AI Comm.", teamSize: "1", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
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
  let currentUser = null; // Store user object globally

  // ========================================
  // 3. AUTH LOGIC
  // ========================================
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
    currentUser = user;
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

  // ========================================
  // 4. DASHBOARD & TEAM (FIRESTORE)
  // ========================================
  
  // Variable to hold the real-time listener unsubscribe function
  let teamUnsubscribe = null;

  function updateDashboard(user) {
    const regCode = localStorage.getItem('registration_code');
    if (!regCode) { if(elements.dashboardSection) elements.dashboardSection.style.display = 'none'; return; }
    
    if(elements.dashboardSection) elements.dashboardSection.style.display = 'block';
    if(elements.dashUserImg) elements.dashUserImg.src = user.picture;
    if(elements.dashUserName) elements.dashUserName.textContent = user.name;
    if(elements.dashUserEmail) elements.dashUserEmail.textContent = user.email;
    if(elements.dashUserCode) elements.dashUserCode.textContent = regCode;

    // Listen for team updates in real-time
    listenForTeamChanges();
  }

  window.copyUserCode = function() { navigator.clipboard.writeText(localStorage.getItem('registration_code')).then(() => alert("Code Copied!")); }

  window.createTeam = async function() {
    const teamName = document.getElementById('teamNameInput').value;
    if(!teamName) { alert("Enter a name."); return; }
    
    const code = localStorage.getItem('registration_code');
    
    try {
      // Save to Firestore
      await db.collection('teams').doc(code).set({
        name: teamName,
        leader: currentUser.name,
        code: code,
        members: [ { name: currentUser.name, code: code } ],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Save locally for quick UI update
      localStorage.setItem('team_data', JSON.stringify({ name: teamName, leader: currentUser.name, code: code }));
      alert("Team Created!");
    } catch (error) {
      console.error("Error creating team: ", error);
      alert("Error creating team. Check console.");
    }
  }

  window.joinTeam = async function() {
    const joinCode = document.getElementById('joinCodeInput').value;
    const myCode = localStorage.getItem('registration_code');
    if(!joinCode) { alert("Enter code."); return; }

    try {
      // Reference to the team document
      const teamRef = db.collection('teams').doc(joinCode);
      const doc = await teamRef.get();

      if (!doc.exists) {
        alert("Team not found! Ask leader for correct code.");
        return;
      }

      // Add yourself to the members array
      await teamRef.update({
        members: firebase.firestore.FieldValue.arrayUnion({ name: currentUser.name, code: myCode })
      });

      // Update local storage
      const teamData = doc.data();
      localStorage.setItem('team_data', JSON.stringify({ name: teamData.name, leaderCode: joinCode }));
      
      alert("Joined successfully!");
      listenForTeamChanges(); // Restart listener for the new team
    } catch (error) {
      console.error("Error joining team: ", error);
      alert("Error joining team.");
    }
  }

  function listenForTeamChanges() {
    // Stop previous listener if exists
    if (teamUnsubscribe) teamUnsubscribe();

    const code = localStorage.getItem('registration_code');
    // We need to find which team we are in. 
    // For simplicity, we check local storage first to see if we created/joined
    const localTeam = JSON.parse(localStorage.getItem('team_data'));
    const teamId = localTeam ? (localTeam.code || localTeam.leaderCode) : code;

    // Real-time listener
    teamUnsubscribe = db.collection('teams').doc(teamId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          renderTeamView(doc.data());
        } else {
          // No team found, reset UI
          renderNoTeam();
        }
      }, (error) => {
        console.error("Error listening to team: ", error);
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

  window.leaveTeam = async function() {
    // Note: Leaving logic requires removing yourself from the DB array
    // For simplicity, we just clear local data for now.
    localStorage.removeItem('team_data');
    renderNoTeam();
    alert("You have left the team view. (Note: Data remains on server)");
  }

  // ========================================
  // 5. UI RENDERING (Standard)
  // ========================================
  function initEvents() { /* ... same as before ... */ 
    if (!elements.eventsGrid) return;
    renderEvents('all');
    elements.filterBtns.forEach(btn => btn.addEventListener('click', () => { elements.filterBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderEvents(btn.dataset.filter); }));
  }
  function renderEvents(filter) { /* ... same as before ... */ 
    const filtered = filter === 'all' ? EVENTS_DATA : EVENTS_DATA.filter(e => e.category === filter);
    elements.eventsGrid.innerHTML = filtered.map((e, i) => `<article class="event-card animate-reveal delay-${(i%4)+1}"><div class="event-icon">${e.icon}</div><h3 class="event-title">${e.title}</h3><p class="event-desc">${e.description}</p></article>`).join('');
    initScrollReveal();
  }
  function initScrollReveal() { document.querySelectorAll('.animate-reveal:not(.revealed)').forEach(el => new IntersectionObserver((es)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');}}),CONFIG).observe(el)); }
  function initParticles() { /* ... same as before ... */ }
  function initMobileNav() { /* ... same as before ... */ }

  function init() {
    initGoogleAuth();
    initMobileNav();
    initEvents();
    initScrollReveal();
    initParticles();
  }
  
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();