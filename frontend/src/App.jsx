import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Alltoys from "./pages/Alltoys/Alltoys";
import Pdp from "./pages/Pdp/Pdp";
import Checkout from "./pages/Checkout/Checkout";
import Order from "./pages/Order/Order";
import Collection from "./pages/Collection/Collection";
import Product from "./pages/Product/Product";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminGuard from "./pages/Admin/AdminGuard";
import Dashboard from "./pages/Admin/Dashboard";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminCustomers from "./pages/Admin/AdminCustomers";
import CustomerRegister from "./pages/Auth/CustomerRegister";
import CustomerGuard from "./pages/Auth/CustomerGuard";
import MyOrders from "./pages/MyOrders/MyOrders.jsx";
import Login from "./pages/Auth/Login.jsx";
import Wishlist from "./pages/Wishlist/Wishlist.jsx";
import EditProfile from "./pages/EditProfile/EditProfile.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import PolicyPages from "./pages/Policy/PolicyPages";


function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!isAdminRoute && !isAuthRoute && <Navbar />}

      <main style={{ marginTop: !isAdminRoute && !isAuthRoute ? "140px" : "0" }}>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<CustomerRegister />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/Alltoys" element={<Alltoys />} />
          <Route path="/Pdp/:id" element={<Pdp />} />
          <Route path="/About" element={<About />} />
          <Route path="/Collection" element={<Collection />} />
          <Route path="/Product" element={<Product />} />
          <Route path="/policy/:slug" element={<PolicyPages />} />

          {/* ── Protected customer routes ── */}
          <Route path="/Order" element={<CustomerGuard><Order /></CustomerGuard>} />
          <Route path="/Checkout" element={<CustomerGuard><Checkout /></CustomerGuard>} />
          <Route path="/my-orders" element={<CustomerGuard><MyOrders /></CustomerGuard>} />
          <Route path="/wishlist" element={<CustomerGuard><Wishlist /></CustomerGuard>} />
          <Route path="/profile/edit" element={<CustomerGuard><EditProfile /></CustomerGuard>} />

          {/* ── Protected admin routes ── */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && !isAuthRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
