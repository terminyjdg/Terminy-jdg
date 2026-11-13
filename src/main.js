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

// --- BOGATSZE SŁOWNIKI SŁÓW Z PRAWDZIWYMI KSZTAŁTAMI SVG ---
const slowa = {
  'R': [ 
    { 
      image: '🦀', word: 'RAK', 
      svg: '<path d="M60,80 Q80,60 100,80 Q120,60 140,80 L130,110 Q100,130 70,110 Z" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><path d="M50,100 L40,110 M50,110 L40,120 M150,100 L160,110 M150,110 L160,120" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '🚲', word: 'ROWER', 
      svg: '<circle cx="60" cy="120" r="30" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="140" cy="120" r="30" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><path d="M60,120 L100,80 L140,120 M100,80 L115,60 L130,60 M100,80 L100,100 L140,120 M60,120 L90,80 M90,80 L100,80" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '🐟', word: 'RYBA', 
      svg: '<path d="M50,100 Q80,50 120,100 Q80,150 50,100 Z M120,100 L160,80 L160,120 Z" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="70" cy="90" r="3" fill="#9ca3af"/>' 
    }, 
    { 
      image: '🌹', word: 'RÓŻA', 
      svg: '<path d="M100,40 C140,40 140,90 100,90 C60,90 60,40 100,40 Z M100,90 L100,160 M100,120 Q80,100 70,130 M100,130 Q120,110 130,140" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🦊', word: 'RYŚ', 
      svg: '<path d="M70,60 L50,40 L60,80 M130,60 L150,40 L140,80 M60,80 Q100,140 140,80 M80,110 Q100,130 120,110 M100,130 L100,170" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🥕', word: 'MARCHEWKA', 
      svg: '<path d="M100,40 Q140,100 100,160 Q60,100 100,40 M100,40 L80,20 M100,40 L120,20 M80,80 L100,90 M120,80 L100,90 M85,110 L105,120" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }
  ],
  'S': [ 
    { 
      image: '🦉', word: 'SOWA', 
      svg: '<circle cx="100" cy="100" r="50" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="80" cy="90" r="15" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="120" cy="90" r="15" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="80" cy="90" r="5" fill="#9ca3af"/><circle cx="120" cy="90" r="5" fill="#9ca3af"/><path d="M90,120 L110,120 L100,135 Z" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '🧀', word: 'SER', 
      svg: '<polygon points="50,150 150,150 150,100 100,50 50,100" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="100" cy="120" r="10" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="80" cy="90" r="8" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '☀️', word: 'SŁOŃCE', 
      svg: '<circle cx="100" cy="100" r="40" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><path d="M100,40 L100,20 M100,160 L100,180 M40,100 L20,100 M160,100 L180,100 M60,60 L40,40 M140,140 L160,160 M60,140 L40,160 M140,60 L160,40" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '🐘', word: 'SŁOŃ', 
      svg: '<circle cx="100" cy="100" r="50" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><path d="M60,100 Q30,120 50,160 M140,100 Q170,120 150,160 M100,150 L100,180 M80,180 L120,180" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🌲', word: 'SOSNA', 
      svg: '<polygon points="100,20 140,80 60,80 100,20" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><polygon points="100,60 160,130 40,130 100,60" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><rect x="90" y="130" width="20" height="40" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🍎', word: 'SOK', 
      svg: '<path d="M80,50 L80,150 L120,150 L120,50 Z" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><path d="M80,50 L120,50 L120,80 L80,80 Z" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }
  ],
  'C': [ 
    { 
      image: '🧅', word: 'CEBULA', 
      svg: '<path d="M100,50 Q150,100 100,150 Q50,100 100,50 M100,50 L100,20 M100,50 L80,30 M100,50 L120,30" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '🍋', word: 'CYTRYNA', 
      svg: '<ellipse cx="100" cy="100" rx="60" ry="40" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><path d="M40,100 L20,80 M160,100 L180,120" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '🎯', word: 'CEL', 
      svg: '<circle cx="100" cy="100" r="60" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="100" cy="100" r="40" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="100" cy="100" r="20" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '🌷', word: 'CUKIER', 
      svg: '<path d="M100,80 Q150,50 150,100 Q150,150 100,120 Q50,150 50,100 Q50,50 100,80 Z M100,120 L100,180" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🍪', word: 'CIASTKO', 
      svg: '<circle cx="100" cy="100" r="60" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="80" cy="80" r="5" fill="#9ca3af"/><circle cx="120" cy="90" r="5" fill="#9ca3af"/><circle cx="90" cy="120" r="5" fill="#9ca3af"/>' 
    },
    { 
      image: '🧹', word: 'CIASTO', 
      svg: '<path d="M50,50 L150,150 M140,40 L160,60 M40,140 L60,160" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }
  ],
  'L': [ 
    { 
      image: '🦁', word: 'LEW', 
      svg: '<circle cx="100" cy="100" r="40" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><path d="M100,60 L100,40 M100,140 L100,160 M60,100 L40,100 M140,100 L160,100 M75,75 L50,50 M125,125 L150,150 M75,125 L50,150 M125,75 L150,50" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '🪆', word: 'LALKA', 
      svg: '<circle cx="100" cy="70" r="30" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><path d="M100,100 L100,150 M70,130 L130,130 M100,150 L80,190 M100,150 L120,190" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '🍦', word: 'LODY', 
      svg: '<path d="M80,100 L120,100 L100,180 Z M80,100 Q100,50 120,100" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }, 
    { 
      image: '🌲', word: 'LAS', 
      svg: '<polygon points="100,20 140,80 60,80 100,20" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><polygon points="100,60 160,130 40,130 100,60" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><rect x="90" y="130" width="20" height="40" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🛏️', word: 'ŁÓŻKO', 
      svg: '<rect x="50" y="100" width="100" height="50" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><rect x="50" y="80" width="30" height="20" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🥄', word: 'ŁYŻKA', 
      svg: '<ellipse cx="100" cy="60" rx="20" ry="30" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><path d="M100,90 L100,180" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }
  ],
  'SZ': [ 
    { 
      image: '🧣', word: 'SZALIK', 
      svg: '<path d="M60,50 Q100,100 60,150 M140,50 Q100,100 140,150 M60,50 L140,50 M60,150 L140,150" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🐱', word: 'KOT', 
      svg: '<circle cx="100" cy="100" r="40" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><polygon points="70,70 50,40 80,60" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><polygon points="130,70 150,40 120,60" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🍎', word: 'GRUSZKA', 
      svg: '<path d="M100,60 Q120,60 120,90 Q140,120 120,150 Q100,170 80,150 Q60,120 80,90 Q80,60 100,60 Z M100,60 L100,40" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🚌', word: 'AUTOBUS', 
      svg: '<rect x="40" y="50" width="120" height="80" rx="10" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="70" cy="140" r="15" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="130" cy="140" r="15" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }
  ],
  'Ż': [ 
    { 
      image: '🐸', word: 'ŻABA', 
      svg: '<circle cx="100" cy="100" r="40" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="70" cy="80" r="15" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/><circle cx="130" cy="80" r="15" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🦒', word: 'ŻYRAFA', 
      svg: '<path d="M80,120 L80,50 L120,30 L120,120 M80,120 L60,180 M120,120 L140,180" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🍞', word: 'ŻYTNI', 
      svg: '<path d="M60,60 Q100,40 140,60 L140,140 Q100,160 60,140 Z" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    },
    { 
      image: '🔥', word: 'ŻAR', 
      svg: '<path d="M100,40 Q140,80 120,120 Q100,160 80,120 Q60,80 100,40 Z" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="8,8"/>' 
    }
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
    document.getElementById('stars-count').textContent = '0';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  pokazLanding();
});