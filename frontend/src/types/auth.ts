export interface User {
  id: number
  fullName: string
  email: string
  phone: string | null
  role: 'ROLE_CUSTOMER' | 'ROLE_ADMIN'
}

export interface AuthResponse {
  token: string
  user: User
}

export interface RegisterData {
  fullName: string
  email: string
  password: string
  phone?: string
}