// src/angielski.js

const bazaSlowAng = [
    { obrazek: "🍎", slowoPL: "Jabłko", opcjeEN: ["Apple", "Banana", "Cherry"] },
    { obrazek: "🍌", slowoPL: "Banan", opcjeEN: ["Banana", "Apple", "Orange"] },
    { obrazek: "🐶", slowoPL: "Pies", opcjeEN: ["Dog", "Cat", "Mouse"] },
    { obrazek: "🐱", slowoPL: "Kot", opcjeEN: ["Cat", "Dog", "Cow"] },
    { obrazek: "🚗", slowoPL: "Samochód", opcjeEN: ["Car", "Bus", "Train"] },
    { obrazek: "🏠", slowoPL: "Dom", opcjeEN: ["House", "Tree", "Sun"] },
    { obrazek: "☀️", slowoPL: "Słońce", opcjeEN: ["Sun", "Moon", "Star"] },
    { obrazek: "🌳", slowoPL: "Drzewo", opcjeEN: ["Tree", "Flower", "Grass"] },
    { obrazek: "🐟", slowoPL: "Ryba", opcjeEN: ["Fish", "Bird", "Cat"] },
    { obrazek: "🎈", slowoPL: "Balon", opcjeEN: ["Balloon", "Ball", "Kite"] }
];

let aktualnePytanie = null;
let callbackSukces = null;
let callbackBledna = null;

export function startAngielski(onSukces, onBledna) {
    callbackSukces = onSukces;
    callbackBledna = onBledna;
    
    document.getElementById('jezyki-menu-view').style.display = 'none';
    document.getElementById('angielski-game-view').style.display = 'block';
    
    generujPytanie();
}

export function wyjdzZAngielskiego() {
    document.getElementById('angielski-game-view').style.display = 'none';
    document.getElementById('jezyki-menu-view').style.display = 'block';
}

function generujPytanie() {
    // Losujemy słowo
    aktualnePytanie = bazaSlowAng[Math.floor(Math.random() * bazaSlowAng.length)];
    
    // Wyświetlamy obrazek
    document.getElementById('angielski-obrazek').innerText = aktualnePytanie.obrazek;
    
    // Wyświetlamy polskie słowo jako podpowiedź
    document.getElementById('angielski-slowo-pl').innerText = "Co to jest? (" + aktualnePytanie.slowoPL + ")";
    
    // Generujemy przyciski z opcjami (po angielsku)
    const opcjeGrid = document.getElementById('angielski-opcje');
    opcjeGrid.innerHTML = '';
    
    // Mieszamy opcje
    let opcje = [...aktualnePytanie.opcjeEN];
    opcje.sort(() => Math.random() - 0.5);
    
    opcje.forEach(slowo => {
        const btn = document.createElement('button');
        btn.className = 'math-answer-btn';
        btn.style.fontSize = '20px'; // Mniejsza czcionka, bo słowa są dłuższe
        btn.innerText = slowo;
        btn.onclick = () => sprawdzOdpowiedz(slowo, btn);
        opcjeGrid.appendChild(btn);
    });
}

function sprawdzOdpowiedz(slowo, btn) {
    const wszystkiePrzyciski = document.querySelectorAll('#angielski-opcje .math-answer-btn');
    wszystkiePrzyciski.forEach(b => b.disabled = true);

    if (slowo === aktualnePytanie.opcjeEN[0]) { // Pierwsza opcja w tablicy to zawsze poprawna
        btn.style.background = '#10b981';
        btn.style.color = 'white';
        
        // Dźwięk sukcesu
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); 
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);

        // Lektor czyta słowo
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(slowo);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }

        if (callbackSukces) callbackSukces();
        
        setTimeout(() => {
            generujPytanie();
        }, 1500);

    } else {
        btn.style.background = '#ef4444';
        btn.style.color = 'white';
        
        // Dźwięk błędu
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);

        // Podświetlenie poprawnej
        wszystkiePrzyciski.forEach(b => {
            if (b.innerText === aktualnePytanie.opcjeEN[0]) {
                b.style.background = '#10b981';
                b.style.color = 'white';
            }
        });

        // ODEJMOWANIE GWIAZDKI
        if (callbackBledna) callbackBledna();

        setTimeout(() => {
            generujPytanie();
        }, 2000);
    }
}