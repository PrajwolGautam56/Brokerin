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
import PGHostels from './pages/PGHostels';
import ScrollToTop from './components/common/ScrollToTop';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/AdminProperties';
import ServiceRequests from './pages/admin/ServiceRequests';
import PropertyRequests from './pages/admin/PropertyRequests';
import FurnitureRequests from './pages/admin/FurnitureRequests';
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
                      <Route path="services" element={<ServiceRequests />} />
                      <Route path="property-requests" element={<PropertyRequests />} />
                      <Route path="furniture-requests" element={<FurnitureRequests />} />
                      {/* Add more admin routes here */}
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <Home />
                  <Footer />
                </>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/properties" element={
                <>
                  <Navbar />
                  <Properties />
                  <Footer />
                </>
              } />
              <Route path="/property/:id" element={
                <>
                  <Navbar />
                  <PropertyDetails />
                  <Footer />
                </>
              } />
              <Route path="/services" element={
                <>
                  <Navbar />
                  <Services />
                  <Footer />
                </>
              } />
              <Route path="/furniture" element={
                <>
                  <Navbar />
                  <Furniture />
                  <Footer />
                </>
              } />
              <Route path="/about" element={
                <>
                  <Navbar />
                  <About />
                  <Footer />
                </>
              } />
              <Route path="/contact" element={
                <>
                  <Navbar />
                  <Contact />
                  <Footer />
                </>
              } />
              <Route path="/pg-hostels" element={
                <>
                  <Navbar />
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