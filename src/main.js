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
  'R': [
    { image: '🦀', word: 'RAK' },
    { image: '🚲', word: 'ROWER' },
    { image: '🐟', word: 'RYBA' },
    { image: '🌹', word: 'RÓŻA' }
  ],
  'S': [
    { image: '🦉', word: 'SOWA' },
    { image: '🧀', word: 'SER' },
    { image: '☀️', word: 'SŁOŃCE' },
    { image: '🐘', word: 'SŁOŃ' }
  ],
  'C': [
    { image: '🧅', word: 'CEBULA' },
    { image: '🍋', word: 'CYTRYNA' },
    { image: '🎯', word: 'CEL' },
    { image: '🌷', word: 'CUKIER' }
  ],
  'L': [
    { image: '🦁', word: 'LEW' },
    { image: '🪆', word: 'LALKA' },
    { image: '🍦', word: 'LODY' },
    { image: '🌲', word: 'LAS' }
  ]
};

let aktualnaGloska = 'R';
let aktualneSlowoIndex = 0;

// --- NAWIGACJA ---
window.pokazGlowna = function() {
  document.getElementById('main-view').style.display = 'block';
  document.getElementById('exercise-view').style.display = 'none';
  document.getElementById('auth-login-view').style.display = 'none';
  document.getElementById('auth-register-view').style.display = 'none';
  window.scrollTo(0, 0);
};

window.pokazLogowanie = function() {
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('exercise-view').style.display = 'none';
  document.getElementById('auth-login-view').style.display = 'block';
  document.getElementById('auth-register-view').style.display = 'none';
  window.scrollTo(0, 0);
};

window.pokazRejestracje = function() {
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('exercise-view').style.display = 'none';
  document.getElementById('auth-login-view').style.display = 'none';
  document.getElementById('auth-register-view').style.display = 'block';
  window.scrollTo(0, 0);
};

// --- LOGIKA ĆWICZENIA ---
window.rozpocznijCwiczenie = function(gloska) {
  aktualnaGloska = gloska;
  aktualneSlowoIndex = 0;
  
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('exercise-view').style.display = 'block';
  
  odswiezSlowo();
  window.scrollTo(0, 0);
};

function odswiezSlowo() {
  const slowoObj = slowa[aktualnaGloska][aktualneSlowoIndex];
  document.getElementById('ex-image').textContent = slowoObj.image;
  document.getElementById('ex-word').textContent = slowoObj.word;
  
  document.getElementById('mic-hint').textContent = 'Kliknij mikrofon i powiedz słowo!';
  document.getElementById('mic-hint').style.color = '#6b7280';
}

window.nastepneSlowo = function() {
  const tablica = slowa[aktualnaGloska];
  aktualneSlowoIndex = (aktualneSlowoIndex + 1) % tablica.length;
  odswiezSlowo();
};

window.symulujNagranie = function() {
  const hint = document.getElementById('mic-hint');
  hint.textContent = 'Słucham... 🎤';
  hint.style.color = '#2563eb';
  
  setTimeout(() => {
    hint.textContent = 'Super! Bardzo dobrze powiedziane! ⭐';
    hint.style.color = '#10b981';
  }, 2000);
};

// --- LOGOWANIE FIREBASE ---
window.zalogujPrzezGoogle = async function() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
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
    emailDisplay.textContent = user.email.split('@')[0]; // Pokazujemy tylko początek maila, żeby było ładniej
  } else {
    loginBtn.style.display = 'block';
    userInfo.style.display = 'none';
  }
});

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
  pokazGlowna();
});