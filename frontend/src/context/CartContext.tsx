import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { CartItem } from '../types/cart'

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: CartItem) => void
  updateQuantity: (variantId: number, quantity: number) => void
  removeItem: (variantId: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEY = 'zentro_cart'

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  // Save the cart every time it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(newItem: CartItem) {
    setItems((current) => {
      const existing = current.find((i) => i.variantId === newItem.variantId)
      if (existing) {
        // Same variant already in the cart: increase quantity (never above stock)
        return current.map((i) =>
          i.variantId === newItem.variantId
            ? {
                ...i,
                quantity: Math.min(i.quantity + newItem.quantity, newItem.maxStock),
                maxStock: newItem.maxStock,
              }
            : i,
        )
      }
      return [...current, newItem]
    })
  }

  function updateQuantity(variantId: number, quantity: number) {
    setItems((current) =>
      current.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
          : i,
      ),
    )
  }

  function removeItem(variantId: number) {
    setItems((current) => current.filter((i) => i.variantId !== variantId))
  }

  function clearCart() {
    setItems([])
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}


export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider')
  }
  return context
}