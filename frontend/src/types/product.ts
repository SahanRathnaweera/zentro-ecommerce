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