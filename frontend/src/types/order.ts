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
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  createdAt: string
  items: OrderItem[]
}

export interface CreateOrderData {
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  items: { variantId: number; quantity: number }[]
}