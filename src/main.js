import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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
  };

  recognition.onresult = function(event) {
    const uslyszaneSlowo = event.results[0][0].transcript.toUpperCase();
    sprawdzWymowe(uslyszaneSlowo);
  };

  recognition.onerror = function(event) {
    document.getElementById('mic-button').classList.remove('listening');
    document.getElementById('mic-hint').textContent = 'Nie udało się nagrać. Spróbuj jeszcze raz!';
    document.getElementById('mic-hint').className = 'mic-hint error';
  };

  recognition.onend = function() {
    document.getElementById('mic-button').classList.remove('listening');
  };
}

// --- NAWIGACJA ---
function ukryjWszystko() {
  document.querySelectorAll('.container, #auth-login-view, #auth-register-view').forEach(el => el.style.display = 'none');
}

window.pokazGlowna = function() {
  ukryjWszystko();
  document.getElementById('main-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.pokazLogowanie = function() {
  ukryjWszystko();
  document.getElementById('auth-login-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.pokazRejestracje = function() {
  ukryjWszystko();
  document.getElementById('auth-register-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.rozpocznijCwiczenie = function(gloska) {
  aktualnaGloska = gloska;
  aktualneSlowoIndex = 0;
  ukryjWszystko();
  document.getElementById('exercise-view').style.display = 'block';
  odswiezSlowo();
  window.scrollTo(0, 0);
};

window.pokazCwiczenie = function() {
  ukryjWszystko();
  document.getElementById('exercise-view').style.display = 'block';
  window.scrollTo(0, 0);
};

function odswiezSlowo() {
  const slowoObj = slowa[aktualnaGloska][aktualneSlowoIndex];
  document.getElementById('ex-image').textContent = slowoObj.image;
  document.getElementById('ex-word').textContent = slowoObj.word;
  document.getElementById('draw-word').textContent = slowoObj.word;
  document.getElementById('mic-hint').textContent = 'Kliknij i powiedz słowo!';
  document.getElementById('mic-hint').className = 'mic-hint';
}

window.nastepneSlowo = function() {
  const tablica = slowa[aktualnaGloska];
  aktualneSlowoIndex = (aktualneSlowoIndex + 1) % tablica.length;
  odswiezSlowo();
};

// --- PRAWDZIWE NAGRYWANIE I SPRAWDZANIE ---
window.nagrajIWymow = function() {
  if (!recognition) {
    alert("Twoja przeglądarka nie wspiera rozpoznawania mowy. Spróbuj w Chrome na Androidzie.");
    return;
  }
  
  // Zatrzymujemy poprzednie nasłuchiwanie, jeśli trwało
  try { recognition.stop(); } catch(e) {}
  
  // Startujemy nowe
  recognition.start();
};

function sprawdzWymowe(uslyszaneSlowo) {
  const doceloweSlowo = slowa[aktualnaGloska][aktualneSlowoIndex].word;
  const hint = document.getElementById('mic-hint');
  
  // Prosta logika: jeśli usłyszane słowo zawiera docelowe (np. "rak" w "rak.") lub jest bardzo podobne
  if (uslyszaneSlowo.includes(doceloweSlowo) || doceloweSlowo.includes(uslyszaneSlowo)) {
    hint.textContent = 'Super! Bardzo dobrze powiedziane! ⭐';
    hint.className = 'mic-hint success';
    
    gwiazdki++;
    document.getElementById('stars-count').textContent = gwiazdki;
  } else {
    hint.textContent = `Spróbuj jeszcze raz! Usłyszałem: "${uslyszaneSlowo}". Powiedz głośno: ${doceloweSlowo}`;
    hint.className = 'mic-hint error';
  }
}

// --- RYSOWANIE ---
let canvas, ctx, rysowanie = false, kolor = '#db2777';

window.pokazRysowanie = function() {
  ukryjWszystko();
  document.getElementById('draw-view').style.display = 'block';
  setTimeout(inicjujCanvas, 50);
  window.scrollTo(0, 0);
};

function inicjujCanvas() {
  canvas = document.getElementById('drawCanvas');
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
  pokazGlowna();
};

onAuthStateChanged(auth, (user) => {
  const loginBtn = document.getElementById('nav-login-btn');
  const userInfo = document.getElementById('nav-user-info');
  const emailDisplay = document.getElementById('user-email-display');
  if (user) {
    loginBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    emailDisplay.textContent = user.email.split('@')[0];
  } else {
    loginBtn.style.display = 'block';
    userInfo.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  pokazGlowna();
});