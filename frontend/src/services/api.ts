import type { Category } from '../types/category'

const API_BASE_URL = 'http://localhost:8080/api'

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`)

  if (!response.ok) {
    throw new Error(`Failed to load categories (status ${response.status})`)
  }

  return response.json()
}