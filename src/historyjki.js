// src/historyjki.js

const dostepneObrazki = ['🐶', '🚗', '🏠', '☀️', '🌳', '🐱', '🍎', '🚀', '🌙', '⭐', '🎈', '🎁', '🦄', '🐉', '🍦'];
let aktualnaHistoryjka = [];
let callbackZapisu = null;

export function startHistoryjki(onZapisz) {
    callbackZapisu = onZapisz;
    aktualnaHistoryjka = [];
    
    document.getElementById('menu-view').style.display = 'none';
    document.getElementById('historyjki-view').style.display = 'block';
    
    generujWyborObrazkow();
    odswiezPlansze();
}

export function wyjdzZHistoryjek() {
    document.getElementById('historyjki-view').style.display = 'none';
    document.getElementById('menu-view').style.display = 'block';
    aktualnaHistoryjka = [];
}

function generujWyborObrazkow() {
    const baza = document.getElementById('historyjki-baza');
    baza.innerHTML = '';
    
    dostepneObrazki.forEach(obrazek => {
        const btn = document.createElement('button');
        btn.className = 'historyjki-obrazek-btn';
        btn.innerText = obrazek;
        btn.onclick = () => dodajDoHistoryjki(obrazek);
        baza.appendChild(btn);
    });
}

function dodajDoHistoryjki(obrazek) {
    if (aktualnaHistoryjka.length >= 3) {
        alert("Historyjka może mieć maksymalnie 3 obrazki! Kliknij 'Wyczyść', aby zacząć od nowa.");
        return;
    }
    
    aktualnaHistoryjka.push(obrazek);
    odswiezPlansze();
}

function odswiezPlansze() {
    const plansza = document.getElementById('historyjki-plansza');
    plansza.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        const slot = document.createElement('div');
        slot.className = 'historyjki-slot';
        
        if (aktualnaHistoryjka[i]) {
            slot.innerText = aktualnaHistoryjka[i];
            slot.style.background = '#fdf2f8';
            slot.style.cursor = 'pointer';
            slot.title = "Kliknij, aby usunąć";
            slot.onclick = () => {
                aktualnaHistoryjka.splice(i, 1);
                odswiezPlansze();
            };
        } else {
            slot.innerText = '+';
            slot.style.color = '#cbd5e1';
            slot.style.background = '#f9fafb';
        }
        
        plansza.appendChild(slot);
    }

    // Zarządzanie przyciskami
    const btnZapisz = document.getElementById('historyjki-zapisz-btn');
    const btnWyczysc = document.getElementById('historyjki-wyczysc-btn');

    if (aktualnaHistoryjka.length === 3) {
        btnZapisz.style.display = 'block';
    } else {
        btnZapisz.style.display = 'none';
    }

    if (aktualnaHistoryjka.length > 0) {
        btnWyczysc.style.display = 'block';
    } else {
        btnWyczysc.style.display = 'none';
    }
}

export function wyczyscHistoryjke() {
    aktualnaHistoryjka = [];
    odswiezPlansze();
}

export function zapiszHistoryjke() {
    if (aktualnaHistoryjka.length === 3) {
        if (callbackZapisu) {
            callbackZapisu([...aktualnaHistoryjka]); // Przekazujemy kopię
            
            // Efekt sukcesu
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
            oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); 
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);

            alert("Historyjka zapisana! Możesz ją zobaczyć w Panelu Rodzica.");
            aktualnaHistoryjka = [];
            odswiezPlansze();
        }
    }
}