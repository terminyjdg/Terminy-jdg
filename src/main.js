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

  // Uproszczone wyliczenia (duży ZUS ok. 1600 zł)
  const zus = 1600; 
  let tax = 0;
  let net = 0;

  if (type === 'liniowy') {
    tax = (income - zus) * 0.19;
    net = income - zus - tax;
  } 
  else if (type === 'ryczalt') {
    tax = income * 0.12;
    net = income - zus - tax;
  } 
  else {
    tax = (income - zus) * 0.12;
    net = income - zus - tax;
  }

  if (tax < 0) tax = 0;
  if (net < 0) net = 0;

  document.getElementById('res-zus').textContent = zus.toLocaleString('pl-PL') + ' zł';
  document.getElementById('res-tax').textContent = Math.round(tax).toLocaleString('pl-PL') + ' zł';
  document.getElementById('res-net').textContent = Math.round(net).toLocaleString('pl-PL') + ' zł';
};

// --- INICJALIZACJA PRZY STARCIE ---
document.addEventListener('DOMContentLoaded', () => {
  // Wczytaj stan checkboxów i daty od razu
  wczytajStan();
  odswiezDaty();
  
  // Przypisz zapis do checkboxów
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', zapiszStan);
  });
});