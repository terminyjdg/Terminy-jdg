// src/matma.js

let aktualnyDzialanie = 'dodawanie';
let aktualnyWynik = 0;
let callbackSukces = null;

export function startMatma(rodzaj, onSukces) {
    aktualnyDzialanie = rodzaj;
    callbackSukces = onSukces;
    
    document.getElementById('menu-view').style.display = 'none';
    document.getElementById('math-view').style.display = 'block';
    document.getElementById('math-next-btn').style.display = 'none';
    
    const tytuly = {
        'dodawanie': '➕ Dodawanie',
        'odejmowanie': '➖ Odejmowanie',
        'mnozenie': '✖️ Mnożenie',
        'dzielenie': '➗ Dzielenie'
    };
    document.getElementById('math-title').innerText = tytuly[rodzaj];
    
    const currentStars = document.getElementById('stars-count').innerText;
    document.getElementById('math-stars-count').innerText = currentStars;
    
    generujZadanie();
}

export function wyjdzZMatmy() {
    document.getElementById('math-view').style.display = 'none';
    document.getElementById('menu-view').style.display = 'block';
}

function generujZadanie() {
    // Resetujemy blokadę, aby można było zdobyć kolejną gwiazdkę
    window.czySlowoZaliczone = false;
    
    document.getElementById('math-next-btn').style.display = 'none';
    let a, b, dzialanieZnak, poprawnaOdpowiedz;
    let maxZakres = 10;

    if (aktualnyDzialanie === 'dodawanie') {
        a = Math.floor(Math.random() * maxZakres) + 1;
        b = Math.floor(Math.random() * maxZakres) + 1;
        poprawnaOdpowiedz = a + b;
        dzialanieZnak = '+';
    } else if (aktualnyDzialanie === 'odejmowanie') {
        a = Math.floor(Math.random() * maxZakres) + 2;
        b = Math.floor(Math.random() * (a - 1)) + 1;
        poprawnaOdpowiedz = a - b;
        dzialanieZnak = '-';
    } else if (aktualnyDzialanie === 'mnozenie') {
        a = Math.floor(Math.random() * 5) + 1; 
        b = Math.floor(Math.random() * 5) + 1;
        poprawnaOdpowiedz = a * b;
        dzialanieZnak = '×';
    } else if (aktualnyDzialanie === 'dzielenie') {
        b = Math.floor(Math.random() * 5) + 1;
        poprawnaOdpowiedz = Math.floor(Math.random() * 5) + 1;
        a = b * poprawnaOdpowiedz;
        dzialanieZnak = '÷';
    }

    aktualnyWynik = poprawnaOdpowiedz;
    document.getElementById('math-question').innerText = `${a} ${dzialanieZnak} ${b} = ?`;

    let odpowiedzi = [poprawnaOdpowiedz];
    while (odpowiedzi.length < 4) {
        let bledna = poprawnaOdpowiedz + (Math.floor(Math.random() * 10) - 5);
        if (bledna !== poprawnaOdpowiedz && bledna >= 0 && !odpowiedzi.includes(bledna)) {
            odpowiedzi.push(bledna);
        }
    }

    odpowiedzi.sort(() => Math.random() - 0.5);

    const answersGrid = document.getElementById('math-answers');
    answersGrid.innerHTML = '';
    
    odpowiedzi.forEach(odp => {
        const btn = document.createElement('button');
        btn.className = 'math-answer-btn';
        btn.innerText = odp;
        btn.onclick = () => sprawdzOdpowiedz(odp, btn);
        answersGrid.appendChild(btn);
    });
}

function sprawdzOdpowiedz(odp, btn) {
    const wszystkiePrzyciski = document.querySelectorAll('.math-answer-btn');
    wszystkiePrzyciski.forEach(b => b.disabled = true);

    if (odp === aktualnyWynik) {
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
            document.getElementById('math-stars-count').innerText = document.getElementById('stars-count').innerText;
            document.getElementById('math-next-btn').style.display = 'inline-block';
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
            if (parseInt(b.innerText) === aktualnyWynik) {
                b.style.background = '#10b981';
                b.style.color = 'white';
            }
        });

        setTimeout(() => {
            document.getElementById('math-next-btn').style.display = 'inline-block';
        }, 2000);
    }
}

export function nastepneZadanie() {
    generujZadanie();
}