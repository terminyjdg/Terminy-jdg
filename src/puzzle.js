// src/puzzle.js

// Baza dostępnych kategorii puzzli
const kategorie = [
    ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨'], // Zwierzęta
    ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🍑', '🍍'], // Owoce
    ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑'], // Pojazdy
    ['🦸‍♂️', '🦸‍♀️', '🦹‍♂️', '🦹‍♀️', '🧙‍♂️', '🧚‍♀️', '🧜‍♂️', '🧞‍♂️'], // Postacie
    ['🌻', '🌹', '🌷', '🌵', '🌲', '🌳', '🌴', '🍄'], // Przyroda
    ['🍕', '🍔', '🍟', '🌭', '🍿', '🥗', '🍩', '🍪']  // Jedzenie
];

let aktualnaKategoria = [];
let aktualnyStanPlanszy = [];
let callbackSukces = null;
let wybranyKafelek = null;

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
    // 1. Wybierz losową kategorię
    const losowaKategoria = kategorie[Math.floor(Math.random() * kategorie.length)];
    aktualnaKategoria = [...losowaKategoria];
    
    // 2. Zresetuj stan planszy (8 slotów)
    aktualnyStanPlanszy = Array(8).fill(null);
    
    // 3. Renderuj podgląd na górze
    const podglad = document.getElementById('puzzle-podglad');
    podglad.innerHTML = '';
    aktualnaKategoria.forEach(element => {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot-preview';
        slot.innerText = element;
        podglad.appendChild(slot);
    });

    // 4. Renderuj planszę docelową
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.dataset.index = i;
        
        // Obsługa Drag & Drop
        slot.ondragover = (e) => e.preventDefault(); 
        slot.ondrop = (e) => upuscElement(e, i);
        
        // Obsługa kliknięcia (mobile)
        slot.onclick = () => {
            if (aktualnyStanPlanszy[i] === null && wybranyKafelek !== null) {
                umiescElement(wybranyKafelek, i);
            }
        };
        
        grid.appendChild(slot);
    }
    
    // 5. Renderuj kafelki na dole
    const baza = document.getElementById('puzzle-baza');
    baza.innerHTML = '';
    
    // Tasujemy kafelki
    let potasowane = [...aktualnaKategoria];
    potasowane.sort(() => Math.random() - 0.5);
    
    potasowane.forEach(element => {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        tile.innerText = element;
        tile.draggable = true;
        tile.dataset.value = element;
        
        // Drag & Drop
        tile.ondragstart = (e) => {
            e.dataTransfer.setData("text", element);
        };
        
        // Kliknięcie (mobile)
        tile.onclick = () => {
            const wszystkieKafelki = baza.querySelectorAll('.puzzle-tile');
            wszystkieKafelki.forEach(t => t.style.border = '2px solid #db2777');
            tile.style.border = '4px solid #10b981';
            wybranyKafelek = element;
        };
        
        baza.appendChild(tile);
    });
    
    wybranyKafelek = null;
}

function upuscElement(e, index) {
    e.preventDefault();
    const wartosc = e.dataTransfer.getData("text");
    if (wartosc && aktualnyStanPlanszy[index] === null) {
        umiescElement(wartosc, index);
    }
}

function umiescElement(zwierze, index) {
    // Sprawdź, czy kafelek pasuje do docelowego miejsca
    if (zwierze !== aktualnaKategoria[index]) {
        odtworzDzwiekBledu();
        return;
    }

    // Dobry kafelek!
    aktualnyStanPlanszy[index] = zwierze;
    
    const slot = document.querySelector(`.puzzle-slot[data-index="${index}"]`);
    slot.innerText = zwierze;
    slot.style.background = '#fce7f3';
    slot.style.border = '2px solid #db2777';
    slot.onclick = null; 
    
    // Usuń kafelek z bazy
    const baza = document.getElementById('puzzle-baza');
    const elementy = baza.querySelectorAll('.puzzle-tile');
    for (let el of elementy) {
        if (el.innerText === zwierze) {
            el.remove();
            break;
        }
    }
    
    odtworzDzwiekPstrykniecia();
    sprawdzWygrana();
}

function sprawdzWygrana() {
    if (aktualnyStanPlanszy.every(el => el !== null)) {
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

function odtworzDzwiekBledu() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
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