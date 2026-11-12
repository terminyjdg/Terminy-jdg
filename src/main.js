// --- LOGIKA ZAPISU STANU ---
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

// --- DATY ---
function obliczDni(dzien) {
  const dzisiaj = new Date();
  let termin = new Date(dzisiaj.getFullYear(), dzisiaj.getMonth(), dzien);
  if (dzisiaj > termin) termin = new Date(dzisiaj.getFullYear(), dzisiaj.getMonth() + 1, dzien);
  return Math.ceil((termin - dzisiaj) / (1000 * 60 * 60 * 24));
}

// --- GŁÓWNA FUNKCJA POKAZUJĄCA APLIKACJĘ ---
window.zapisz = function () {
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('msg');

  if (!email || !email.includes('@')) {
    msg.textContent = 'Podaj poprawny adres e-mail.';
    return;
  }

  msg.textContent = 'Odblokowano podgląd!';
  msg.style.color = '#bbf7d0';
  
  // Pokazujemy ukryty kontener
  document.getElementById('app-wrapper').style.display = 'block';
  document.getElementById('app-wrapper').scrollIntoView({ behavior: 'smooth' });

  // Inicjalizacja trackera
  wczytajStan();
  const dZus = obliczDni(10);
  const dPit = obliczDni(20);
  const dVat = obliczDni(25);
  const datas = document.querySelectorAll('.termin-data');
  if (datas.length >= 3) {
    datas[0].innerHTML = `Termin: 10. dzień <br><strong style="color:${dZus <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dZus} dni!</strong>`;
    datas[1].innerHTML = `Termin: 20. dzień <br><strong style="color:${dPit <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dPit} dni!</strong>`;
    datas[2].innerHTML = `Termin: 25. dzień <br><strong style="color:${dVat <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dVat} dni!</strong>`;
  }
};

// --- KALKULATOR PODATKOWY ---
window.obliczPodatki = function() {
  const incomeInput = document.getElementById('calc-income');
  const type = document.getElementById('calc-type').value;
  const resultBox = document.getElementById('calc-result');

  const income = parseFloat(incomeInput.value);

  if (isNaN(income) || income <= 0) {
    resultBox.style.display = 'none';
    return;
  }

  resultBox.style.display = 'block';

  // Uproszczone wyliczenia dla JDG (Ryczałt dla informatyków 12%)
  // ZUS (Duży ZUS w przybliżeniu): ok. 1600 zł (składki społeczne + zdrowotna)
  const zus = 1600; 
  
  let tax = 0;
  let net = 0;

  if (type === 'liniowy') {
    // Podatek liniowy 19% (zakładamy brak kosztów dla uproszczenia)
    tax = (income - zus) * 0.19;
    net = income - zus - tax;
  } 
  else if (type === 'ryczalt') {
    // Ryczałt 12% od przychodu (dla branży IT)
    tax = income * 0.12;
    net = income - zus - tax;
  } 
  else {
    // Skala podatkowa 12% (zakładamy, że dochód nie przekracza drugiego progu)
    tax = (income - zus) * 0.12;
    net = income - zus - tax;
  }

  // Zabezpieczenie przed ujemnymi wartościami
  if (tax < 0) tax = 0;
  if (net < 0) net = 0;

  // Wyświetlanie wyników
  document.getElementById('res-zus').textContent = zus.toLocaleString('pl-PL') + ' zł';
  document.getElementById('res-tax').textContent = Math.round(tax).toLocaleString('pl-PL') + ' zł';
  document.getElementById('res-net').textContent = Math.round(net).toLocaleString('pl-PL') + ' zł';
};

// --- INICJALIZACJA ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', zapiszStan);
  });
});