import { createClient } from '../lib/supabase/client'

export class AuthService {
  /**
   * Sign in with email and password using the client-side Supabase instance.
   */
  static async signIn(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  }

  /**
   * Sign out the current user.
   */
  static async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }

  /**
   * Get the currently logged-in user.
   */
  static async getUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Error fetching user:', error.message)
      return null
    }

    return user
  }

  /**
   * Check if the current user is an admin.
   */
  static async isAdmin() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      console.error('Error fetching user role:', error?.message)
      return false
    }

    return profile.role === 'admin'
  }
}
