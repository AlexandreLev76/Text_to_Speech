import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Rediriger vers la page d'accueil après la connexion
      router.push('/')
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      throw error
    }
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'inscription')
      }

      // Connexion automatique après l'inscription
      await login(email, password)
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      await signOut({
        redirect: true,
        callbackUrl: '/'
      })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      router.push('/')
    }
  }

  return {
    user: session?.user as User | null,
    loading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    register,
    logout
  }
} 