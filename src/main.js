import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { bazaSlow } from './dane.js'; 
import { renderujPanelRodzica } from './panel.js'; 
import { startMemory } from './gra-memory.js'; // IMPORTUJEMY GRĘ

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

const slowa = bazaSlow;
const darmoweGloski = ['A', 'B', 'C']; 

let aktualnaGloska = 'A';
let aktualneSlowoIndex = 0;
let gwiazdki = 0;
let recognition = null;
let timeoutId = null;
let aktualnyUzytkownik = null;
let czySlowoZaliczone = false;
let historiaCwiczen = {};
let streak = 0;
let ostatniaDataCwiczenia = null;
let celTygodniowy = 0;

// --- GENEROWANIE KAFELKÓW ---
function renderujKafelki() {
  const grid = document.getElementById('gloski-grid');
  grid.innerHTML = ''; 

  const posortowaneGloski = Object.keys(slowa).sort();

  posortowaneGloski.forEach(gloska => {
    const jestDarmowa = darmoweGloski.includes(gloska);
    const card = document.createElement('div');
    card.className = 'letter-card';
    
    if (!jestDarmowa) {
      card.style.opacity = '0.7';
      card.innerHTML = `<span class="lock-icon">🔒</span>`;
      card.onclick = window.pokazPaywall;
    } else {
      card.onclick = () => window.rozpocznijCwiczenie(gloska);
    }

    const przykladoweSlowo = slowa[gloska][0].word;

    card.innerHTML += `
      <span class="big-letter">${gloska}</span>
      <span class="desc">np. ${przykladoweSlowo}</span>
    `;
    grid.appendChild(card);
  });
}

// --- FUNKCJE BAZY DANYCH ---
async function zapiszDaneDoBazy() {
  if (aktualnyUzytkownik) {
    try {
      await setDoc(doc(db, "users", aktualnyUzytkownik.uid), {
        gwiazdki: gwiazdki,
        email: aktualnyUzytkownik.email,
        historia: historiaCwiczen,
        streak: streak,
        ostatniaData: ostatniaDataCwiczenia,
        celTygodniowy: celTygodniowy
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
        streak = dane.streak || 0;
        ostatniaDataCwiczenia = dane.ostatniaData || null;
        celTygodniowy = dane.celTygodniowy || 0;
      } else {
        gwiazdki = 0;
        historiaCwiczen = {};
        streak = 0;
        ostatniaDataCwiczenia = null;
        celTygodniowy = 0;
        await setDoc(doc(db, "users", aktualnyUzytkownik.uid), {
          gwiazdki: 0,
          email: aktualnyUzytkownik.email,
          historia: {},
          streak: 0,
          ostatniaData: null,
          celTygodniowy: 0
        });
      }
      document.getElementById('stars-count').textContent = gwiazdki;
    } catch (e) {
      console.error("Błąd odczytu z bazy:", e);
    }
  }
}

function dodajGwiazdke(ilosc = 1) {
  if (czySlowoZaliczone) return;
  czySlowoZaliczone = true;
  
  gwiazdki += ilosc;
  document.getElementById('stars-count').textContent = gwiazdki;
  
  if (!historiaCwiczen[aktualnaGloska]) {
    historiaCwiczen[aktualnaGloska] = 0;
  }
  historiaCwiczen[aktualnaGloska]++;

  const dzisiaj = new Date().toISOString().split('T')[0];
  
  if (ostatniaDataCwiczenia !== dzisiaj) {
    const wczoraj = new Date();
    wczoraj.setDate(wczoraj.getDate() - 1);
    const wczorajStr = wczoraj.toISOString().split('T')[0];

    if (ostatniaDataCwiczenia === wczorajStr) {
      streak++; 
    } else {
      streak = 1; 
    }
    ostatniaDataCwiczenia = dzisiaj;
    
    if (streak > 1) {
      gwiazdki += streak;
      document.getElementById('stars-count').textContent = gwiazdki;
    }
  }
  
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
  document.getElementById('memory-view').style.display = 'none';
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
  renderujKafelki();
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

window.pokazMemory = function() {
  ukryjWszystkieWidoki();
  document.getElementById('memory-view').style.display = 'block';
  window.scrollTo(0, 0);
  
  // Uruchamiamy grę z pliku gra-memory.js
  startMemory(bazaSlow, aktualnaGloska, () => {
    dodajGwiazdke(5); // Bonus: +5 gwiazdek za wygraną
  });
};

window.pokazPanelRodzica = function() {
  ukryjWszystkieWidoki();
  document.getElementById('parent-panel-view').style.display = 'block';
  window.scrollTo(0, 0);
  
  let totalWords = 0;
  for (const gloska in historiaCwiczen) {
    totalWords += historiaCwiczen[gloska];
  }

  let historyHTML = '';
  const gloskiKlucze = Object.keys(historiaCwiczen);
  if (gloskiKlucze.length === 0) {
    historyHTML = '<div style="text-align: center; color: #9ca3af; padding: 10px;">Brak danych. Zacznij ćwiczyć!</div>';
  } else {
    gloskiKlucze.forEach(gloska => {
      const ilosc = historiaCwiczen[gloska];
      historyHTML += `<div class="history-item"><span>Głoska: <strong>${gloska}</strong></span> <span>${ilosc} razy</span></div>`;
    });
  }

  renderujPanelRodzica({
    gwiazdki: gwiazdki,
    streak: streak,
    celTygodniowy: celTygodniowy,
    totalWords: totalWords,
    historiaHTML: historyHTML
  });
};

window.zapiszCelWTle = function(targetValue) {
  celTygodniowy = targetValue;
  zapiszDaneDoBazy();
  pokazPanelRodzica(); 
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
    dodajGwiazdke(1);
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
  dodajGwiazdke(1);
};

let canvas, ctx, rysowanie = false, kolor = '#db2777';

function inicjujCanvas() {
  canvas = document.getElementById('drawCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  
  const container = canvas.parentElement;
  canvas.width = container.clientWidth - 20;
  canvas.height = container.clientHeight - 20; 

  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = kolor;
  rysowanie = false;

  const slowoObj = slowa[aktualnaGloska][aktualneSlowoIndex];
  const svgContainer = document.getElementById('draw-guide');
  if (slowoObj.svg) {
    svgContainer.innerHTML = slowoObj.svg;
  } else {
    svgContainer.innerHTML = ''; 
  }

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
    streak = 0;
    ostatniaDataCwiczenia = null;
    celTygodniowy = 0;
    document.getElementById('stars-count').textContent = '0';
    renderujKafelki();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderujKafelki(); 
  pokazLanding();
});