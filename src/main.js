// --- LOGIKA APLIKACJI (Tracker) ---

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
  
  // Jeśli termin już minął w tym miesiącu, przesuwamy na następny
  if (dzisiaj > termin) {
    termin = new Date(rok, miesiac + 1, dzienMiesiaca);
  }
  
  // Obliczamy różnicę w dniach
  const roznicaCzasu = termin.getTime() - dzisiaj.getTime();
  const dni = Math.ceil(roznicaCzasu / (1000 * 60 * 60 * 24));
  
  return dni;
}

function odswiezDaty() {
  // Znajdujemy karty i aktualizujemy tekst w nich
  const karty = document.querySelectorAll('.termin-card');
  
  if (karty.length >= 3) {
    // ZUS (10 dzień)
    const dniZus = obliczDniDoTerminu(10);
    karty[0].querySelector('span').innerHTML = `Termin: 10. dzień miesiąca <br><strong style="color:${dniZus <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dniZus} dni!</strong>`;
    
    // PIT (20 dzień)
    const dniPit = obliczDniDoTerminu(20);
    karty[1].querySelector('span').innerHTML = `Termin: 20. dzień miesiąca <br><strong style="color:${dniPit <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dniPit} dni!</strong>`;
    
    // VAT (25 dzień)
    const dniVat = obliczDniDoTerminu(25);
    karty[2].querySelector('span').innerHTML = `Termin: 25. dzień miesiąca <br><strong style="color:${dniVat <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dniVat} dni!</strong>`;
  }
}

// Zapisujemy stan checkboxów w pamięci telefonu (localStorage)
function zapiszStanCheckboxow() {
  const checkboxes = document.querySelectorAll('.termin-card input[type="checkbox"]');
  const stan = [];
  checkboxes.forEach((cb) => stan.push(cb.checked));
  localStorage.setItem('terminy_jdg_stan', JSON.stringify(stan));
}

function wczytajStanCheckboxow() {
  const zapisanyStan = localStorage.getItem('terminy_jdg_stan');
  if (zapisanyStan) {
    const stan = JSON.parse(zapisanyStan);
    const checkboxes = document.querySelectorAll('.termin-card input[type="checkbox"]');
    checkboxes.forEach((cb, index) => {
      if (stan[index] !== undefined) {
        cb.checked = stan[index];
      }
      // Nasłuchujemy kliknięć, żeby zapisać nowy stan
      cb.addEventListener('change', zapiszStanCheckboxow);
    });
  }
}

// Obsługa przycisku z formularza zapisu (na razie bez bazy, tylko pokazuje aplikację)
window.zapisz = function () {
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('msg');

  if (!email || !email.includes('@')) {
    msg.textContent = 'Podaj poprawny adres e-mail.';
    msg.className = 'err';
    return;
  }

  msg.textContent = 'Zapisano pomyślnie! Oto Twój podgląd:';
  msg.className = 'ok';
  pokazAplikacje();
};

// Inicjalizacja przy starcie strony
document.addEventListener('DOMContentLoaded', () => {
  const btnProgress = document.getElementById('btn-save-progress');
  if (btnProgress) {
    btnProgress.addEventListener('click', () => {
      alert('Postęp zapisany w pamięci telefonu! Możesz odświeżyć stronę.');
    });
  }
});