// --- LOGIKA APLIKACJI (Tracker i KSeF) ---

function pokazAplikacje() {
  const appSection = document.getElementById('app-section');
  appSection.style.display = 'block';
  appSection.scrollIntoView({ behavior: 'smooth' });
  odswiezDaty();
  wczytajStanCheckboxow();
}

// Funkcja obliczająca dni do terminu
function obliczDniDoTerminu(dzienMiesiaca) {
  const dzisiaj = new Date();
  const rok = dzisiaj.getFullYear();
  const miesiac = dzisiaj.getMonth();
  
  let termin = new Date(rok, miesiac, dzienMiesiaca);
  
  if (dzisiaj > termin) {
    termin = new Date(rok, miesiac + 1, dzienMiesiaca);
  }
  
  const roznicaCzasu = termin.getTime() - dzisiaj.getTime();
  const dni = Math.ceil(roznicaCzasu / (1000 * 60 * 60 * 24));
  
  return dni;
}

function odswiezDaty() {
  const karty = document.querySelectorAll('.termin-card');
  
  if (karty.length >= 3) {
    const dniZus = obliczDniDoTerminu(10);
    karty[0].querySelector('.termin-data').innerHTML = `Termin: 10. dzień miesiąca <br><strong style="color:${dniZus <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dniZus} dni!</strong>`;
    
    const dniPit = obliczDniDoTerminu(20);
    karty[1].querySelector('.termin-data').innerHTML = `Termin: 20. dzień miesiąca <br><strong style="color:${dniPit <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dniPit} dni!</strong>`;
    
    const dniVat = obliczDniDoTerminu(25);
    karty[2].querySelector('.termin-data').innerHTML = `Termin: 25. dzień miesiąca <br><strong style="color:${dniVat <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dniVat} dni!</strong>`;
  }
}

// Zapisujemy stan checkboxów (zarówno terminy, jak i KSeF)
function zapiszStanCheckboxow() {
  const checkboxes = document.querySelectorAll('.termin-card input[type="checkbox"], .ksef-check');
  const stan = [];
  checkboxes.forEach((cb) => stan.push(cb.checked));
  localStorage.setItem('terminy_jdg_stan', JSON.stringify(stan));
}

function wczytajStanCheckboxow() {
  const zapisanyStan = localStorage.getItem('terminy_jdg_stan');
  if (zapisanyStan) {
    const stan = JSON.parse(zapisanyStan);
    const checkboxes = document.querySelectorAll('.termin-card input[type="checkbox"], .ksef-check');
    checkboxes.forEach((cb, index) => {
      if (stan[index] !== undefined) {
        cb.checked = stan[index];
      }
      cb.addEventListener('change', zapiszStanCheckboxow);
    });
  }
}

// Obsługa formularza zapisu (bez bazy, tylko pokazuje aplikację)
window.zapisz = function () {
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('msg');

  if (!email || !email.includes('@')) {
    msg.textContent = 'Podaj poprawny adres e-mail.';
    msg.className = 'err';
    return;
  }

  msg.textContent = 'Zapisano pomyślnie! Oto Twój podgląd:';
  msg.style.color = '#bbf7d0'; // Jasnozielony dla ciemnego tła
  pokazAplikacje();
};

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
  const btnProgress = document.getElementById('btn-save-progress');
  if (btnProgress) {
    btnProgress.addEventListener('click', () => {
      alert('Postęp zapisany w pamięci telefonu! Możesz odświeżyć stronę.');
    });
  }
});