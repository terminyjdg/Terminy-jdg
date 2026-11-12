// --- NAWIGACJA MIĘDZY STRONAMI ---
window.pokazAplikacje = function() {
  document.getElementById('landing-view').style.display = 'none';
  document.getElementById('invoice-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'block';
  window.scrollTo(0, 0);
  odswiezDaty(); 
};

window.pokazLanding = function() {
  document.getElementById('app-view').style.display = 'none';
  document.getElementById('invoice-view').style.display = 'none';
  document.getElementById('landing-view').style.display = 'block';
  window.scrollTo(0, 0);
};

// --- WIDOK GENERATORA FAKTUR ---
window.pokazFaktury = function() {
  document.getElementById('landing-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'none';
  document.getElementById('invoice-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.pokazGlowna = function() {
  document.getElementById('invoice-view').style.display = 'none';
  document.getElementById('landing-view').style.display = 'block';
  window.scrollTo(0, 0);
};

// --- GENERATOR FAKTUR (PAYWALL) ---
window.generujFakture = function() {
  // Zamiast generować, pokazujemy okienko Premium
  window.pokazPaywall();
};

// --- PAYWALL (OKIENKO PREMIUM) ---
window.pokazPaywall = function() {
  document.getElementById('paywall-modal').style.display = 'flex';
};

window.zamknijPaywall = function() {
  document.getElementById('paywall-modal').style.display = 'none';
};

// --- INTELIGENTNE POWIADOMIENIA (BANER) ---
function sprawdzOstrzezenia() {
  const dZus = obliczDni(10);
  const dPit = obliczDni(20);
  const dVat = obliczDni(25);
  const banner = document.getElementById('alert-banner');
  let ostrzezenie = '';

  if (dZus <= 3 && dZus > 0) ostrzezenie = `⚠️ Uwaga! Do opłacenia ZUS zostały ${dZus} dni!`;
  else if (dPit <= 3 && dPit > 0) ostrzezenie = `⚠️ Uwaga! Do opłacenia PIT zostały ${dPit} dni!`;
  else if (dVat <= 3 && dVat > 0) ostrzezenie = `⚠️ Uwaga! Do opłacenia VAT zostały ${dVat} dni!`;

  if (ostrzezenie) {
    banner.textContent = ostrzezenie;
    banner.style.display = 'block';
  }
}

// --- PODUSZKA FINANSOWA ---
window.obliczPoduszke = function() {
  const income = parseFloat(document.getElementById('pillow-income').value);
  const resultBox = document.getElementById('pillow-result');

  if (isNaN(income) || income <= 0) {
    resultBox.style.display = 'none';
    return;
  }

  const zus = 1600;
  const tax = (income - zus) > 0 ? (income - zus) * 0.12 : 0;
  const totalTax = zus + tax;
  const safeToSpend = income - totalTax;

  document.getElementById('pillow-tax').textContent = Math.round(totalTax).toLocaleString('pl-PL') + ' zł';
  document.getElementById('pillow-safe').textContent = Math.round(safeToSpend).toLocaleString('pl-PL') + ' zł';
  
  resultBox.style.display = 'block';
};

// --- RESZTA (Tracker, Kalkulator, Ustawienia) ---
function zapiszStan() {
  const stan = {
    zus: document.getElementById('cb-zus')?.checked || false,
    pit: document.getElementById('cb-pit')?.checked || false,
    vat: document.getElementById('cb-vat')?.checked || false,
    ksef1: document.getElementById('ksef-1')?.checked || false,
    ksef2: document.getElementById('ksef-2')?.checked || false,
    ksef3: document.getElementById('ksef-3')?.checked || false,
    isVatPayer: document.getElementById('setting-vat')?.checked || false
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
  
  const settingVat = document.getElementById('setting-vat');
  if (settingVat && stan.isVatPayer !== undefined) {
    settingVat.checked = stan.isVatPayer;
    przelaczWidocznoscVat(stan.isVatPayer);
  }
}

function przelaczWidocznoscVat(jestPodatnikiem) {
  const kartaVat = document.getElementById('karta-vat');
  if (kartaVat) kartaVat.style.display = jestPodatnikiem ? 'flex' : 'none';
}

function obliczDni(dzien) {
  const dzisiaj = new Date();
  let termin = new Date(dzisiaj.getFullYear(), dzisiaj.getMonth(), dzien);
  if (dzisiaj > termin) termin = new Date(dzisiaj.getFullYear(), dzisiaj.getMonth() + 1, dzien);
  return Math.ceil((termin - dzisiaj) / (1000 * 60 * 60 * 24));
}

function odswiezDaty() {
  const dZus = obliczDni(10);
  const dPit = obliczDni(20);
  const dVat = obliczDni(25);
  const datas = document.querySelectorAll('.termin-data');
  if (datas.length >= 3) {
    datas[0].innerHTML = `Termin: 10. dzień <br><strong style="color:${dZus <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dZus} dni!</strong>`;
    datas[1].innerHTML = `Termin: 20. dzień <br><strong style="color:${dPit <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dPit} dni!</strong>`;
    datas[2].innerHTML = `Termin: 25. dzień <br><strong style="color:${dVat <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dVat} dni!</strong>`;
  }
}

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
  const zus = 1600; 
  let tax = 0;
  let net = 0;

  if (type === 'liniowy') {
    tax = (income - zus) * 0.19;
    net = income - zus - tax;
  } else if (type === 'ryczalt') {
    tax = income * 0.12;
    net = income - zus - tax;
  } else {
    tax = (income - zus) * 0.12;
    net = income - zus - tax;
  }

  if (tax < 0) tax = 0;
  if (net < 0) net = 0;

  document.getElementById('res-zus').textContent = zus.toLocaleString('pl-PL') + ' zł';
  document.getElementById('res-tax').textContent = Math.round(tax).toLocaleString('pl-PL') + ' zł';
  document.getElementById('res-net').textContent = Math.round(net).toLocaleString('pl-PL') + ' zł';
};

document.addEventListener('DOMContentLoaded', () => {
  wczytajStan();
  sprawdzOstrzezenia();
  
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.id === 'setting-vat') przelaczWidocznoscVat(cb.checked);
      zapiszStan();
    });
  });
});