'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ievdkkjijcvkaeg.supabase.co'
const supabaseKey = 'sb_publishable_Z6yw9Yc5t0dQ9tgPpLDqMg_9zvA2biD'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [msg, setMsg] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setMsg('Przetwarzanie...')
    
    let error;
    if (isLogin) {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      error = err
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      error = err
    }

    if (error) setMsg('Błąd: ' + error.message)
    else if (!isLogin) setMsg('Konto utworzone! Możesz się zalogować.')
    else setMsg('')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // ... (tutaj wstawiamy resztę kodu z trackerem ZUS/PIT/VAT i KSeF, identyczną jak wcześniej, tylko w formacie React) ...
}