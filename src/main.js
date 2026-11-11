import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ievdkkjijcvkaeg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Z6yw9Yc5t0dQ9tgPpLDqMg_9zvA2biD'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

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

                                const { error } = await supabase.from('waitlist').insert({ email })

                                  if (error) {
                                      msg.textContent = 'Blad: ' + error.message
                                          msg.className = 'err'
                                            } else {
                                                msg.textContent = 'Dziekujemy! Jestes na liscie. Odezwiemy sie.'
                                                    msg.className = 'ok'
                                                        emailInput.value = ''
                                                          }
                                                            btn.disabled = false
                                                            }