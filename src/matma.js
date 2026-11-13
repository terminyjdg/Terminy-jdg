// src/matma.js

let aktualnyDzialanie = 'dodawanie';
let aktualnyWynik = 0;
let callbackSukces = null; // Funkcja z main.js do dodawania gwiazdek

export function startMatma(rodzaj, onSukces) {
    aktualnyDzialanie = rodzaj;
    callbackSukces = onSukces;
    
    // Ukrywamy menu i pokazujemy ekran gry
    document.getElementById('menu-view').style.display = 'none';
    document.getElementById('math-view').style.display = 'block';
    
    // Ustawiamy tytuł
    const tytuly = {
        'dodawanie': '➕ Dodawanie',
        'odejmowanie': '➖ Odejmowanie',
        'mnozenie': '✖️ Mnożenie',
        'dzielenie': '➗ Dzielenie'
    };
    document.getElementById('math-title').innerText = tytuly[rodzaj];
    
    generujZadanie();
}

export function wyjdzZMatmy() {
    document.getElementById('math-view').style.display = 'none';
    document.getElementById('menu-view').style.display = 'block';
}

function generujZadanie() {
    let a, b, dzialanieZnak, poprawnaOdpowiedz;
    let maxZakres = 10; // Zakres do 10 dla dzieci

    // Generowanie losowych liczb w zależności od działania
    if (aktualnyDzialanie === 'dodawanie') {
        a = Math.floor(Math.random() * maxZakres) + 1;
        b = Math.floor(Math.random() * maxZakres) + 1;
        poprawnaOdpowiedz = a + b;
        dzialanieZnak = '+';
    } else if (aktualnyDzialanie === 'odejmowanie') {
        a = Math.floor(Math.random() * maxZakres) + 2;
        b = Math.floor(Math.random() * (a - 1)) + 1; // b jest mniejsze od a, żeby nie było liczb ujemnych
        poprawnaOdpowiedz = a - b;
        dzialanieZnak = '-';
    } else if (aktualnyDzialanie === 'mnozenie') {
        a = Math.floor(Math.random() * 5) + 1; // do 5x5
        b = Math.floor(Math.random() * 5) + 1;
        poprawnaOdpowiedz = a * b;
        dzialanieZnak = '×';
    } else if (aktualnyDzialanie === 'dzielenie') {
        b = Math.floor(Math.random() * 5) + 1;
        poprawnaOdpowiedz = Math.floor(Math.random() * 5) + 1;
        a = b * poprawnaOdpowiedz; // a dzieli się bez reszty przez b
        dzialanieZnak = '÷';
    }

    aktualnyWynik = poprawnaOdpowiedz;

    // Wyświetlenie pytania
    document.getElementById('math-question').innerText = `${a} ${dzialanieZnak} ${b} = ?`;

    // Generowanie 4 odpowiedzi (1 poprawna, 3 błędne)
    let odpowiedzi = [poprawnaOdpowiedz];
    while (odpowiedzi.length < 4) {
        let bledna = poprawnaOdpowiedz + (Math.floor(Math.random() * 10) - 5); // Losowo -5 do +5
        if (bledna !== poprawnaOdpowiedz && bledna >= 0 && !odpowiedzi.includes(bledna)) {
            odpowiedzi.push(bledna);
        }
    }

    // Mieszanie odpowiedzi
    odpowiedzi.sort(() => Math.random() - 0.5);

    // Tworzenie przycisków
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
    // Blokada przycisków po kliknięciu
    const wszystkiePrzyciski = document.querySelectorAll('.math-answer-btn');
    wszystkiePrzyciski.forEach(b => b.disabled = true);

    if (odp === aktualnyWynik) {
        btn.style.background = '#10b981'; // Zielony
        btn.style.color = 'white';
        
        // Dźwięk sukcesu i gwiazdka (przekazane z main.js)
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); 
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);

        if (callbackSukces) callbackSukces(); // Dodaj gwiazdkę

        // Po chwili nowe zadanie
        setTimeout(generujZadanie, 1000);

    } else {
        btn.style.background = '#ef4444'; // Czerwony
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

        // Podświetlenie poprawnej odpowiedzi
        wszystkiePrzyciski.forEach(b => {
            if (parseInt(b.innerText) === aktualnyWynik) {
                b.style.background = '#10b981';
                b.style.color = 'white';
            }
        });

        // Po chwili nowe zadanie
        setTimeout(generujZadanie, 2000);
    }
}