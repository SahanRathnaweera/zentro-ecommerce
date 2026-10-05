export interface Variant {
  id: number
  size: string
  color: string
  stock: number
}

export interface Product {
  id: number
  name: string
  description: string | null
  brand: string | null
  price: number
  discountPrice: number | null
  categoryId: number
  categoryName: string
  totalStock: number
  variants: Variant[]
  imageUrls: string[]
}

export interface ProductFormData {
  name: string
  description: string
  brand: string
  price: number
  discountPrice: number | null
  categoryId: number
  variants: { size: string; color: string; stock: number }[]
  imageUrls: string[]
}