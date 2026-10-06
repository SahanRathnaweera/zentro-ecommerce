import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Login from './pages/Login'
import Orders from './pages/Orders'
import ProductDetails from './pages/ProductDetails'
import Products from './pages/Products'
import Register from './pages/Register'
import AdminProducts from './admin/AdminProducts'
import ProductForm from './admin/ProductForm'
import AdminCategories from './admin/AdminCategories'
import AdminOrders from './admin/AdminOrders'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />

              {/* Admin area: admin only */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Dashboard />} />
                                <Route path="products" element={<AdminProducts />} />
                <Route path="products/add" element={<ProductForm />} />
                <Route path="products/edit/:id" element={<ProductForm />} />
                                <Route path="categories" element={<AdminCategories />} />
                                                <Route path="orders" element={<AdminOrders />} />
              </Route>
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App