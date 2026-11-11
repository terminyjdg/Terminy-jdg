import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ievdkkjijcvkaeg.supabase.co'
const supabaseKey = 'sb_publishable_Z6yw9Yc5t0dQ9tgPpLDqMg_9zvA2biD'
const supabase = createClient(supabaseUrl, supabaseKey)

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
                                    // Używamy .insert z tablicą obiektów - to standardowa metoda Supabase
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
                                                                                          console.error("Pełny błąd:", error) // To pomoże nam zdiagnozować, jeśli nadal nie działa
                                                                                              msg.textContent = 'Błąd: ' + (error.message || 'Nieznany błąd')
                                                                                                  msg.className = 'err'
                                                                                                    } finally {
                                                                                                        btn.disabled = false
                                                                                                          }
                                                                                                          }