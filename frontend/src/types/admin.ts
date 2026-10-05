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