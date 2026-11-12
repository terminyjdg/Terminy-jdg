// --- LOGIKA ZAPISU STANU ---
// Przypisujemy unikalne ID do każdego checkboxa i zapisujemy jego stan osobno.
// Dzięki temu odświeżenie strony niczego nie kasuje.

function zapiszStan() {
  const stan = {
    zus: document.getElementById('cb-zus')?.checked || false,
    pit: document.getElementById('cb-pit')?.checked || false,
    vat: document.getElementById('cb-vat')?.checked || false,
    ksef1: document.getElementById('ksef-1')?.checked || false,
    ksef2: document.getElementById('ksef-2')?.checked || false,
    ksef3: document.getElementById('ksef-3')?.checked || false
  };
  localStorage.setItem('terminy_jdg_dane', JSON.stringify(stan));
}

function wczytajStan() {
  const dane = localStorage.getItem('terminy_jdg_dane');
  if (!dane) return;
  
  const stan = JSON.parse(dane);
  
  if (document.getElementById('cb-zus')) document.getElementById('cb-zus').checked = stan.zus;
  if (document.getElementById('cb-pit')) document.getElementById('cb-pit').checked = stan.pit;
  if (document.getElementById('cb-vat')) document.getElementById('cb-vat').checked = stan.vat;
  if (document.getElementById('ksef-1')) document.getElementById('ksef-1').checked = stan.ksef1;
  if (document.getElementById('ksef-2')) document.getElementById('ksef-2').checked = stan.ksef2;
  if (document.getElementById('ksef-3')) document.getElementById('ksef-3').checked = stan.ksef3;
}

// Funkcja obliczająca dni do terminu
function obliczDni(dzien) {
  const dzisiaj = new Date();
  let termin = new Date(dzisiaj.getFullYear(), dzisiaj.getMonth(), dzien);
  if (dzisiaj > termin) {
    termin = new Date(dzisiaj.getFullYear(), dzisiaj.getMonth() + 1, dzien);
  }
  const dni = Math.ceil((termin - dzisiaj) / (1000 * 60 * 60 * 24));
  return dni;
}

function pokazAplikacje() {
  const app = document.getElementById('app-section');
  app.style.display = 'block';
  app.scrollIntoView({ behavior: 'smooth' });

  // Wczytaj zapisane checkboxy
  wczytajStan();

  // Zaktualizuj daty
  const dZus = obliczDni(10);
  const dPit = obliczDni(20);
  const dVat = obliczDni(25);

  if (document.querySelectorAll('.termin-data')[0]) {
    document.querySelectorAll('.termin-data')[0].innerHTML = `Termin: 10. dzień <br><strong style="color:${dZus <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dZus} dni!</strong>`;
    document.querySelectorAll('.termin-data')[1].innerHTML = `Termin: 20. dzień <br><strong style="color:${dPit <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dPit} dni!</strong>`;
    document.querySelectorAll('.termin-data')[2].innerHTML = `Termin: 25. dzień <br><strong style="color:${dVat <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dVat} dni!</strong>`;
  }
}

// Obsługa formularza
window.zapisz = function () {
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('msg');

  if (!email || !email.includes('@')) {
    msg.textContent = 'Podaj poprawny adres e-mail.';
    return;
  }

  msg.textContent = 'Zapisano pomyślnie! Oto Twój podgląd:';
  msg.style.color = '#bbf7d0';
  pokazAplikacje();
};

// Przypisanie zdarzeń po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
  // Dodajemy nasłuchiwanie na każdy checkbox (zmiana = natychmiastowy zapis)
  const wszystkieCheckboxy = document.querySelectorAll('input[type="checkbox"]');
  wszystkieCheckboxy.forEach(cb => {
    cb.addEventListener('change', zapiszStan);
  });

  // Obsługa przycisku zapisu
  const btnProgress = document.getElementById('btn-save-progress');
  if (btnProgress) {
    btnProgress.addEventListener('click', () => {
      zapiszStan(); // Dla pewności zapisujemy jeszcze raz
      alert('Postęp został trwale zapisany w Twojej przeglądarce!');
    });
  }
});