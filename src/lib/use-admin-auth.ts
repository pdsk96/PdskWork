'use client'

import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from './firebase'

/**
 * Admin auth — Firebase Auth (client SDK).
 *
 * Static export has no server runtime, so there is no httpOnly session cookie.
 * The admin signs in with an email + password (a Firebase Auth user created in
 * the console). Firestore security rules require `request.auth != null` for
 * writes, so only authenticated users can manage posts.
 *
 * `useAdminAuth()` exposes the auth state + signIn/signOut for the admin UI.
 */

export interface AdminAuth {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOutAdmin: () => Promise<void>
}

export function useAdminAuth(): AdminAuth {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signOutAdmin() {
    await signOut(auth)
  }

  return { user, loading, signIn, signOutAdmin }
}
