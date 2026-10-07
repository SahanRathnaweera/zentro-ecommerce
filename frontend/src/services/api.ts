import type { AdminOrder, Customer, Dashboard, InventoryItem } from '../types/admin'
import type { AuthResponse, RegisterData, User } from '../types/auth'
import type { Category } from '../types/category'
import type { CreateOrderData, Order } from '../types/order'
import type { Product, ProductFormData } from '../types/product'

const API_BASE_URL = 'http://localhost:8080/api'

// ---------- helpers ----------

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

const SESSION_EXPIRED = 'Your session has expired. Please log in again.'

// ---------- public: categories & products ----------

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`)
  if (!response.ok) {
    throw new Error(`Failed to load categories (status ${response.status})`)
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

// ---------- auth ----------

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

// ---------- orders (customer / guest) ----------

export async function createOrder(token: string | null, data: CreateOrderData): Promise<Order> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  if (response.status === 401) {
    throw new Error(SESSION_EXPIRED)
  }
  if (!response.ok) {
    throw new Error(await readError(response, `Could not place order (status ${response.status})`))
  }
  return response.json()
}

export async function getMyOrders(token: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/orders`, { headers: authHeaders(token) })
  if (response.status === 401) {
    throw new Error(SESSION_EXPIRED)
  }
  if (!response.ok) {
    throw new Error(`Failed to load orders (status ${response.status})`)
  }
  return response.json()
}

export async function trackOrder(id: number, email: string): Promise<Order> {
  const params = new URLSearchParams({ id: String(id), email })
  const response = await fetch(`${API_BASE_URL}/orders/track?${params.toString()}`)
  if (response.status === 404) {
    throw new Error('We could not find an order with those details.')
  }
  if (!response.ok) {
    throw new Error(`Could not look up the order (status ${response.status})`)
  }
  return response.json()
}

// ---------- admin: dashboard ----------

export async function getDashboard(token: string): Promise<Dashboard> {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers: authHeaders(token) })
  if (response.status === 401) {
    throw new Error(SESSION_EXPIRED)
  }
  if (response.status === 403) {
    throw new Error('You do not have permission to view this page.')
  }
  if (!response.ok) {
    throw new Error(`Failed to load dashboard (status ${response.status})`)
  }
  return response.json()
}

// ---------- admin: products ----------

export async function adminCreateProduct(token: string, data: ProductFormData): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (response.status === 401) throw new Error(SESSION_EXPIRED)
  if (!response.ok) {
    throw new Error(await readError(response, `Could not create product (status ${response.status})`))
  }
  return response.json()
}

export async function adminUpdateProduct(
  token: string,
  id: number,
  data: ProductFormData,
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (response.status === 401) throw new Error(SESSION_EXPIRED)
  if (!response.ok) {
    throw new Error(await readError(response, `Could not update product (status ${response.status})`))
  }
  return response.json()
}

export async function adminDeleteProduct(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (response.status === 401) throw new Error(SESSION_EXPIRED)
  if (!response.ok) {
    throw new Error(await readError(response, `Could not delete product (status ${response.status})`))
  }
}

// ---------- admin: categories ----------

export async function adminSaveCategory(
  token: string,
  data: { name: string; description: string },
  id?: number,
): Promise<Category> {
  const response = await fetch(
    id === undefined ? `${API_BASE_URL}/admin/categories` : `${API_BASE_URL}/admin/categories/${id}`,
    {
      method: id === undefined ? 'POST' : 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    },
  )
  if (response.status === 401) throw new Error(SESSION_EXPIRED)
  if (response.status === 409) throw new Error('A category with this name already exists')
  if (!response.ok) {
    throw new Error(await readError(response, `Could not save category (status ${response.status})`))
  }
  return response.json()
}

export async function adminDeleteCategory(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (response.status === 401) throw new Error(SESSION_EXPIRED)
  if (!response.ok) {
    throw new Error(await readError(response, `Could not delete category (status ${response.status})`))
  }
}

// ---------- admin: orders ----------

export async function adminGetOrders(token: string): Promise<AdminOrder[]> {
  const response = await fetch(`${API_BASE_URL}/admin/orders`, { headers: authHeaders(token) })
  if (response.status === 401) throw new Error(SESSION_EXPIRED)
  if (!response.ok) throw new Error(`Failed to load orders (status ${response.status})`)
  return response.json()
}

export async function adminUpdateOrderStatus(
  token: string,
  id: number,
  status: string,
): Promise<AdminOrder> {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  })
  if (response.status === 401) throw new Error(SESSION_EXPIRED)
  if (!response.ok) {
    throw new Error(await readError(response, `Could not update status (status ${response.status})`))
  }
  return response.json()
}

// ---------- admin: customers ----------

export async function adminGetCustomers(token: string): Promise<Customer[]> {
  const response = await fetch(`${API_BASE_URL}/admin/customers`, { headers: authHeaders(token) })
  if (response.status === 401) throw new Error(SESSION_EXPIRED)
  if (!response.ok) throw new Error(`Failed to load customers (status ${response.status})`)
  return response.json()
}

// ---------- admin: inventory ----------

export async function adminGetInventory(token: string): Promise<InventoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/admin/inventory`, { headers: authHeaders(token) })
  if (response.status === 401) throw new Error(SESSION_EXPIRED)
  if (!response.ok) throw new Error(`Failed to load inventory (status ${response.status})`)
  return response.json()
}

export async function adminUpdateStock(
  token: string,
  variantId: number,
  stock: number,
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/admin/inventory/${variantId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ stock }),
  })
  if (response.status === 401) throw new Error(SESSION_EXPIRED)
  if (!response.ok) {
    throw new Error(await readError(response, `Could not update stock (status ${response.status})`))
  }
  return response.json()
}