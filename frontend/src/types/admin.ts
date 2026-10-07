export interface RecentOrder {
  id: number
  customerName: string
  status: string
  totalAmount: number
  createdAt: string
}

export interface Dashboard {
  totalProducts: number
  totalCustomers: number
  totalOrders: number
  totalSales: number
  lowStockVariants: number
  recentOrders: RecentOrder[]


  
}

export interface AdminOrder {
  id: number
  customerName: string
  customerEmail: string
  status: string
  totalAmount: number
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  createdAt: string
  items: {
    variantId: number
    productName: string
    size: string
    color: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }[]
}



export interface Customer {
  id: number
  fullName: string
  email: string
  phone: string | null
  registeredAt: string
  orderCount: number
  totalSpent: number
}

export interface InventoryItem {
  variantId: number
  productId: number
  productName: string
  categoryName: string
  size: string
  color: string
  stock: number
}