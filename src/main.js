import { createClient } from '@supabase/supabase-js'

const supabaseUrl = '/api'
const supabaseKey = 'sb_publishable_Z6yw9Yc5t0dQ9tgPpLDqMg_9zvA2biD'

const supabase = createClient(supabaseUrl, supabaseKey)

window.pokazLanding = function() {
  document.querySelectorAll('#app-view, #auth-login-view, #auth-register-view, #invoice-view').forEach(el => el.style.display = 'none');
  document.getElementById('landing-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.pokazAplikacje = function() {
  document.querySelectorAll('#landing-view, #auth-login-view, #auth-register-view, #invoice-view').forEach(el => el.style.display = 'none');
  document.getElementById('app-view').style.display = 'block';
  window.scrollTo(0, 0);
  odswiezDaty();
};

window.pokazLogowanie = function() {
  document.querySelectorAll('#landing-view, #app-view, #auth-register-view, #invoice-view').forEach(el => el.style.display = 'none');
  document.getElementById('auth-login-view').style.display = 'flex';
  window.scrollTo(0, 0);
};

window.pokazRejestracje = function() {
  document.querySelectorAll('#landing-view, #app-view, #auth-login-view, #invoice-view').forEach(el => el.style.display = 'none');
  document.getElementById('auth-register-view').style.display = 'flex';
  window.scrollTo(0, 0);
};

window.pokazFaktury = function() {
  document.querySelectorAll('#landing-view, #app-view, #auth-login-view, #auth-register-view').forEach(el => el.style.display = 'none');
  document.getElementById('invoice-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.pokazGlowna = function() {
  document.getElementById('invoice-view').style.display = 'none';
  document.getElementById('landing-view').style.display = 'block';
  window.scrollTo(0, 0);
};

window.obsluzRejestracje = async function() {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const msg = document.getElementById('register-msg');
  
  msg.textContent = 'Przetwarzanie...'; msg.style.color = '#6b7280';

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    msg.textContent = error.message; msg.style.color = '#dc2626';
  } else {
    msg.textContent = 'Konto utworzone! Możesz się zalogować.'; msg.style.color = '#16a34a';
    setTimeout(() => pokazLogowanie(), 2000);
  }
};

window.obsluzLogowanie = async function() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const msg = document.getElementById('login-msg');

  msg.textContent = 'Przetwarzanie...'; msg.style.color = '#6b7280';

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    msg.textContent = error.message; msg.style.color = '#dc2626';
  } else {
    document.getElementById('user-email-display').textContent = data.user.email;
    pokazAplikacje();
  }
};

window.wyloguj = async function() {
  await supabase.auth.signOut();
  document.getElementById('user-email-display').textContent = 'Niezalogowany';
  pokazLanding();
};

async function sprawdzSesje() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    document.getElementById('user-email-display').textContent = session.user.email;
  }
}

window.pokazPaywall = function(funkcja) {
  const textElem = document.getElementById('paywall-text');
  if (funkcja === "Generator Faktur") textElem.textContent = "Generator Faktur jest dostępny w planie PRO.";
  else if (funkcja === "Powiadomienia Push") textElem.textContent = "Powiadomienia Push są dostępne w planie PRO.";
  else textElem.textContent = "Ta funkcja jest dostępna w planie PRO.";
  document.getElementById('paywall-modal').style.display = 'flex';
};
window.zamknijPaywall = function() { document.getElementById('paywall-modal').style.display = 'none'; };
window.generujFakture = function() { window.pokazPaywall("Generator Faktur"); };

function obliczDni(dzien) {
  const dzisiaj = new Date();
  let termin = new Date(dzisiaj.getFullYear(), dzisiaj.getMonth(), dzien);
  if (dzisiaj > termin) termin = new Date(dzisiaj.getFullYear(), dzisiaj.getMonth() + 1, dzien);
  return Math.ceil((termin - dzisiaj) / (1000 * 60 * 60 * 24));
}

function odswiezDaty() {
  const dZus = obliczDni(10), dPit = obliczDni(20), dVat = obliczDni(25);
  const datas = document.querySelectorAll('.termin-data');
  if (datas.length >= 3) {
    datas[0].innerHTML = `Termin: 10. dzień <br><strong style="color:${dZus <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dZus} dni!</strong>`;
    datas[1].innerHTML = `Termin: 20. dzień <br><strong style="color:${dPit <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dPit} dni!</strong>`;
    datas[2].innerHTML = `Termin: 25. dzień <br><strong style="color:${dVat <= 3 ? '#dc2626' : '#16a34a'}">Zostało ${dVat} dni!</strong>`;
  }
}

window.obliczPodatki = function() {
  const income = parseFloat(document.getElementById('calc-income').value);
  const type = document.getElementById('calc-type').value;
  const resultBox = document.getElementById('calc-result');
  if (isNaN(income) || income <= 0) { resultBox.style.display = 'none'; return; }
  resultBox.style.display = 'block';
  const zus = 1600; let tax = 0, net = 0;
  if (type === 'liniowy') { tax = (income - zus) * 0.19; net = income - zus - tax; }
  else if (type === 'ryczalt') { tax = income * 0.12; net = income - zus - tax; }
  else { tax = (income - zus) * 0.12; net = income - zus - tax; }
  if (tax < 0) tax = 0; if (net < 0) net = 0;
  document.getElementById('res-zus').textContent = zus.toLocaleString('pl-PL') + ' zł';
  document.getElementById('res-tax').textContent = Math.round(tax).toLocaleString('pl-PL') + ' zł';
  document.getElementById('res-net').textContent = Math.round(net).toLocaleString('pl-PL') + ' zł';
};

window.obliczPoduszke = function() {
  const income = parseFloat(document.getElementById('pillow-income').value);
  const resultBox = document.getElementById('pillow-result');
  if (isNaN(income) || income <= 0) { resultBox.style.display = 'none'; return; }
  const zus = 1600; const tax = (income - zus) > 0 ? (income - zus) * 0.12 : 0;
  const totalTax = zus + tax;
  document.getElementById('pillow-tax').textContent = Math.round(totalTax).toLocaleString('pl-PL') + ' zł';
  document.getElementById('pillow-safe').textContent = Math.round(income - totalTax).toLocaleString('pl-PL') + ' zł';
  resultBox.style.display = 'block';
};

document.addEventListener('DOMContentLoaded', () => {
  sprawdzSesje();
});