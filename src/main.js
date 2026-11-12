import { createClient } from '@supabase/supabase-js'

// UWAGA: Wklej TU swój poprawny URL (kończący się na .supabase.co)
const supabaseUrl = 'https://ievdkkjijcvkaeg.supabase.co'
// UWAGA: Wklej TU swój klucz publiczny (sb_publishable_...)
const supabaseKey = 'sb_publishable_Z6yw9Yc5t0dQ9tgPpLDqMg_9zvA2biD'

const supabase = createClient(supabaseUrl, supabaseKey)

let isLoginMode = true;

// Przełączanie między logowaniem a rejestracją
window.przelaczTryb = function() {
  isLoginMode = !isLoginMode;
  document.getElementById('auth-title').textContent = isLoginMode ? 'Zaloguj się' : 'Zarejestruj się';
  document.getElementById('auth-submit').textContent = isLoginMode ? 'Zaloguj się' : 'Utwórz konto';
  document.getElementById('toggle-text').textContent = isLoginMode ? 'Zarejestruj się' : 'Zaloguj się';
  document.querySelector('.toggle-auth').innerHTML = isLoginMode 
    ? 'Nie masz konta? <span id="toggle-text">Zarejestruj się</span>' 
    : 'Masz już konto? <span id="toggle-text">Zaloguj się</span>';
  
  // Ponowne przypisanie onclicka po zmianie HTML
  document.querySelector('.toggle-auth').onclick = window.przelaczTryb;
  document.getElementById('auth-msg').textContent = '';
}

// Obsługa formularza
document.getElementById('auth-submit').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const msg = document.getElementById('auth-msg');
  const btn = document.getElementById('auth-submit');

  if (!email || !password) {
    msg.textContent = 'Wypełnij wszystkie pola.';
    msg.style.color = '#dc2626';
    return;
  }

  btn.disabled = true;
  msg.textContent = 'Przetwarzanie...';
  msg.style.color = '#6b7280';

  let error;

  if (isLoginMode) {
    // Logowanie
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    error = signInError;
  } else {
    // Rejestracja
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    error = signUpError;
  }

  if (error) {
    msg.textContent = error.message;
    msg.style.color = '#dc2626';
    btn.disabled = false;
  } else {
    if (!isLoginMode) {
      msg.textContent = 'Konto utworzone! Sprawdź pocztę (potwierdzenie).';
      msg.style.color = '#16a34a';
    } else {
      pokazAplikacje(email);
    }
    btn.disabled = false;
  }
});

// Wylogowanie
window.wyloguj = async function() {
  await supabase.auth.signOut();
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

// Pokazywanie aplikacji po zalogowaniu
function pokazAplikacje(email) {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'flex';
  document.getElementById('user-email-display').textContent = 'Zalogowany jako: ' + email;
  
  // Wczytaj stan z localStorage (na razie lokalnie, potem przeniesiemy do bazy)
  wczytajStanLokalny();
  odswiezDaty();
}

// Sprawdzanie przy starcie, czy użytkownik jest już zalogowany
async function sprawdzSesje() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    pokazAplikacje(session.user.email);
  }
}

// ... (reszta funkcji z poprzedniego pliku: odswiezDaty, zapiszStan, wczytajStanLokalny) ...
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

function obliczDni(dzien) {
  const dzisiaj = new Date();
  let termin = new Date(dzisiaj.getFullYear(), dzisiaj.getMonth(), dzien);
  if (dzisiaj > termin) termin = new Date(dzisiaj.getFullYear(), dzisiaj.getMonth() + 1, dzien);
  return Math.ceil((termin - dzisiaj) / (1000 * 60 * 60 * 24));
}

function wczytajStanLokalny() {
  const dane = localStorage.getItem('terminy_jdg_dane');
  if (!dane) return;
  const stan = JSON.parse(dane);
  if (document.getElementById('cb-zus')) document.getElementById('cb-zus').checked = stan.zus || false;
  if (document.getElementById('cb-pit')) document.getElementById('cb-pit').checked = stan.pit || false;
  if (document.getElementById('cb-vat')) document.getElementById('cb-vat').checked = stan.vat || false;
  if (document.getElementById('ksef-1')) document.getElementById('ksef-1').checked = stan.ksef1 || false;
  if (document.getElementById('ksef-2')) document.getElementById('ksef-2').checked = stan.ksef2 || false;
  if (document.getElementById('ksef-3')) document.getElementById('ksef-3').checked = stan.ksef3 || false;
}

// Zapis lokalny (na razie, dopóki nie podłączymy bazy)
function zapiszStanLokalny() {
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

// Podpinamy zapis do checkboxów
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', zapiszStanLokalny);
  });
  sprawdzSesje(); // Sprawdź, czy już jesteś zalogowany
});