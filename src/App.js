import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import Services from './pages/Services';
import Furniture from './pages/Furniture';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/common/ErrorBoundary';
import PropertyDetails from './pages/PropertyDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PGHostels from './pages/PGHostels';
import ScrollToTop from './components/common/ScrollToTop';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/AdminProperties';
import ServiceRequests from './pages/admin/ServiceRequests';
import PropertyRequests from './pages/admin/PropertyRequests';
import FurnitureRequests from './pages/admin/FurnitureRequests';
import AdminFurniture from './pages/admin/AdminFurniture';
import AdminUsers from './pages/admin/AdminUsers';
import ContactInquiries from './pages/admin/ContactInquiries';
import RentalManagement from './pages/admin/RentalManagement';
import RentalDashboard from './pages/admin/RentalDashboard';
import TransactionManagement from './pages/admin/TransactionManagement';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import MyServiceBookings from './pages/MyServiceBookings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TransactionHistory from './pages/TransactionHistory';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <div className="App">
            <ScrollToTop />
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route index element={<Dashboard />} />
                      <Route path="properties" element={<AdminProperties />} />
                      <Route path="furniture" element={<AdminFurniture />} />
                      <Route path="services" element={<ServiceRequests />} />
                      <Route path="property-requests" element={<PropertyRequests />} />
                      <Route path="furniture-requests" element={<FurnitureRequests />} />
                      <Route path="rentals" element={<RentalManagement />} />
                      <Route path="rental-dashboard" element={<RentalDashboard />} />
                      <Route path="transactions" element={<TransactionManagement />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="enquiries" element={<ContactInquiries />} />
                      {/* Add more admin routes here */}
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <Home />
                  <Footer />
                </>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <ForgotPassword />
                  <Footer />
                </>
              } />
              <Route path="/reset-password" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <ResetPassword />
                  <Footer />
                </>
              } />
              <Route path="/properties" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <Properties />
                  <Footer />
                </>
              } />
              <Route path="/property/:id" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <PropertyDetails />
                  <Footer />
                </>
              } />
              <Route path="/services" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <Services />
                  <Footer />
                </>
              } />
              <Route path="/furniture" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <Furniture />
                  <Footer />
                </>
              } />
              <Route path="/about" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <About />
                  <Footer />
                </>
              } />
              <Route path="/contact" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <Contact />
                  <Footer />
                </>
              } />
              <Route path="/privacy-policy" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <PrivacyPolicy />
                  <Footer />
                </>
              } />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <div className="h-24" />
                    <UserDashboard />
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <div className="h-24" />
                    <UserProfile />
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <div className="h-24" />
                    <MyServiceBookings />
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <div className="h-24" />
                    <TransactionHistory />
                    <Footer />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/pg-hostels" element={
                <>
                  <Navbar />
                  <div className="h-24" />
                  <PGHostels />
                  <Footer />
                </>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App; 