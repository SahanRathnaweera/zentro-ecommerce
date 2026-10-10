import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminCategories from './admin/AdminCategories'
import AdminCustomers from './admin/AdminCustomers'
import AdminInventory from './admin/AdminInventory'
import AdminLayout from './admin/AdminLayout'
import AdminOrders from './admin/AdminOrders'
import AdminProducts from './admin/AdminProducts'
import Dashboard from './admin/Dashboard'
import ProductForm from './admin/ProductForm'
import AdminRoute from './components/AdminRoute'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Login from './pages/Login'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import PaymentResult from './pages/PaymentResult'
import ProductDetails from './pages/ProductDetails'
import Products from './pages/Products'
import Register from './pages/Register'
import TrackOrder from './pages/TrackOrder'

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
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/payment-success" element={<PaymentResult success />} />
              <Route path="/payment-cancelled" element={<PaymentResult success={false} />} />
              <Route path="/track" element={<TrackOrder />} />
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
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="inventory" element={<AdminInventory />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App