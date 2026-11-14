// src/puzzle.js

// Obrazki, z których będziemy układać puzzle
const zwierzeta = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨']; 
const aktualnyObrazek = '🐶'; // Domyślny obrazek puzzli

let callbackSukces = null;
let aktualnyStan = []; // 8 elementów, null oznacza puste miejsce (jeszcze nie ułożone)

export function startPuzzle(onSukces) {
    callbackSukces = onSukces;
    
    document.getElementById('pamiec-menu-view').style.display = 'none';
    document.getElementById('puzzle-view').style.display = 'block';
    
    generujNowaPlansze();
}

export function wyjdzZPuzzli() {
    document.getElementById('puzzle-view').style.display = 'none';
    document.getElementById('pamiec-menu-view').style.display = 'block';
}

function generujNowaPlansze() {
    // Resetujemy planszę (8 elementów do ułożenia, 1 puste)
    aktualnyStan = Array(8).fill(null); 
    
    // Mieszamy dostępne elementy
    let elementyDoUlozenia = [...zwierzeta];
    elementyDoUlozenia.sort(() => Math.random() - 0.5);
    
    // Renderujemy planszę (miejsce docelowe)
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.dataset.index = i;
        slot.ondragover = (e) => e.preventDefault(); // Pozwalamy na upuszczanie
        slot.ondrop = (e) => upuscElement(e, i);
        grid.appendChild(slot);
    }
    
    // Renderujemy bazę z kafelkami do przeciągania
    const baza = document.getElementById('puzzle-baza');
    baza.innerHTML = '';
    
    elementyDoUlozenia.forEach(zwierze => {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        tile.innerText = zwierze;
        tile.draggable = true;
        tile.dataset.value = zwierze;
        
        // Obsługa Drag & Drop dla dotyku (mobile)
        tile.ontouchstart = (e) => {
            // Na mobile to trudniejsze, na razie upraszczamy: kliknięcie przenosi do pierwszego wolnego
            // W prawdziwym D&D na mobile używa się pointer events, ale to skomplikowane.
        };
        
        // Uproszczenie dla mobile: kliknięcie kafelka wkłada go w pierwsze wolne miejsce
        tile.onclick = () => {
            if (tile.parentElement.id === 'puzzle-baza') {
                // Znajdź pierwsze wolne miejsce
                const wolneMiejsce = aktualnyStan.indexOf(null);
                if (wolneMiejsce !== -1) {
                    umiescElement(zwierze, wolneMiejsce, tile);
                }
            }
        };

        baza.appendChild(tile);
    });
}

function upuscElement(e, index) {
    e.preventDefault();
    const wartosc = e.dataTransfer.getData("text");
    if (wartosc) {
        umiescElement(wartosc, index);
    }
}

function umiescElement(zwierze, index, tileElement = null) {
    // Jeśli miejsce jest już zajęte, ignorujemy
    if (aktualnyStan[index] !== null) return;

    aktualnyStan[index] = zwierze;
    
    // Znajdź slot i wstaw tam kafelek
    const slot = document.querySelector(`.puzzle-slot[data-index="${index}"]`);
    slot.innerText = zwierze;
    slot.style.background = '#fce7f3';
    slot.style.border = '2px solid #db2777';
    slot.style.cursor = 'default';
    
    // Usuń kafelek z bazy (jeśli był kliknięty)
    if (tileElement) {
        tileElement.remove();
    } else {
        // Jeśli to Drag & Drop, musimy znaleźć i usunąć element z bazy
        const baza = document.getElementById('puzzle-baza');
        const elementy = baza.querySelectorAll('.puzzle-tile');
        for (let el of elementy) {
            if (el.innerText === zwierze) {
                el.remove();
                break;
            }
        }
    }
    
    // Dźwięk "pstryknięcia"
    odtworzDzwiekPstrykniecia();
    
    // Sprawdź, czy wygraliśmy
    sprawdzWygrana();
}

function sprawdzWygrana() {
    // Sprawdzamy, czy wszystkie pola są zapełnione
    if (aktualnyStan.every(el => el !== null)) {
        // Sukces!
        pokazKonfetti();
        odtworzDzwiekSukcesu();
        if (callbackSukces) callbackSukces();
        
        setTimeout(() => {
            alert("Brawo! Ułożyłeś puzzle!");
            generujNowaPlansze();
        }, 500);
    }
}

function odtworzDzwiekPstrykniecia() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
}

function pokazKonfetti() {
    const colors = ['#db2777', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
        document.body.appendChild(confetti);
        setTimeout(() => { confetti.remove(); }, 3000);
    }
}

function odtworzDzwiekSukcesu() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); 
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.3);
}