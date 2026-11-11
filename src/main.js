import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ievdkkjijcvkaeg.supabase.co'
const supabaseKey = 'sb_publishable_Z6yw9Yc5t0dQ9tgPpLDqMg_9zvA2biD'
const supabase = createClient(supabaseUrl, supabaseKey)

// Funkcja pokazująca interfejs (używana po kliknięciu)
function pokazAplikacje() {
  const appSection = document.getElementById('app-section');
    appSection.style.display = 'block';
      appSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Główna funkcja zapisu z formularza
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

                                                                if (error) {
                                                                      throw error
                                                                          }

                                                                              msg.textContent = 'Dziękujemy! Jesteś na liście.'
                                                                                  msg.className = 'ok'
                                                                                      emailInput.value = ''
                                                                                        } catch (error) {
                                                                                            console.error("Pełny błąd:", error)
                                                                                                msg.textContent = 'Błąd bazy (zignoruj na razie): ' + (error.message || 'Brak połączenia')
                                                                                                    msg.className = 'err'
                                                                                                      } finally {
                                                                                                          btn.disabled = false
                                                                                                              // Na koniec, niezależnie od tego czy baza zadziałała czy nie, pokazujemy makietę!
                                                                                                                  pokazAplikacje()
                                                                                                                    }
                                                                                                                    }

                                                                                                                    // Obsługa przycisku "Zapisz postęp" w makiecie
                                                                                                                    document.addEventListener('DOMContentLoaded', () => {
                                                                                                                      const btnProgress = document.getElementById('btn-save-progress');
                                                                                                                        if (btnProgress) {
                                                                                                                            btnProgress.addEventListener('click', () => {
                                                                                                                                  alert('W pełnej wersji zapiszemy te statusy w bazie!');
                                                                                                                                      });
                                                                                                                                        }
                                                                                                                                        });