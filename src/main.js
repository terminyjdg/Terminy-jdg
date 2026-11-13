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

// --- SŁOWNIKI SŁÓW ---
const slowa = {
  'R': [ { image: '🦀', word: 'RAK' }, { image: '🚲', word: 'ROWER' }, { image: '🐟', word: 'RYBA' }, { image: '🌹', word: 'RÓŻA' } ],
  'S': [ { image: '🦉', word: 'SOWA' }, { image: '🧀', word: 'SER' }, { image: '☀️', word: 'SŁOŃCE' }, { image: '🐘', word: 'SŁOŃ' } ],
  'C': [ { image: '🧅', word: 'CEBULA' }, { image: '🍋', word: 'CYTRYNA' }, { image: '🎯', word: 'CEL' }, { image: '🌷', word: 'CUKIER' } ],
  'L': [ { image: '🦁', word: 'LEW' }, { image: '🪆', word: 'LALKA' }, { image: '🍦', word: 'LODY' }, { image: '🌲', word: 'LAS' } ]
};

let aktualnaGloska = 'R';
let aktualneSlowoIndex = 0;
let gwiazdki = 0;
let recognition = null;
let timeoutId = null;
let aktualnyUzytkownik = null;
let czySlowoZaliczone = false; // Flaga blokująca wielokrotne klikanie

// --- ZAPIS GWIAZDEK DO FIREBASE ---
async function zapiszGwiazdkiDoBazy() {
  if (aktualnyUzytkownik) {
    try {
      await setDoc(doc(db, "users", aktualnyUzytkownik.uid), {
        gwiazdki: gwiazdki,
        email: aktualnyUzytkownik.email
      }, { merge: true });
    } catch (e) {
      console.error("Błąd zapisu do bazy:", e);
    }
  }
}

async function wczytajGwiazdkiZbazy() {
  if (aktualnyUzytkownik) {
    try {
      const docSnap = await getDoc(doc(db, "users", aktualnyUzytkownik.uid));
      if (docSnap.exists()) {
        gwiazdki = docSnap.data().gwiazdki || 0;
        document.getElementById('stars-count').textContent = gwiazdki;
      }
    } catch (e) {
      console.error("Błąd odczytu z bazy:", e);
    }
  }
}

function dodajGwiazdke() {
  if (czySlowoZaliczone) return; // Jeśli już zaliczone, nie dodawaj kolejnej
  czySlowoZaliczone = true;
  
  gwiazdki++;
  document.getElementById('stars-count').textContent = gwiazdki;
  zapiszGwiazdkiDoBazy();
}

// Sprawdzenie, czy przeglądarka wspiera rozpoznawanie mowy
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

// --- NAWIGACJA ---
function ukryjWszystkieWidoki() {
  document.getElementById('landing-view').style.display = 'none';
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('exercise-view').style.display = 'none';
  document.getElementById('draw-view').style.display = 'none';
  document.getElementById('auth-login-view').style.display = 'none';
  document.getElementById('auth-register-view').style.display = 'none';
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

function odswiezSlowo() {
  const slowoObj = slowa[aktualnaGloska][aktualneSlowoIndex];
  document.getElementById('ex-image').textContent = slowoObj.image;
  document.getElementById('ex-word').textContent = slowoObj.word;
  document.getElementById('draw-word').textContent = slowoObj.word;
  document.getElementById('mic-hint').textContent = 'Kliknij i powiedz słowo!';
  document.getElementById('mic-hint').className = 'mic-hint';
  czySlowoZaliczone = false; // Reset flagi przy nowym słowie
}

window.nastepneSlowo = function() {
  const tablica = slowa[aktualnaGloska];
  aktualneSlowoIndex = (aktualneSlowoIndex + 1) % tablica.length;
  odswiezSlowo();
};

// --- MIKROFON ---
window.nagrajIWymow = function() {
  if (!recognition) {
    alert("Twoja przeglądarka nie wspiera rozpoznawania mowy. Spróbuj w Chrome na Androidzie.");
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

// --- RYSOWANIE ---
let canvas, ctx, rysowanie = false, kolor = '#db2777';

function inicjujCanvas() {
  canvas = document.getElementById('drawCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width - 20;
  canvas.height = 300;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = kolor;
  rysowanie = false;

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

// --- PAYWALL ---
window.pokazPaywall = function() {
  document.getElementById('paywall-modal').style.display = 'flex';
};

window.zamknijPaywall = function() {
  document.getElementById('paywall-modal').style.display = 'none';
};

// --- LOGOWANIE FIREBASE ---
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
  const emailDisplay = document.getElementById('user-email-display');
  
  if (user) {
    aktualnyUzytkownik = user;
    loginBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    emailDisplay.textContent = user.email.split('@')[0];
    
    // Wczytujemy gwiazdki z bazy
    await wczytajGwiazdkiZbazy();
  } else {
    aktualnyUzytkownik = null;
    loginBtn.style.display = 'block';
    userInfo.style.display = 'none';
    
    // Resetujemy gwiazdki dla niezalogowanych
    gwiazdki = 0;
    document.getElementById('stars-count').textContent = '0';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  pokazLanding();
});