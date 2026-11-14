// src/puzzle.js

// Tablica puzzli 3x3. Każdy element to inny fragment obrazka.
const obrazekPuzzle = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '']; 

let aktualnaPlansza = [];
let callbackSukces = null;

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
    // Resetujemy planszę do stanu początkowego
    aktualnaPlansza = [...obrazekPuzzle];
    
    // Mieszamy elementy (proste tasowanie Fishera-Yatesa), ale zostawiamy puste pole na końcu
    for (let i = aktualnaPlansza.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [aktualnaPlansza[i], aktualnaPlansza[j]] = [aktualnaPlansza[j], aktualnaPlansza[i]];
    }
    
    renderujPlansze();
}

function renderujPlansze() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    
    aktualnaPlansza.forEach((element, index) => {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        
        if (element === '') {
            tile.style.background = 'transparent';
            tile.style.border = 'none';
            tile.style.cursor = 'default';
        } else {
            tile.innerText = element;
            tile.style.background = '#fce7f3';
            tile.style.border = '2px solid #db2777';
            tile.onclick = () => przesunKafelek(index);
        }
        
        grid.appendChild(tile);
    });
}

function przesunKafelek(kliknietyIndex) {
    const pustyIndex = aktualnaPlansza.indexOf('');
    
    const czySasiaduje = sprawdzSasiedztwo(kliknietyIndex, pustyIndex);
    
    if (czySasiaduje) {
        // Zamień miejscami kliknięty kafelek z pustym polem
        [aktualnaPlansza[pustyIndex], aktualnaPlansza[kliknietyIndex]] = [aktualnaPlansza[kliknietyIndex], aktualnaPlansza[pustyIndex]];
        renderujPlansze();
        sprawdzWygrana();
    }
}

function sprawdzSasiedztwo(index1, index2) {
    const roznica = Math.abs(index1 - index2);
    
    // Ten sam rząd (różnica 1) i nie przekracza granicy rzędu
    const tenSamRzad = Math.floor(index1 / 3) === Math.floor(index2 / 3) && roznica === 1;
    
    // Ta sama kolumna (różnica 3)
    const taSamaKolumna = roznica === 3;
    
    return tenSamRzad || taSamaKolumna;
}

function sprawdzWygrana() {
    let wygrana = true;
    // Sprawdzamy, czy kolejność jest prawidłowa (od 0 do 8, gdzie 8 to puste pole)
    for (let i = 0; i < 8; i++) {
        if (aktualnaPlansza[i] !== obrazekPuzzle[i]) {
            wygrana = false;
            break;
        }
    }
    
    if (wygrana && aktualnaPlansza[8] === '') {
        // Sukces!
        pokazKonfetti();
        odtworzDzwiekSukcesu();
        if (callbackSukces) callbackSukces();
        
        // Po chwili resetujemy planszę
        setTimeout(() => {
            alert("Brawo! Ułożyłeś puzzle!");
            generujNowaPlansze();
        }, 500);
    }
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