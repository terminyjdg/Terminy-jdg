import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { bazaSlow } from './dane.js'; 
import { renderujPanelRodzica } from './panel.js'; 
import { startMemory } from './gra-memory.js'; 
import { initNagrywanie } from './nagrywanie.js'; 
import { startHistoryjki } from './historyjki.js';
import { startMatma, wyjdzZMatmy, nastepneZadanie } from './matma.js';
// ZMIENIONO NAZWĘ IMPORTU, ABY NIE KOLIDOWAŁA Z FUNKCJĄ LOKALNĄ
import { startZgadnijDzwiek, wyjdzZZgadnij, nastepnePytanie, odtworzDzwiek as odtworzDzwiekLektora } from './zgadnij-dzwiek.js';

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
let gwiazdkiWTygodniu = 0;
let recognition = null;
let timeoutId = null;
let aktualnyUzytkownik = null;
let czySlowoZaliczone = false;

let historiaCwiczen = {}; 
let streak = 0;
let ostatniaDataCwiczenia = null;
let celTygodniowy = 0;
let odznaki = {}; 
let historyjki = [];

let statystykiGier = {
  mowa: 0,
  dodawanie: 0,
  odejmowanie: 0,
  mnozenie: 0,
  dzielenie: 0,
  zgadnij: 0
};

// --- SYSTEM PRO (TEST) ---
let czyMaPro = false;
const emailePro = ["harasimowiczmichal5@gmail.com"]; 

function aktualizujStatusPro(user) {
  if (user && emailePro.includes(user.email)) {
    czyMaPro = true;
    const proCards = ['card-zgadnij', 'card-dodawanie', 'card-odejmowanie', 'card-mnozenie', 'card-dzielenie'];
    proCards.forEach(id => {
      const card = document.getElementById(id);
      if (card) {
        const badge = card.querySelector('.pro-badge');
        if (badge) badge.style.display = 'none'; 
        card.style.opacity = '1'; 
      }
    });
  } else {
    czyMaPro = false;
    const proCards = ['card-zgadnij', 'card-dodawanie', 'card-odejmowanie', 'card-mnozenie', 'card-dzielenie'];
    proCards.forEach(id => {
      const card = document.getElementById(id);
      if (card) {
        const badge = card.querySelector('.pro-badge');
        if (badge) badge.style.display = 'block';
        card.style.opacity = '0.8';
      }
    });
  }
}

window.sprawdzDostepPro = function(akcja) {
  if (czyMaPro) {
    if (akcja === 'zgadnij') {
      uruchomZgadnij();
    } else {
      uruchomMatme(akcja);
    }
  } else {
    pokazPaywall();
  }
};

// --- GENEROWANIE KAFELKÓW ---
function renderujKafelki() {
  const grid = document.getElementById('gloski-grid');
  if (!grid) return;
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
        gwiazdkiWTygodniu: gwiazdkiWTygodniu,
        statystykiGier: statystykiGier,
        email: aktualnyUzytkownik.email,
        historia: historiaCwiczen,
        streak: streak,
        ostatniaData: ostatniaDataCwiczenia,
        celTygodniowy: celTygodniowy,
        odznaki: odznaki,
        historyjki: historyjki 
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
        gwiazdkiWTygodniu = dane.gwiazdkiWTygodniu || 0;
        statystykiGier = dane.statystykiGier || { mowa: 0, dodawanie: 0, odejmowanie: 0, mnozenie: 0, dzielenie: 0, zgadnij: 0 };
        historiaCwiczen = dane.historia || {};
        streak = dane.streak || 0;
        ostatniaDataCwiczenia = dane.ostatniaData || null;
        celTygodniowy = dane.celTygodniowy || 0;
        odznaki = dane.odznaki || {};
        historyjki = dane.historyjki || []; 
      } else {
        gwiazdki = 0;
        gwiazdkiWTygodniu = 0;
        statystykiGier = { mowa: 0, dodawanie: 0, odejmowanie: 0, mnozenie: 0, dzielenie: 0, zgadnij: 0 };
        historiaCwiczen = {};
        streak = 0;
        ostatniaDataCwiczenia = null;
        celTygodniowy = 0;
        odznaki = {};
        historyjki = [];
        await setDoc(doc(db, "users", aktualnyUzytkownik.uid), {
          gwiazdki: 0,
          gwiazdkiWTygodniu: 0,
          statystykiGier: { mowa: 0, dodawanie: 0, odejmowanie: 0, mnozenie: 0, dzielenie: 0, zgadnij: 0 },
          email: aktualnyUzytkownik.email,
          historia: {},
          streak: 0,
          ostatniaData: null,
          celTygodniowy: 0,
          odznaki: {},
          historyjki: []
        });
      }
      document.getElementById('stars-count').textContent = gwiazdki;
    } catch (e) {
      console.error("Błąd odczytu z bazy:", e);
    }
  }
}

// --- KONFETTI I DŹWIĘK ---
function pokazKonfetti() {
  const colors = ['#db2777', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
}

// TO JEST TWOJA LOKALNA FUNKCJA DŹWIĘKOWA (sukces/błąd)
function odtworzDzwiek(sukces) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  if (sukces) {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); 
  } else {
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
  }
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3);
}

// --- SYSTEM ODZNAK ---
function sprawdzOdznaki() {
  let nowaOdznaka = false;

  if (gwiazdki >= 1 && !odznaki['pierwszy_krok']) {
    odznaki['pierwszy_krok'] = true;
    nowaOdznaka = true;
  }
  if (streak >= 3 && !odznaki['konsekwencja']) {
    odznaki['konsekwencja'] = true;
    nowaOdznaka = true;
  }
  if (gwiazdki >= 50 && !odznaki['kolekcjoner']) {
    odznaki['kolekcjoner'] = true;
    nowaOdznaka = true;
  }

  if (nowaOdznaka) {
    pokazKonfetti();
    odtworzDzwiek(true);
  }
}

function dodajGwiazdke(ilosc = 1) {
  if (czySlowoZaliczone) return;
  czySlowoZaliczone = true;
  
  gwiazdki += ilosc;
  gwiazdkiWTygodniu += ilosc;
  statystykiGier.mowa += ilosc; 
  
  const starDisplay = document.getElementById('stars-display');
  if (starDisplay) {
    starDisplay.classList.add('pop');
    setTimeout(() => starDisplay.classList.remove('pop'), 300);
  }
  
  document.getElementById('stars-count').textContent = gwiazdki;
  
  pokazKonfetti();
  odtworzDzwiek(true);

  if (!historiaCwiczen[aktualnaGloska]) {
    historiaCwiczen[aktualnaGloska] = { proby: 0, sukcesy: 0 };
  }
  historiaCwiczen[aktualnaGloska].proby++;
  historiaCwiczen[aktualnaGloska].sukcesy++;

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
  }

  sprawdzOdznaki(); 
  zapiszDaneDoBazy();
}

function dodajGwiazdkeMatma(rodzajGry) {
  gwiazdki += 1;
  gwiazdkiWTygodniu += 1; 
  
  if (statystykiGier[rodzajGry] !== undefined) {
    statystykiGier[rodzajGry] += 1;
  }
  
  document.getElementById('stars-count').textContent = gwiazdki;
  
  const mathStarDisplay = document.getElementById('math-stars-count');
  if (mathStarDisplay) {
    mathStarDisplay.textContent = gwiazdki;
  }

  pokazKonfetti();
  odtworzDzwiek(true);
  sprawdzOdznaki();
  zapiszDaneDoBazy();
}

function odejmijGwiazdkeMatma() {
  if (gwiazdki > 0) {
    gwiazdki -= 1;
    if (gwiazdkiWTygodniu > 0) gwiazdkiWTygodniu -= 1;
    
    document.getElementById('stars-count').textContent = gwiazdki;
    const mathStarDisplay = document.getElementById('math-stars-count');
    if (mathStarDisplay) {
      mathStarDisplay.textContent = gwiazdki;
    }
    zapiszDaneDoBazy();
  }
}

function dodajGwiazdkeZgadnij() {
  gwiazdki += 1;
  gwiazdkiWTygodniu += 1; 
  statystykiGier.zgadnij += 1;
  
  document.getElementById('stars-count').textContent = gwiazdki;
  
  const zgadnijStarDisplay = document.getElementById('zgadnij-stars-count');
  if (zgadnijStarDisplay) {
    zgadnijStarDisplay.textContent = gwiazdki;
  }

  pokazKonfetti();
  odtworzDzwiek(true);
  sprawdzOdznaki();
  zapiszDaneDoBazy();
}

function odejmijGwiazdkeZgadnij() {
  if (gwiazdki > 0) {
    gwiazdki -= 1;
    if (gwiazdkiWTygodniu > 0) gwiazdkiWTygodniu -= 1;
    
    document.getElementById('stars-count').textContent = gwiazdki;
    const zgadnijStarDisplay = document.getElementById('zgadnij-stars-count');
    if (zgadnijStarDisplay) {
      zgadnijStarDisplay.textContent = gwiazdki;
    }
    zapiszDaneDoBazy();
  }
}

// --- ROZPOZNAWANIE MOWY ---
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
  document.getElementById('menu-view').style.display = 'none';
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('exercise-view').style.display = 'none';
  document.getElementById('draw-view').style.display = 'none';
  document.getElementById('memory-view').style.display = 'none';
  document.getElementById('auth-login-view').style.display = 'none';
  document.getElementById('auth-register-view').style.display = 'none';
  document.getElementById('parent-panel-view').style.display = 'none';
  document.getElementById('historyjki-view').style.display = 'none';
  document.getElementById('math-view').style.display = 'none';
  document.getElementById('zgadnij-view').style.display = 'none';
}

window.pokazMenu = function() {
  ukryjWszystkieWidoki();
  document.getElementById('menu-view').style.display = 'block';
  window.scrollTo(0, 0);
  aktualizujStatusPro(aktualnyUzytkownik);
};

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
  
  if (!slowa[aktualnaGloska] || !slowa[aktualnaGloska][aktualneSlowoIndex]) {
    aktualnaGloska = 'A';
    aktualneSlowoIndex = 0;
    odswiezSlowo();
  }

  document.getElementById('draw-view').style.display = 'block';
  setTimeout(inicjujCanvas, 50);
  window.scrollTo(0, 0);
};

window.wrocZRysowania = function() {
  if (slowa[aktualnaGloska] && slowa[aktualnaGloska][aktualneSlowoIndex]) {
    pokazCwiczenie();
  } else {
    pokazMenu();
  }
};

window.pokazMemory = function() {
  ukryjWszystkieWidoki();
  document.getElementById('memory-view').style.display = 'block';
  window.scrollTo(0, 0);
  
  startMemory(bazaSlow, aktualnaGloska, () => {
    gwiazdki += 5;
    gwiazdkiWTygodniu += 5;
    document.getElementById('stars-count').textContent = gwiazdki;
    pokazKonfetti();
    odtworzDzwiek(true);
    sprawdzOdznaki();
    zapiszDaneDoBazy();
  });
};

window.pokazHistoryjki = function() {
  ukryjWszystkieWidoki();
  document.getElementById('historyjki-view').style.display = 'block';
  window.scrollTo(0, 0);
  
  startHistoryjki(bazaSlow, (nowaHistoryjka) => {
    historyjki.push(nowaHistoryjka);
    zapiszDaneDoBazy();
  });
};

window.uruchomMatme = function(dzialanie) {
  ukryjWszystkieWidoki();
  startMatma(dzialanie, (rodzajGry) => {
    dodajGwiazdkeMatma(rodzajGry); 
  }, () => {
    odejmijGwiazdkeMatma();
  });
};

window.uruchomZgadnij = function() {
  ukryjWszystkieWidoki();
  startZgadnijDzwiek(() => {
    dodajGwiazdkeZgadnij();
  }, () => {
    odejmijGwiazdkeZgadnij();
  });
};

window.wyjdzZMatmy = wyjdzZMatmy;
window.nastepneZadanie = nastepneZadanie;

window.wyjdzZZgadnij = wyjdzZZgadnij;
window.nastepneZgadnij = nastepnePytanie;
// PRZYPISUJEMY NOWĄ NAZWĘ DO PRZYCISKU GŁOŚNIKA
window.odtworzZgadnijDzwiek = odtworzDzwiekLektora; 

window.pokazPanelRodzica = function() {
  ukryjWszystkieWidoki();
  document.getElementById('parent-panel-view').style.display = 'block';
  window.scrollTo(0, 0);
  
  let totalWords = 0;
  let najczestszaGloska = '-';
  let maxProb = 0;

  let historyHTML = '';
  const gloskiKlucze = Object.keys(historiaCwiczen);
  
  if (gloskiKlucze.length === 0) {
    historyHTML = '<div style="text-align: center; color: #9ca3af; padding: 10px;">Brak danych. Zacznij ćwiczyć!</div>';
  } else {
    gloskiKlucze.forEach(gloska => {
      const dane = historiaCwiczen[gloska];
      const sukcesy = dane.sukcesy || 0;
      const proby = dane.proby || 0;
      totalWords += sukcesy;
      
      if (proby > maxProb) {
        maxProb = proby;
        najczestszaGloska = gloska;
      }

      historyHTML += `<div class="history-item"><span>Głoska: <strong>${gloska}</strong></span> <span>${sukcesy}/${proby} udanych prób</span></div>`;
    });
  }

  let raportTekst = "Zacznij ćwiczyć, aby zobaczyć raport!";
  if (totalWords > 0) {
    raportTekst = `W tym tygodniu Twoje dziecko poprawnie wypowiedziało ${totalWords} słów. Najczęściej ćwiczyło głoskę ${najczestszaGloska}. Świetna robota!`;
  }

  renderujPanelRodzica({
    gwiazdki: gwiazdki,
    gwiazdkiWTygodniu: gwiazdkiWTygodniu,
    statystykiGier: statystykiGier,
    streak: streak,
    dniCwiczen: streak,
    celTygodniowy: celTygodniowy,
    totalWords: totalWords,
    historiaHTML: historyHTML,
    raportTekst: raportTekst,
    odznaki: odznaki
  });
};

window.zapiszCelWTle = function(targetValue) {
  if (isNaN(targetValue) || targetValue <= 0) {
    alert('Podaj poprawną liczbę gwiazdek (np. 50).');
    return;
  }
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
    odtworzDzwiek(false);
    
    if (!historiaCwiczen[aktualnaGloska]) {
      historiaCwiczen[aktualnaGloska] = { proby: 0, sukcesy: 0 };
    }
    historiaCwiczen[aktualnaGloska].proby++;
    zapiszDaneDoBazy();
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

// --- RYSOWANIE ---
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

// --- PAYWALL I AUTORYZACJA ---
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
    pokazMenu();
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
    pokazMenu();
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
    
    aktualizujStatusPro(user);

    await wczytajDaneZbazy();
  } else {
    aktualnyUzytkownik = null;
    loginBtn.style.display = 'block';
    userInfo.style.display = 'none';
    panelBtn.style.display = 'none';
    gwiazdki = 0;
    gwiazdkiWTygodniu = 0;
    statystykiGier = { mowa: 0, dodawanie: 0, odejmowanie: 0, mnozenie: 0, dzielenie: 0, zgadnij: 0 };
    historiaCwiczen = {};
    streak = 0;
    ostatniaDataCwiczenia = null;
    celTygodniowy = 0;
    odznaki = {};
    historyjki = [];
    document.getElementById('stars-count').textContent = '0';
    
    aktualizujStatusPro(null);
    renderujKafelki();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderujKafelki(); 
  initNagrywanie(); 
  pokazLanding();
});