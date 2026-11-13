// src/historyjki.js

const dostepneObrazki = ['🐶', '🚗', '🏠', '☀️', '🌳', '🐱', '🍎', '🚀', '🌙', '⭐', '🎈', '🎁', '🦄', '🐉', '🍦'];
let aktualnaHistoryjka = [];
let callbackZapisu = null;

// Zmienne do nagrywania
let mediaRecorder = null;
let audioChunks = [];
let nagranieBase64 = null;

export function startHistoryjki(onZapisz) {
    callbackZapisu = onZapisz;
    aktualnaHistoryjka = [];
    nagranieBase64 = null;
    audioChunks = [];
    
    document.getElementById('menu-view').style.display = 'none';
    document.getElementById('historyjki-view').style.display = 'block';
    
    generujWyborObrazkow();
    odswiezPlansze();
}

export function wyjdzZHistoryjek() {
    document.getElementById('historyjki-view').style.display = 'none';
    document.getElementById('menu-view').style.display = 'block';
    aktualnaHistoryjka = [];
    nagranieBase64 = null;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
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
                nagranieBase64 = null; // Resetujemy nagranie, jeśli zmieniamy obrazki
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
    const btnNagraj = document.getElementById('historyjki-nagraj-btn');
    const btnZapisz = document.getElementById('historyjki-zapisz-btn');
    const btnWyczysc = document.getElementById('historyjki-wyczysc-btn');

    if (aktualnaHistoryjka.length === 3) {
        btnNagraj.style.display = 'block';
        if (nagranieBase64) {
            btnZapisz.style.display = 'block';
        } else {
            btnZapisz.style.display = 'none';
        }
    } else {
        btnNagraj.style.display = 'none';
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
    nagranieBase64 = null;
    audioChunks = [];
    odswiezPlansze();
}

export function nagrajHistoryjke() {
    const btnNagraj = document.getElementById('historyjki-nagraj-btn');
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        btnNagraj.innerText = "🎙️ Nagraj opowieść";
        btnNagraj.style.background = '#ec4899';
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    nagranieBase64 = reader.result; // To zapiszemy w bazie
                    odswiezPlansze(); // Pokaże przycisk "Zapisz"
                };
            };

            mediaRecorder.start();
            btnNagraj.innerText = "⏹️ Zatrzymaj nagrywanie";
            btnNagraj.style.background = '#ef4444';
        })
        .catch(err => {
            console.error("Błąd dostępu do mikrofonu:", err);
            alert("Aby nagrać historyjkę, musisz zezwolić na dostęp do mikrofonu.");
        });
}

export function odtworzNagranie() {
    if (nagranieBase64) {
        const audio = new Audio(nagranieBase64);
        audio.play();
    } else {
        alert("Najpierw nagraj historyjkę!");
    }
}

export function zapiszHistoryjke() {
    if (aktualnaHistoryjka.length === 3 && nagranieBase64) {
        if (callbackZapisu) {
            // Przekazujemy obrazki i nagranie
            callbackZapisu({ obrazki: [...aktualnaHistoryjka], audio: nagranieBase64 });
            
            // Efekt sukcesu
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
            oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); 
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);

            alert("Historyjka z nagraniem zapisana! Możesz ją zobaczyć w Panelu Rodzica.");
            aktualnaHistoryjka = [];
            nagranieBase64 = null;
            odswiezPlansze();
        }
    } else {
        alert("Najpierw ułóż historyjkę i nagraj opowieść!");
    }
}