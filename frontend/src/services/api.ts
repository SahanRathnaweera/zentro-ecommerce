import type { Category } from '../types/category'
import type { Product } from '../types/product'
import type { AuthResponse, RegisterData, User } from '../types/auth'
import type { CreateOrderData, Order } from '../types/order'

const API_BASE_URL = 'http://localhost:8080/api'

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`)

  if (!response.ok) {
    throw new Error(`Failed to load categories (status ${response.status})`)
  }

  return response.json()
}


export async function getProductById(id: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`)

  if (response.status === 404) {
    throw new Error('Product not found')
  }

  if (!response.ok) {
    throw new Error(`Failed to load product (status ${response.status})`)
  }

  return response.json()
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json()
    if (data.message) return data.message
    if (data.error) return data.error
  } catch {
    // The response had no JSON body
  }
  return fallback
}


function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function createOrder(token: string, data: CreateOrderData): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })

  if (response.status === 401) {
    throw new Error('Your session has expired. Please log in again.')
  }
  if (!response.ok) {
    throw new Error(await readError(response, `Could not place order (status ${response.status})`))
  }

  return response.json()
}

export async function getMyOrders(token: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: authHeaders(token),
  })

  if (response.status === 401) {
    throw new Error('Your session has expired. Please log in again.')
  }
  if (!response.ok) {
    throw new Error(`Failed to load orders (status ${response.status})`)
  }

  return response.json()
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (response.status === 401) {
    throw new Error('Invalid email or password')
  }
  if (!response.ok) {
    throw new Error(await readError(response, `Login failed (status ${response.status})`))
  }

  return response.json()
}

export async function registerRequest(data: RegisterData): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (response.status === 409) {
    throw new Error('This email is already registered')
  }
  if (!response.ok) {
    throw new Error(await readError(response, `Registration failed (status ${response.status})`))
  }

  return response.json()
}

export async function getProducts(categoryId?: number): Promise<Product[]> {
  const url =
    categoryId === undefined
      ? `${API_BASE_URL}/products`
      : `${API_BASE_URL}/products?categoryId=${categoryId}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to load products (status ${response.status})`)
  }

  return response.json()


  

  
}