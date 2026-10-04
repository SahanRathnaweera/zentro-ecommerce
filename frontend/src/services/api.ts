import type { Category } from '../types/category'
import type { Product } from '../types/product'

const API_BASE_URL = 'http://localhost:8080/api'

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