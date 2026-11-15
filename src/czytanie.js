// src/czytanie.js

const bazaSlow = [
    { obrazek: "🍎", slowo: "JABŁKO", brakujacaLitera: "J", opcje: ["J", "K", "L"] },
    { obrazek: "🍌", slowo: "BANAN", brakujacaLitera: "B", opcje: ["B", "P", "D"] },
    { obrazek: "🐶", slowo: "PIES", brakujacaLitera: "P", opcje: ["P", "B", "T"] },
    { obrazek: "🐱", slowo: "KOT", brakujacaLitera: "K", opcje: ["K", "G", "T"] },
    { obrazek: "🚗", slowo: "SAMOCHÓD", brakujacaLitera: "S", opcje: ["S", "Z", "C"] },
    { obrazek: "🏠", slowo: "DOM", brakujacaLitera: "D", opcje: ["D", "T", "B"] },
    { obrazek: "☀️", slowo: "SŁOŃCE", brakujacaLitera: "S", opcje: ["S", "Ś", "C"] },
    { obrazek: "🌳", slowo: "DRZEWO", brakujacaLitera: "D", opcje: ["D", "T", "B"] },
    { obrazek: "🐟", slowo: "RYBA", brakujacaLitera: "R", opcje: ["R", "L", "P"] },
    { obrazek: "🎈", slowo: "BALON", brakujacaLitera: "B", opcje: ["B", "P", "D"] }
];

let aktualnePytanie = null;
let callbackSukces = null;
let callbackBledna = null;

export function startCzytanie(onSukces, onBledna) {
    callbackSukces = onSukces;
    callbackBledna = onBledna;
    
    document.getElementById('czytanie-menu-view').style.display = 'none';
    document.getElementById('czytanie-game-view').style.display = 'block';
    
    generujPytanie();
}

export function wyjdzZCzytania() {
    document.getElementById('czytanie-game-view').style.display = 'none';
    document.getElementById('czytanie-menu-view').style.display = 'block';
}

function generujPytanie() {
    // Losujemy słowo
    aktualnePytanie = bazaSlow[Math.floor(Math.random() * bazaSlow.length)];
    
    // Wyświetlamy obrazek
    document.getElementById('czytanie-obrazek').innerText = aktualnePytanie.obrazek;
    
    // Wyświetlamy słowo z luką
    let slowoZLuka = aktualnePytanie.slowo.replace(aktualnePytanie.brakujacaLitera, '_');
    document.getElementById('czytanie-slowo').innerText = slowoZLuka;
    
    // Generujemy przyciski z opcjami
    const opcjeGrid = document.getElementById('czytanie-opcje');
    opcjeGrid.innerHTML = '';
    
    // Mieszamy opcje
    let opcje = [...aktualnePytanie.opcje];
    opcje.sort(() => Math.random() - 0.5);
    
    opcje.forEach(litera => {
        const btn = document.createElement('button');
        btn.className = 'math-answer-btn';
        btn.innerText = litera;
        btn.onclick = () => sprawdzOdpowiedz(litera, btn);
        opcjeGrid.appendChild(btn);
    });
}

function sprawdzOdpowiedz(litera, btn) {
    const wszystkiePrzyciski = document.querySelectorAll('#czytanie-opcje .math-answer-btn');
    wszystkiePrzyciski.forEach(b => b.disabled = true);

    if (litera === aktualnePytanie.brakujacaLitera) {
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

        if (callbackSukces) callbackSukces();
        
        setTimeout(() => {
            generujPytanie();
        }, 1000);

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
            if (b.innerText === aktualnePytanie.brakujacaLitera) {
                b.style.background = '#10b981';
                b.style.color = 'white';
            }
        });

        // WYWOŁUJEMY ODEJMOWANIE GWIAZDKI
        if (callbackBledna) callbackBledna();

        setTimeout(() => {
            generujPytanie();
        }, 2000);
    }
}