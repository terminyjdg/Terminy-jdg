import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOImxllmaeFdgRnVNZz2eelwQtnYqJIdc",
  authDomain: "terminy-jdg.firebaseapp.com",
  projectId: "terminy-jdg",
  storageBucket: "terminy-jdg.firebasestorage.app",
  messagingSenderId: "572109992539",
  appId: "1:572109992539:web:fab9aaa03ea2a1ffd6857e",
  measurementId: "G-VFMYDX44MH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- BOGATSZE SŁOWNIKI SŁÓW Z PROSTYMI SZABLONAMI SVG ---
const slowa = {
  'R': [ 
    { image: '🦀', word: 'RAK', svg: '<path d="M 50 100 Q 100 50 150 100 M 50 120 Q 100 170 150 120 M 80 80 L 40 40 M 120 80 L 160 40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🚲', word: 'ROWER', svg: '<circle cx="50" cy="100" r="30" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="150" cy="100" r="30" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><path d="M 50 100 L 100 60 L 150 100" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🐟', word: 'RYBA', svg: '<path d="M 50 100 Q 100 50 150 100 Q 100 150 50 100 M 150 100 L 180 80 L 180 120 Z" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🌹', word: 'RÓŻA', svg: '<path d="M 100 50 Q 150 50 150 100 Q 150 150 100 150 Q 50 150 50 100 Q 50 50 100 50 M 100 50 Q 120 100 100 150 M 100 150 L 100 190 M 100 180 L 80 160 M 100 170 L 120 150" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🦊', word: 'RYŚ', svg: '<path d="M 80 80 L 50 50 L 60 90 M 120 80 L 150 50 L 140 90 M 60 90 Q 100 150 140 90 M 80 110 Q 100 130 120 110 M 100 130 L 100 170" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🥕', word: 'MARCHEWKA', svg: '<path d="M 100 40 Q 140 100 100 160 Q 60 100 100 40 M 100 40 L 80 20 M 100 40 L 120 20" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }
  ],
  'S': [ 
    { image: '🦉', word: 'SOWA', svg: '<circle cx="100" cy="100" r="50" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="80" cy="90" r="10" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="120" cy="90" r="10" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><path d="M 90 120 L 110 120 L 100 130 Z" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🧀', word: 'SER', svg: '<polygon points="50,150 150,150 150,100 100,50 50,100" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="100" cy="120" r="10" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '☀️', word: 'SŁOŃCE', svg: '<circle cx="100" cy="100" r="40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><path d="M 100 40 L 100 20 M 100 160 L 100 180 M 40 100 L 20 100 M 160 100 L 180 100 M 60 60 L 40 40 M 140 140 L 160 160 M 60 140 L 40 160 M 140 60 L 160 40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🐘', word: 'SŁOŃ', svg: '<circle cx="100" cy="100" r="50" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><path d="M 60 100 Q 30 120 50 160 M 140 100 Q 170 120 150 160 M 100 150 L 100 180 M 80 180 L 120 180" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🌲', word: 'SOSNA', svg: '<polygon points="100,20 140,80 60,80 100,20" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><polygon points="100,60 160,130 40,130 100,60" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><rect x="90" y="130" width="20" height="40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🍎', word: 'SOK', svg: '<path d="M 80 50 L 80 150 L 120 150 L 120 50 Z" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><path d="M 80 50 L 120 50 L 120 80 L 80 80 Z" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }
  ],
  'C': [ 
    { image: '🧅', word: 'CEBULA', svg: '<path d="M 100 50 Q 150 100 100 150 Q 50 100 100 50 M 100 50 L 100 20 M 100 50 L 80 30 M 100 50 L 120 30" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🍋', word: 'CYTRYNA', svg: '<ellipse cx="100" cy="100" rx="60" ry="40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><path d="M 40 100 L 20 80 M 160 100 L 180 120" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🎯', word: 'CEL', svg: '<circle cx="100" cy="100" r="60" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="100" cy="100" r="40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="100" cy="100" r="20" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🌷', word: 'CUKIER', svg: '<path d="M 100 80 Q 150 50 150 100 Q 150 150 100 120 Q 50 150 50 100 Q 50 50 100 80 Z M 100 120 L 100 180" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🍪', word: 'CIASTKO', svg: '<circle cx="100" cy="100" r="60" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="80" cy="80" r="5" stroke="black" stroke-width="2" fill="none"/><circle cx="120" cy="90" r="5" stroke="black" stroke-width="2" fill="none"/><circle cx="90" cy="120" r="5" stroke="black" stroke-width="2" fill="none"/>' },
    { image: '🧹', word: 'CIASTO', svg: '<path d="M 40 150 L 160 50 M 120 90 L 160 130 M 140 70 L 180 110" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }
  ],
  'L': [ 
    { image: '🦁', word: 'LEW', svg: '<circle cx="100" cy="100" r="40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><path d="M 100 60 L 100 40 M 100 140 L 100 160 M 60 100 L 40 100 M 140 100 L 160 100 M 75 75 L 50 50 M 125 125 L 150 150 M 75 125 L 50 150 M 125 75 L 150 50" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🪆', word: 'LALKA', svg: '<circle cx="100" cy="70" r="30" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><path d="M 100 100 L 100 150 M 70 130 L 130 130 M 100 150 L 80 190 M 100 150 L 120 190" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🍦', word: 'LODY', svg: '<path d="M 80 100 L 120 100 L 100 180 Z M 80 100 Q 100 50 120 100" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }, 
    { image: '🌲', word: 'LAS', svg: '<polygon points="100,20 140,80 60,80 100,20" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><polygon points="100,60 160,130 40,130 100,60" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><rect x="90" y="130" width="20" height="40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🛏️', word: 'ŁÓŻKO', svg: '<rect x="50" y="100" width="100" height="50" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><rect x="50" y="80" width="30" height="20" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🥄', word: 'ŁYŻKA', svg: '<ellipse cx="100" cy="60" rx="20" ry="30" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><path d="M 100 90 L 100 180" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }
  ],
  'SZ': [ 
    { image: '🧣', word: 'SZALIK', svg: '<path d="M 60 50 Q 100 100 60 150 M 140 50 Q 100 100 140 150 M 60 50 L 140 50 M 60 150 L 140 150" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🐱', word: 'KOT', svg: '<circle cx="100" cy="100" r="40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><polygon points="70,70 50,40 80,60" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><polygon points="130,70 150,40 120,60" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🍎', word: 'GRUSZKA', svg: '<path d="M 100 60 Q 120 60 120 90 Q 140 120 120 150 Q 100 170 80 150 Q 60 120 80 90 Q 80 60 100 60 Z M 100 60 L 100 40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🚌', word: 'AUTOBUS', svg: '<rect x="40" y="50" width="120" height="80" rx="10" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="70" cy="140" r="15" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="130" cy="140" r="15" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }
  ],
  'Ż': [ 
    { image: '🐸', word: 'ŻABA', svg: '<circle cx="100" cy="100" r="40" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="70" cy="80" r="15" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/><circle cx="130" cy="80" r="15" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🦒', word: 'ŻYRAFA', svg: '<path d="M 80 120 L 80 50 L 120 30 L 120 120 M 80 120 L 60 180 M 120 120 L 140 180" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🍞', word: 'ŻYTNI', svg: '<path d="M 60 60 Q 100 40 140 60 L 140 140 Q 100 160 60 140 Z" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' },
    { image: '🔥', word: 'ŻAR', svg: '<path d="M 100 40 Q 140 80 120 120 Q 100 160 80 120 Q 60 80 100 40 Z" stroke="black" stroke-width="4" fill="none" stroke-dasharray="8,8"/>' }
  ]
};

let aktualnaGloska = 'R';
let aktualneSlowoIndex = 0;
let gwiazdki = 0;
let recognition = null;
let timeoutId = null;
let aktualnyUzytkownik = null;
let czySlowoZaliczone = false;
let historiaCwiczen = {};

// --- FUNKCJE BAZY DANYCH ---
async function zapiszDaneDoBazy() {
  if (aktualnyUzytkownik) {
    try {
      await setDoc(doc(db, "users", aktualnyUzytkownik.uid), {
        gwiazdki: gwiazdki,
        email: aktualnyUzytkownik.email,
        historia: historiaCwiczen
      }, { merge: true });
    } catch (e) {
      console.error("Błąd zapisu do bazy:", e);
    }
  }
}

async function wczytajDaneZbazy() {
  if (aktualnyUzytkownik) {
    try {
      const docSnap = await getDoc(doc(db, "users", aktualnyUzytkownik.uid));
      if (docSnap.exists()) {
        const dane = docSnap.data();
        gwiazdki = dane.gwiazdki || 0;
        historiaCwiczen = dane.historia || {};
      } else {
        gwiazdki = 0;
        historiaCwiczen = {};
        await setDoc(doc(db, "users", aktualnyUzytkownik.uid), {
          gwiazdki: 0,
          email: aktualnyUzytkownik.email,
          historia: {}
        });
      }
      document.getElementById('stars-count').textContent = gwiazdki;
    } catch (e) {
      console.error("Błąd odczytu z bazy:", e);
    }
  }
}

function dodajGwiazdke() {
  if (czySlowoZaliczone) return;
  czySlowoZaliczone = true;
  
  gwiazdki++;
  document.getElementById('stars-count').textContent = gwiazdki;
  
  if (!historiaCwiczen[aktualnaGloska]) {
    historiaCwiczen[aktualnaGloska] = 0;
  }
  historiaCwiczen[aktualnaGloska]++;
  
  zapiszDaneDoBazy();
}

// --- RESZTA KODU ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'pl-PL';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = function() {
    document.getElementById('mic-button').classList.add('listening');
    document.getElementById('mic-hint').textContent = 'Słucham... Powiedz słowo!';
    document.getElementById('mic-hint').className = 'mic-hint';
    timeoutId = setTimeout(() => {
      recognition.stop();
      document.getElementById('mic-hint').textContent = 'Spróbuj jeszcze raz lub poproś rodzica o zaliczenie.';
      document.getElementById('mic-hint').className = 'mic-hint error';
    }, 4000); 
  };

  recognition.onresult = function(event) {
    clearTimeout(timeoutId);
    const uslyszaneSlowo = event.results[0][0].transcript.toUpperCase();
    sprawdzWymowe(uslyszaneSlowo);
  };

  recognition.onerror = function(event) {
    clearTimeout(timeoutId);
    document.getElementById('mic-button').classList.remove('listening');
    document.getElementById('mic-hint').textContent = 'Mikrofon nie usłyszał. Kliknij "Rodzic: Dobrze powiedziane", jeśli jest OK.';
    document.getElementById('mic-hint').className = 'mic-hint error';
  };

  recognition.onend = function() {
    clearTimeout(timeoutId);
    document.getElementById('mic-button').classList.remove('listening');
  };
}

function ukryjWszystkieWidoki() {
  document.getElementById('landing-view').style.display = 'none';
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('exercise-view').style.display = 'none';
  document.getElementById('draw-view').style.display = 'none';
  document.getElementById('auth-login-view').style.display = 'none';
  document.getElementById('auth-register-view').style.display = 'none';
  document.getElementById('parent-panel-view').style.display = 'none';
}

window.pokazLanding = function() {
  ukryjWszystkieWidoki();
  document.getElementById('landing-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.pokazGlowna = function() {
  ukryjWszystkieWidoki();
  document.getElementById('main-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.pokazLogowanie = function() {
  ukryjWszystkieWidoki();
  document.getElementById('auth-login-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.pokazRejestracje = function() {
  ukryjWszystkieWidoki();
  document.getElementById('auth-register-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.rozpocznijCwiczenie = function(gloska) {
  aktualnaGloska = gloska;
  aktualneSlowoIndex = 0;
  ukryjWszystkieWidoki();
  document.getElementById('exercise-view').style.display = 'block';
  odswiezSlowo();
  window.scrollTo(0, 0);
};

window.pokazCwiczenie = function() {
  ukryjWszystkieWidoki();
  document.getElementById('exercise-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.pokazRysowanie = function() {
  ukryjWszystkieWidoki();
  document.getElementById('draw-view').style.display = 'block';
  setTimeout(inicjujCanvas, 50);
  window.scrollTo(0, 0);
};

window.pokazPanelRodzica = function() {
  ukryjWszystkieWidoki();
  document.getElementById('parent-panel-view').style.display = 'block';
  window.scrollTo(0, 0);
  
  document.getElementById('parent-total-stars').textContent = gwiazdki;
  
  let totalWords = 0;
  for (const gloska in historiaCwiczen) {
    totalWords += historiaCwiczen[gloska];
  }
  document.getElementById('parent-words-count').textContent = totalWords;

  const historyList = document.getElementById('parent-history-list');
  historyList.innerHTML = ''; 
  
  const gloskiKlucze = Object.keys(historiaCwiczen);
  if (gloskiKlucze.length === 0) {
    historyList.innerHTML = '<div style="text-align: center; color: #9ca3af; padding: 10px;">Brak danych. Zacznij ćwiczyć!</div>';
  } else {
    gloskiKlucze.forEach(gloska => {
      const ilosc = historiaCwiczen[gloska];
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<span>Głoska: <strong>${gloska}</strong></span> <span>${ilosc} razy</span>`;
      historyList.appendChild(div);
    });
  }
};

function odswiezSlowo() {
  const slowoObj = slowa[aktualnaGloska][aktualneSlowoIndex];
  document.getElementById('ex-image').textContent = slowoObj.image;
  document.getElementById('ex-word').textContent = slowoObj.word;
  document.getElementById('draw-word').textContent = slowoObj.word;
  document.getElementById('mic-hint').textContent = 'Kliknij i powiedz słowo!';
  document.getElementById('mic-hint').className = 'mic-hint';
  czySlowoZaliczone = false;
}

window.nastepneSlowo = function() {
  const tablica = slowa[aktualnaGloska];
  aktualneSlowoIndex = (aktualneSlowoIndex + 1) % tablica.length;
  odswiezSlowo();
};

window.nagrajIWymow = function() {
  if (!recognition) {
    alert("Twoja przeglądarka nie wspiera rozpoznawania mowy.");
    return;
  }
  try { recognition.stop(); } catch(e) {}
  setTimeout(() => { 
    try { recognition.start(); } catch(e) { 
      alert("Błąd mikrofonu. Użyj przycisku dla rodzica.");
    } 
  }, 100);
};

function sprawdzWymowe(uslyszaneSlowo) {
  const doceloweSlowo = slowa[aktualnaGloska][aktualneSlowoIndex].word;
  const hint = document.getElementById('mic-hint');
  if (uslyszaneSlowo.includes(doceloweSlowo)) {
    hint.textContent = 'Super! Bardzo dobrze powiedziane! ⭐';
    hint.className = 'mic-hint success';
    dodajGwiazdke();
  } else {
    hint.textContent = `Spróbuj jeszcze raz! Usłyszałem: "${uslyszaneSlowo}". Powiedz: ${doceloweSlowo}`;
    hint.className = 'mic-hint error';
  }
}

window.rodzicZaliczyl = function() {
  if (czySlowoZaliczone) {
    alert("To słowo zostało już zaliczone! Kliknij 'Następne słowo'.");
    return;
  }
  const hint = document.getElementById('mic-hint');
  hint.textContent = 'Zaliczone przez rodzica! ⭐';
  hint.className = 'mic-hint success';
  dodajGwiazdke();
};

let canvas, ctx, rysowanie = false, kolor = '#db2777';

function inicjujCanvas() {
  canvas = document.getElementById('drawCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  
  // Ustawiamy wymiary płótna na podstawie kontenera
  const container = canvas.parentElement;
  canvas.width = container.clientWidth - 20; // - padding
  canvas.height = container.clientHeight - 20; 

  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = kolor;
  rysowanie = false;

  // Wstawianie podkładu SVG
  const slowoObj = slowa[aktualnaGloska][aktualneSlowoIndex];
  const svgContainer = document.getElementById('draw-guide');
  if (slowoObj.svg) {
    svgContainer.innerHTML = slowoObj.svg;
  } else {
    svgContainer.innerHTML = ''; // Brak podkładu dla tego słowa
  }

  // Obsługa zdarzeń myszy i dotyku
  canvas.onmousedown = (e) => { rysowanie = true; rysuj(e); };
  canvas.onmousemove = (e) => { if(rysowanie) rysuj(e); };
  canvas.onmouseup = () => { rysowanie = false; ctx.beginPath(); };
  canvas.onmouseout = () => { rysowanie = false; ctx.beginPath(); };

  canvas.ontouchstart = (e) => { e.preventDefault(); rysowanie = true; rysujDotyk(e); };
  canvas.ontouchmove = (e) => { e.preventDefault(); if(rysowanie) rysujDotyk(e); };
  canvas.ontouchend = () => { rysowanie = false; ctx.beginPath(); };
}

function rysuj(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function rysujDotyk(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

window.zmienKolor = function(nowyKolor) {
  kolor = nowyKolor;
  if(ctx) ctx.strokeStyle = kolor;
};

window.wyczyscCanvas = function() {
  if(ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
};

window.pokazPaywall = function() {
  document.getElementById('paywall-modal').style.display = 'flex';
};

window.zamknijPaywall = function() {
  document.getElementById('paywall-modal').style.display = 'none';
};

window.zalogujPrzezGoogle = async function() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    pokazGlowna();
  } catch (error) {
    alert("Błąd logowania Google: " + error.message);
  }
};

window.obsluzRejestracje = async function() {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const msg = document.getElementById('register-msg');
  msg.textContent = 'Przetwarzanie...'; msg.style.color = '#6b7280';
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    msg.textContent = 'Konto utworzone! Możesz się zalogować.'; msg.style.color = '#16a34a';
    setTimeout(() => pokazLogowanie(), 2000);
  } catch (error) {
    msg.textContent = error.message; msg.style.color = '#dc2626';
  }
};

window.obsluzLogowanie = async function() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const msg = document.getElementById('login-msg');
  msg.textContent = 'Przetwarzanie...'; msg.style.color = '#6b7280';
  try {
    await signInWithEmailAndPassword(auth, email, password);
    pokazGlowna();
  } catch (error) {
    msg.textContent = error.message; msg.style.color = '#dc2626';
  }
};

window.wyloguj = async function() {
  await signOut(auth);
  pokazLanding();
};

onAuthStateChanged(auth, async (user) => {
  const loginBtn = document.getElementById('nav-login-btn');
  const userInfo = document.getElementById('nav-user-info');
  const panelBtn = document.getElementById('nav-panel-btn');
  const emailDisplay = document.getElementById('user-email-display');
  
  if (user) {
    aktualnyUzytkownik = user;
    loginBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    panelBtn.style.display = 'block';
    emailDisplay.textContent = user.email.split('@')[0];
    await wczytajDaneZbazy();
  } else {
    aktualnyUzytkownik = null;
    loginBtn.style.display = 'block';
    userInfo.style.display = 'none';
    panelBtn.style.display = 'none';
    gwiazdki = 0;
    historiaCwiczen = {};
    document.getElementById('stars-count').textContent = '0';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  pokazLanding();
});