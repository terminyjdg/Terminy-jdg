// src/zgadnij-dzwiek.js

const dzwieki = [
    { dzwiek: "Hau hau!", poprawnyObrazek: "🐶", inne: ["🐱", "🐭", "🐰"] },
    { dzwiek: "Miau!", poprawnyObrazek: "🐱", inne: ["🐶", "🐮", "🦊"] },
    { dzwiek: "Mułuuu!", poprawnyObrazek: "🐮", inne: ["🐷", "🐑", "🐴"] },
    { dzwiek: "Kwa kwa!", poprawnyObrazek: "🦆", inne: ["🐔", "🦅", "🦉"] },
    { dzwiek: "Pi pi pi!", poprawnyObrazek: "🐥", inne: ["🦆", "🦢", "🐧"] },
    { dzwiek: "Beee!", poprawnyObrazek: "🐑", inne: ["🐐", "🐮", "🐴"] },
    { dzwiek: "I-ha, i-ha!", poprawnyObrazek: "🐴", inne: ["🦓", "🐪", "🦌"] },
    { dzwiek: "Wrrrr!", poprawnyObrazek: "🚗", inne: ["✈️", "🚁", "🚲"] },
    { dzwiek: "Dzyń dzyń!", poprawnyObrazek: "🔔", inne: ["📞", "🔑", "🥁"] },
    { dzwiek: "Bum!", poprawnyObrazek: "🥁", inne: ["🎸", "🎺", "🎻"] }
];

let aktualnePytanie = null;
let callbackSukces = null;
let callbackBledna = null;

export function startZgadnijDzwiek(onSukces, onBledna) {
    callbackSukces = onSukces;
    callbackBledna = onBledna;
    
    document.getElementById('menu-view').style.display = 'none';
    document.getElementById('zgadnij-view').style.display = 'block';
    
    // Pobieramy aktualną liczbę gwiazdek
    const currentStars = document.getElementById('stars-count').innerText;
    document.getElementById('zgadnij-stars-count').innerText = currentStars;
    
    generujPytanie();
}

export function wyjdzZZgadnij() {
    document.getElementById('zgadnij-view').style.display = 'none';
    document.getElementById('menu-view').style.display = 'block';
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function generujPytanie() {
    document.getElementById('zgadnij-next-btn').style.display = 'none';
    
    // Losujemy pytanie
    aktualnePytanie = dzwieki[Math.floor(Math.random() * dzwieki.length)];
    
    // Przygotowujemy odpowiedzi (1 poprawna, 3 błędne)
    let odpowiedzi = [aktualnePytanie.poprawnyObrazek, ...aktualnePytanie.inne];
    odpowiedzi.sort(() => Math.random() - 0.5); // Mieszamy
    
    // Renderujemy przyciski
    const answersGrid = document.getElementById('zgadnij-answers');
    answersGrid.innerHTML = '';
    
    odpowiedzi.forEach(obrazek => {
        const btn = document.createElement('button');
        btn.className = 'math-answer-btn'; // Używamy tych samych stylów co w matmie
        btn.style.fontSize = '50px'; // Większe emoji
        btn.innerText = obrazek;
        btn.onclick = () => sprawdzOdpowiedz(obrazek, btn);
        answersGrid.appendChild(btn);
    });
    
    // Automatyczne odtworzenie dźwięku po chwili
    setTimeout(() => {
        odtworzDzwiek();
    }, 500);
}

export function odtworzDzwiek() {
    if (!aktualnePytanie) return;
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Zatrzymaj poprzednie
        const utterance = new SpeechSynthesisUtterance(aktualnePytanie.dzwiek);
        utterance.lang = 'pl-PL';
        utterance.rate = 0.9; // Trochę wolniej dla dzieci
        utterance.pitch = 1.2; // Wyższy głos
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Twoja przeglądarka nie wspiera odtwarzania dźwięku.");
    }
}

function sprawdzOdpowiedz(odp, btn) {
    const wszystkiePrzyciski = document.querySelectorAll('#zgadnij-answers .math-answer-btn');
    wszystkiePrzyciski.forEach(b => b.disabled = true);

    if (odp === aktualnePytanie.poprawnyObrazek) {
        btn.style.background = '#10b981';
        btn.style.color = 'white';
        
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
            document.getElementById('zgadnij-stars-count').innerText = document.getElementById('stars-count').innerText;
            document.getElementById('zgadnij-next-btn').style.display = 'inline-block';
        }, 500);

    } else {
        btn.style.background = '#ef4444';
        btn.style.color = 'white';
        
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);

        wszystkiePrzyciski.forEach(b => {
            if (b.innerText === aktualnePytanie.poprawnyObrazek) {
                b.style.background = '#10b981';
                b.style.color = 'white';
            }
        });

        if (callbackBledna) callbackBledna();

        setTimeout(() => {
            document.getElementById('zgadnij-stars-count').innerText = document.getElementById('stars-count').innerText;
            document.getElementById('zgadnij-next-btn').style.display = 'inline-block';
        }, 2000);
    }
}

export function nastepnePytanie() {
    generujPytanie();
}