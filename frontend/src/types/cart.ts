export interface CartItem {
  variantId: number
  productId: number
  name: string
  imageUrl: string | null
  size: string
  color: string
  unitPrice: number
  quantity: number
  maxStock: number
}