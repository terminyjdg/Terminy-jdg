// Ten plik obsługuje logikę gry Memory

let karty = [];
let pierwszaKarta = null;
let drugaKarta = null;
let blokadaKlikania = false;
let paryZnalezione = 0;

// Funkcja startowa wywoływana z main.js
export function startMemory(bazaSlow, aktualnaGloska, callbackWygrana) {
  const slowa = bazaSlow[aktualnaGloska];
  
  // Bierzemy 8 słów (lub mniej, jeśli głoska ma mniej)
  const wybraneSlowa = slowa.slice(0, 8);
  const pary = [];
  
  wybraneSlowa.forEach(slowo => {
    pary.push({ id: slowo.word, img: slowo.image });
    pary.push({ id: slowo.word, img: slowo.image });
  });

  // Mieszamy karty
  karty = pary.sort(() => Math.random() - 0.5);
  paryZnalezione = 0;
  pierwszaKarta = null;
  drugaKarta = null;
  blokadaKlikania = false;

  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';

  karty.forEach((karta, index) => {
    const cardElement = document.createElement('div');
    cardElement.className = 'memory-card';
    cardElement.dataset.index = index;
    cardElement.dataset.id = karta.id;
    cardElement.innerText = karta.img;
    cardElement.onclick = () => odkryjKarte(cardElement, callbackWygrana);
    grid.appendChild(cardElement);
  });
}

function odkryjKarte(karta, callbackWygrana) {
  if (blokadaKlikania || karta.classList.contains('flipped') || karta.classList.contains('matched')) {
    return;
  }

  karta.classList.add('flipped');

  if (!pierwszaKarta) {
    pierwszaKarta = karta;
    return;
  }

  drugaKarta = karta;
  blokadaKlikania = true;

  sprawdzPare(callbackWygrana);
}

function sprawdzPare(callbackWygrana) {
  const czyPara = pierwszaKarta.dataset.id === drugaKarta.dataset.id;

  if (czyPara) {
    pierwszaKarta.classList.add('matched');
    drugaKarta.classList.add('matched');
    paryZnalezione++;
    
    resetujTure();

    // Sprawdzamy, czy to koniec gry
    if (paryZnalezione === karty.length / 2) {
      setTimeout(() => {
        alert('Brawo! Znalazłeś wszystkie pary! ⭐');
        callbackWygrana(); // Wywołujemy funkcję z main.js, która doda gwiazdki
      }, 500);
    }
  } else {
    setTimeout(() => {
      pierwszaKarta.classList.remove('flipped');
      drugaKarta.classList.remove('flipped');
      resetujTure();
    }, 1000);
  }
}

function resetujTure() {
  pierwszaKarta = null;
  drugaKarta = null;
  blokadaKlikania = false;
}