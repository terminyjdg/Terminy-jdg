import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ievdkkjijcvkaeg.supabase.co'
const supabaseKey = 'sb_publishable_Z6yw9Yc5t0dQ9tgPpLDqMg_9zvA2biD'
const supabase = createClient(supabaseUrl, supabaseKey)

function pokazAplikacje() {
  const appSection = document.getElementById('app-section');
  appSection.style.display = 'block';
  appSection.scrollIntoView({ behavior: 'smooth' });
}

// Definiujemy funkcję globalnie, żeby HTML mógł jej użyć
window.zapisz = async function () {
  const emailInput = document.getElementById('email')
  const email = emailInput.value.trim()
  const msg = document.getElementById('msg')
  const btn = document.getElementById('btn')

  if (!email || !email.includes('@')) {
    msg.textContent = 'Podaj poprawny adres e-mail.'
    msg.className = 'err'
    return
  }

  btn.disabled = true
  msg.textContent = 'Zapisywanie...'
  msg.className = ''

  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email: email }])
      .select()

    if (error) throw error

    msg.textContent = 'Dziękujemy! Jesteś na liście.'
    msg.className = 'ok'
    emailInput.value = ''
  } catch (error) {
    console.error("Błąd:", error)
    msg.textContent = 'Błąd bazy: ' + (error.message || 'Brak połączenia')
    msg.className = 'err'
  } finally {
    btn.disabled = false
    pokazAplikacje() // Pokazujemy terminarz niezależnie od błędu
  }
}

// Obsługa przycisku "Zapisz postęp" w terminarzu
document.addEventListener('DOMContentLoaded', () => {
  const btnProgress = document.getElementById('btn-save-progress');
  if (btnProgress) {
    btnProgress.addEventListener('click', () => {
      alert('W pełnej wersji zapiszemy te statusy w bazie!');
    });
  }
});