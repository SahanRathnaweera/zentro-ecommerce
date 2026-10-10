export interface OrderItem {
  variantId: number
  productName: string
  size: string
  color: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface Order {
  id: number
  status: string
  totalAmount: number
  contactEmail: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  createdAt: string
  items: OrderItem[]
  paymentMethod: 'COD' | 'CARD'
  paymentStatus: 'UNPAID' | 'PAID' | 'FAILED'
}

export interface CreateOrderData {
  contactEmail: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  paymentMethod: 'COD' | 'CARD'
  items: { variantId: number; quantity: number }[]
}